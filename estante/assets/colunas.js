/* Estante — reading pages. Shows the latest pieces from each site of one section, side by side.
   Which sites, and how their article addresses look, is set in sites.js. */
(function () {
"use strict";

const MAX_ITEMS = 25;
const TIMEOUT_MS = 20000;
const ARCHIVE = "https://archive.is/newest/";

// A home page can't be read directly from another site's page, so it goes through relays.
// All are asked at once; the first good answer is shown, and a fuller one replaces it.
//   html: returns the page's code     md: returns the page as text (Jina's fallback)
//   raw:  returns the file untouched, so it can also read RSS feeds
const OWN = (window.ESTANTE.relay || "").trim();
const RELAYS = [
  ...(OWN ? [{ name: "Relay próprio", kind: "html", raw: true, limit: 6, url: u => OWN + (OWN.includes("?") ? "&" : "?") + "url=" + encodeURIComponent(u) }] : []),
  { name: "Jina", kind: "html", limit: 4, headers: { "X-Return-Format": "html" }, url: u => "https://r.jina.ai/" + u,
    fallback: { kind: "md", headers: {}, url: u => "https://r.jina.ai/" + u } },
  { name: "AllOrigins", kind: "html", raw: true, limit: 2, url: u => "https://api.allorigins.win/raw?url=" + encodeURIComponent(u) },
  { name: "CodeTabs", kind: "html", raw: true, limit: 2, url: u => "https://api.codetabs.com/v1/proxy/?quest=" + encodeURIComponent(u) }
];
const FRESH_MS = 15 * 60 * 1000;   // headlines younger than this are shown without asking the relays again

// Each relay takes only a few requests at a time; the rest wait their turn (public relays block bursts).
const queues = new Map();
function inTurn(relay, job) {
  const q = queues.get(relay.name) || { running: 0, waiting: [] };
  queues.set(relay.name, q);
  return new Promise((resolve, reject) => {
    const go = () => { q.running++; job().then(resolve, reject).finally(() => { q.running--; const next = q.waiting.shift(); if (next) next(); }); };
    if (q.running < (relay.limit || 3)) go(); else q.waiting.push(go);
  });
}

// First parts of an address that are never an article, for "loose" sites.
const NOT_ARTICLE = new Set(["tag", "tags", "category", "categoria", "categorias", "author", "autor", "autores", "authors",
  "page", "pagina", "wp-content", "wp-admin", "feed", "search", "busca", "about", "sobre", "contato", "contact",
  "assine", "assinatura", "newsletter", "newsletters", "privacy", "privacidade", "termos", "terms", "loja", "shop", "eventos", "events"]);

const MONTHS = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
function nameFromSlug(s) { return s.split("-").map(w => w ? w[0].toUpperCase() + w.slice(1) : w).join(" "); }
function clean(s) { return (s || "").replace(/\s+/g, " ").trim(); }
function esc(s) { return s.replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" })[c]); }

const EN_MONTHS = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, sept:8, oct:9, nov:10, dec:11 };
const DATE_RE = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:,?\s+\d{4})?$/;

// Splits a trailing date ("Nov 6", "November 6, 2026") off a piece of text.
function splitDate(t) {
  const m = t.match(DATE_RE);
  if (!m) return [t, ""];
  return [clean(t.slice(0, m.index)), `${+m[2]} ${MONTHS[EN_MONTHS[m[1].toLowerCase()]]}`];
}
// Text of an element with spaces between its parts, so "Julien Crockett" + "Nov 6" don't run together.
function spacedText(el) {
  const out = [];
  const walk = n => { for (const c of n.childNodes) { if (c.nodeType === 3) out.push(c.textContent); else if (c.nodeType === 1 && !/^(script|style|svg|noscript)$/i.test(c.tagName)) { const inline = /^(em|i|b|strong|cite|q|sup|sub|small|abbr|u|s|mark)$/i.test(c.tagName); if (!inline) out.push(" "); walk(c); if (!inline) out.push(" "); } } };
  walk(el);
  return clean(out.join(""));
}
// The separate blocks of text inside an element (author line, title, summary…), keeping italics etc. inside their block.
function chunks(el) {
  const out = [];
  let cur = "";
  const flush = () => { const t = clean(cur); if (t) out.push(t); cur = ""; };
  const walk = n => { for (const c of n.childNodes) {
    if (c.nodeType === 3) cur += c.textContent;
    else if (c.nodeType === 1 && !/^(script|style|svg|noscript|img|picture|figure)$/i.test(c.tagName)) {
      if (/^(em|i|b|strong|cite|q|sup|sub|small|abbr|u|s|mark)$/i.test(c.tagName)) walk(c);
      else { flush(); walk(c); flush(); }
    } } };
  walk(el); flush();
  return out;
}
const NAME_SMALL = new Set(["and", "&", "de", "da", "do", "dos", "das", "van", "von", "der", "di", "du", "le", "la", "bin", "al", "y", "e"]);
function nameLike(t) {
  if (!t || t.length > 120 || /[?!:;“”"]|\.$/.test(t)) return false;
  const words = t.replace(/^by\s+/i, "").split(/[\s,]+/).filter(w => w && !NAME_SMALL.has(w.toLowerCase()));
  return words.length >= 2 && words.length <= 20 && words.every(w => /^[\p{Lu}]/u.test(w) || /^\p{Lu}\.$/u.test(w));
}

// Last pass over every item, whatever the source: separates author, title and summary when they arrived glued together.
function tidy(it) {
  let { title, author, blurb, label } = it;
  if (author) { const [a, d] = splitDate(author); author = a; if (d && !label) label = d; }
  if (blurb && blurb.length > 15 && title !== blurb && title.includes(blurb)) {
    const i = title.indexOf(blurb);
    const before = clean(title.slice(0, i)), after = clean(title.slice(i + blurb.length));
    if (!before) { title = blurb; blurb = after; }                          // "Title Summary…" with the title as blurb
    else if (after && nameLike(before)) { author = author || before; title = blurb; blurb = after; } // "Author Title Summary"
    else { title = before; }                                                // "Title Summary" with the summary as blurb
  }
  if (author && title.startsWith(author + " ")) title = clean(title.slice(author.length));
  if (blurb) {
    let rest = blurb;
    for (const x of [author, title]) if (x) rest = rest.split(x).join(" ");
    if (clean(rest).length < 20) blurb = "";                                 // "Andrew Hartman Karl Marx in America"
  }
  return { ...it, title, author, blurb, label };
}

const RUBRIC = /\b(review|reviews|essay|interview|fiction|poetry|poems?|letters?|short cuts|short takes|diary|comment|podcast|online|issue|blog|culture|books|news|politics|art|film|music|television|theater|theatre|photography|history|science|read more|subscribe)\b/i;
// Bits of text that are never a title: "há 2 d", "3 h", "0" (comment counters), "Image 2: …", "Read more".
const JUNK = /^(há\s+\d+\s*\w*|\d+|\d+\s*(min|h|d|hrs?|hours?|minutes?|days?)(\s+(ago|atrás))?|image\s+\d+.*|read more|leia mais|continue reading|saiba mais|ouça|listen)$/i;

// Sorts the text blocks of one teaser into author, title and summary.
//   [author,] [kicker,] title [, summary…]
function assignParts(parts) {
  let p = parts.map(clean).filter(t => t && !JUNK.test(t) && !(DATE_RE.test(t) && t.length < 25));
  if (!p.length) return null;
  let author = "";
  if (p.length >= 2 && nameLike(p[0])) { author = p[0]; p = p.slice(1); }
  if (p.length >= 2) {
    const looksLikeSummary = t => /[.…?!]["”’]?$/.test(t) && t.length > 50 || t.length > 110;
    if (!looksLikeSummary(p[1]) && (p[0].split(" ").length <= 3 || /!$/.test(p[0])) && p[1].length >= p[0].length) p = p.slice(1); // drop kicker
  }
  return { author, title: p[0], blurb: p.slice(1).join(" ") };
}

const BLURB_CLASS = /(excerpt|dek|standfirst|summary|description|subtitle|subhead|teaser|blurb|lede|intro|strapline)/i;
const AUTHOR_CLASS = /(author|byline|contributor|writer)/i;
const AUTHOR_HREF = /\/(contributors?|authors?|writers?)\//i;

function matchArticle(site, href) {
  let url;
  try { url = new URL(href, site.home); } catch { return null; }
  if (![site.domain, ...site.alt].some(d => url.hostname === d || url.hostname.endsWith("." + d))) return null;
  if (site.skip && site.skip.test(url.pathname)) return null;
  const hit = (label, author) => ({ url: url.origin + url.pathname, key: url.origin + url.pathname.replace(/\/$/, ""), label: label || "", author: author || "" });
  for (const p of site.patterns) {
    const m = url.pathname.match(p.re);
    if (!m) continue;
    if (site.recent && p.date && (Date.now() - p.date(m)) > site.recent * 864e5) return null;   // old link (staff pages etc.)
    return hit(p.label ? p.label(m) : "", p.author ? p.author(m) : "");
  }
  // "loose": any address whose last part reads like an article title (four or more words joined by hyphens).
  if (site.loose) {
    const parts = url.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "";
    if (/^[a-z0-9_]+(?:-[a-z0-9_]+){3,}(?:\.[a-z]+)?$/.test(last) && !NOT_ARTICLE.has(parts[0])) {
      const sec = parts.length >= 2 && !/^\d+$/.test(parts[0]) ? parts[0] : "";
      return hit(sec ? (site.names[sec] || nameFromSlug(sec)) : "");
    }
  }
  return null;
}
function okTitle(t) { return t && t.length >= 6 && /\p{L}{3}/u.test(t) && !/^(read more|continue reading|more|leia mais|image \d+.*)$/i.test(t); }
function trim(t, n) { return t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t; }
function cleanAuthor(t) { t = clean(t).replace(/^by\s+/i, ""); return t.length > 2 && t.length < 140 ? t : ""; }

function pickImg(root, base) {
  for (const img of root.querySelectorAll("img, source")) {
    const cand = img.getAttribute("data-src") || img.getAttribute("data-lazy-src") || img.getAttribute("src") ||
                 (img.getAttribute("srcset") || img.getAttribute("data-srcset") || "").split(",").map(x => x.trim().split(/\s+/)[0]).filter(Boolean).pop();
    if (!cand || cand.startsWith("data:") || /\.svg(\?|$)/i.test(cand) || /logo|icon|avatar|sprite/i.test(cand)) continue;
    try { return new URL(cand, base).href; } catch {}
  }
  return "";
}

// HTML: for each article link, climb to the smallest block that holds only that article (its "card"),
// then read title, author, summary and image from that block.
function itemsFromHtml(site, html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const keyOf = new Map();
  for (const a of doc.querySelectorAll("a[href]")) { const m = matchArticle(site, a.getAttribute("href")); if (m) keyOf.set(a, m); }
  const keysIn = el => new Set([...el.querySelectorAll("a[href]")].map(a => keyOf.get(a)?.key).filter(Boolean));

  const found = new Map();
  for (const [a, m] of keyOf) {
    let card = a;
    for (let i = 0; i < 6 && card.parentElement && card.parentElement !== doc.body; i++) {
      if (keysIn(card.parentElement).size > 1) break;
      card = card.parentElement;
    }
    const h = card.querySelector("h1,h2,h3,h4") || a.closest("h1,h2,h3,h4");
    const src = h || a;
    let title = clean(src.textContent) || clean(a.getAttribute("title") || a.getAttribute("aria-label"));
    // A link that holds several blocks: [author,] title[, summary]
    let partAuthor = "", partBlurb = "";
    const parts = chunks(src).filter(t => (!DATE_RE.test(t) || t.length > 20) && !JUNK.test(t));
    if (parts.length >= 3 && nameLike(parts[0])) { partAuthor = parts[0]; title = parts[1]; partBlurb = parts.slice(2).join(" "); }
    else if (parts.length === 2) {
      if (parts[1].length > 60 || /[.…]$/.test(parts[1])) { title = parts[0]; partBlurb = parts[1]; }
      else if (nameLike(parts[0])) { partAuthor = parts[0]; title = parts[1]; }
    } else if (parts.length > 3) { title = parts[0]; partBlurb = parts.slice(1).join(" "); }

    let author = "";
    const authEl = [...card.querySelectorAll("*")].find(el => AUTHOR_CLASS.test(el.className && el.className.baseVal === undefined ? el.className : "") || el.getAttribute("itemprop") === "author" || el.getAttribute("rel") === "author")
                || [...card.querySelectorAll("a[href]")].find(x => AUTHOR_HREF.test(x.getAttribute("href")));
    if (authEl) author = cleanAuthor(spacedText(authEl));
    if (!author && partAuthor) author = cleanAuthor(partAuthor);
    if (!author) {
      const byEl = [...card.querySelectorAll("p,span,div")].find(el => el.children.length <= 2 && /^by\s/i.test(clean(el.textContent)) && clean(el.textContent).length < 90);
      if (byEl) author = cleanAuthor(byEl.textContent);
    }
    // Still no author: the block of text right before the title often is one ("Fintan O’Toole" above "The Next Generation").
    if (!author) {
      const all = chunks(card);
      const i = all.indexOf(title);
      if (i > 0 && nameLike(all[i - 1]) && !RUBRIC.test(all[i - 1])) author = cleanAuthor(all[i - 1]);
    }
    if (author && title.startsWith(author)) title = clean(title.slice(author.length));

    let blurb = "";
    const bEl = [...card.querySelectorAll("*")].find(el => typeof el.className === "string" && BLURB_CLASS.test(el.className) && clean(el.textContent).length > 25);
    if (bEl) blurb = spacedText(bEl);
    if (partBlurb && (!blurb || blurb === title)) blurb = partBlurb;
    if (!blurb) {
      const p = [...card.querySelectorAll("p")].map(x => clean(x.textContent)).find(t => t.length > 40 && t !== title && !t.includes(title));
      if (p) blurb = p;
    }
    if (blurb === title || (author && blurb === author)) blurb = "";

    const image = pickImg(card, site.home);
    if (!okTitle(title)) continue;
    const score = (h ? 1000 : 0) + (image ? 200 : 0) + (blurb ? 200 : 0) + (author ? 100 : 0) + Math.min(title.length, 160);
    const item = { url: m.url, title: trim(title, 200), author: author || m.author, blurb: trim(blurb, 900), image, label: m.label, score };
    const prev = found.get(m.key);
    if (!prev) found.set(m.key, { ...item, order: found.size });
    else {
      for (const f of ["author", "blurb", "image"]) if (!prev[f] && item[f]) prev[f] = item[f];
      if (item.score > prev.score) { prev.title = item.title; prev.score = item.score; }
    }
  }
  return finish(found);
}

// Markdown (Jina's text version): each link to an article is a teaser. Its text is split into blocks
// (line breaks, bold, headings) and sorted into author / title / summary; an image inside the link is kept.
const PAREN_URL = "((?:[^()\\s]|\\([^()\\s]*\\))+)";          // URLs may contain "(…)", e.g. image filters
const MD_IMG = new RegExp("!\\[[^\\]]*\\]\\(" + PAREN_URL + "(?:\\s+\"[^\"]*\")?\\)", "g");
const MD_LINK = new RegExp("\\[((?:[^\\[\\]]|\\[[^\\]]*\\])*)\\]\\(" + PAREN_URL + "(?:\\s+\"[^\"]*\")?\\)", "g");
function itemsFromMarkdown(site, md) {
  const found = new Map();
  for (const m of md.matchAll(MD_LINK)) {
    const art = matchArticle(site, m[2]);
    if (!art) continue;
    const raw = m[1];
    const imgM = [...raw.matchAll(MD_IMG)].map(x => x[1]).find(u => !/logo|icon|avatar|\.svg/i.test(u));
    const text = raw.replace(MD_IMG, "\n")
      .replace(/\s+há\s+\d+\s*[a-zç]{0,5}\.?(?=\s)/gi, "\n")          // "há 2 d", "há 3 horas"
      .replace(/\s+\d+\s*$/, "");                                         // trailing comment counter
    const parts = text.split(/\n+|\*\*|__|\s#{1,6}\s|^#{1,6}\s|\\\\/).map(t => clean(t.replace(/[*_`#>]/g, "")));
    const got = assignParts(parts);
    // Plain lines right after the link may hold the author or the summary.
    let author = got ? got.author : "", blurb = got ? got.blurb : "";
    const after = md.slice(m.index + m[0].length, m.index + m[0].length + 1500).split("\n").slice(1, 7);
    for (const L of after) {
      if ([...L.matchAll(MD_LINK)].some(x => matchArticle(site, x[2]))) break;
      const t = clean(L.replace(MD_IMG, "").replace(MD_LINK, "$1").replace(/[*_`#>]/g, ""));
      if (!t || JUNK.test(t)) continue;
      if (!author && (/^by\s/i.test(t) || nameLike(t)) && t.length < 90) { author = cleanAuthor(t); continue; }
      if (!blurb && t.length > 40) blurb = t;
    }
    const title = got ? got.title : "";
    if (!okTitle(title)) continue;
    const heading = /(^|\n)\s*#{1,4}\s*$/.test(md.slice(Math.max(0, m.index - 6), m.index));
    const item = { url: art.url, title: trim(title, 200), author: author || art.author, blurb: trim(blurb === title ? "" : blurb, 900),
                   image: imgM ? new URL(imgM, site.home).href : "", label: art.label,
                   score: (heading ? 1000 : 0) + (imgM ? 200 : 0) + (blurb ? 200 : 0) + Math.min(title.length, 160) };
    const prev = found.get(art.key);
    if (!prev) found.set(art.key, { ...item, order: found.size });
    else {
      for (const f of ["author", "blurb", "image"]) if (!prev[f] && item[f]) prev[f] = item[f];
      if (item.score > prev.score) { prev.title = item.title; prev.score = item.score; }
    }
  }
  return finish(found);
}

// RSS or Atom feed: everything comes labelled, so it's the most reliable source when a site has one.
function itemsFromFeed(site, xml) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("feed ilegível");
  const nodes = [...doc.querySelectorAll("item, entry")];
  const pick = (el, names) => { for (const n of names) { const x = el.getElementsByTagName(n)[0]; if (x && clean(x.textContent)) return clean(x.textContent); } return ""; };
  const stripTags = h => clean(new DOMParser().parseFromString("<body>" + h + "</body>", "text/html").body.textContent);
  const found = new Map();
  for (const el of nodes) {
    const linkEl = el.getElementsByTagName("link")[0];
    const link = (linkEl && (linkEl.getAttribute("href") || clean(linkEl.textContent))) || pick(el, ["guid", "id"]);
    if (!link) continue;
    let url; try { url = new URL(link, site.home); } catch { continue; }
    const matched = matchArticle(site, url.href);
    if (!matched && site.strict) continue;
    const art = matched || { url: url.origin + url.pathname, key: url.origin + url.pathname.replace(/\/$/, ""), label: "", author: "" };
    const title = stripTags(pick(el, ["title"]));
    if (site.skip && site.skip.test(title)) continue;
    if (!okTitle(title)) continue;
    const descRaw = pick(el, ["description", "summary", "content:encoded", "content"]);
    let blurb = stripTags(descRaw).replace(/\s*(The post|O post|Continue reading|Leia mais).*$/i, "");
    const author = cleanAuthor(pick(el, ["dc:creator", "creator", "name", "author"]).replace(/\S+@\S+\s*/, "").replace(/[()]/g, ""));
    let image = "";
    const media = el.getElementsByTagName("media:content")[0] || el.getElementsByTagName("media:thumbnail")[0] || el.getElementsByTagName("enclosure")[0];
    if (media && /image|jpe?g|png|webp/i.test((media.getAttribute("type") || "") + (media.getAttribute("url") || ""))) image = media.getAttribute("url");
    if (!image) { const im = /<img[^>]+src=["']([^"']+)/i.exec(descRaw + pick(el, ["content:encoded"])); if (im) image = im[1]; }
    let label = art.label;
    if (!label) { const d = new Date(pick(el, ["pubDate", "published", "updated", "dc:date"])); if (!isNaN(d)) label = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; }
    if (!found.has(art.key)) found.set(art.key, { url: art.url, title: trim(title, 200), author: author || art.author, blurb: trim(blurb === title ? "" : blurb, 900), image, label, score: 0, order: found.size });
  }
  return finish(found);
}

function finish(found) {
  return [...found.values()].sort((x, y) => x.order - y.order).slice(0, MAX_ITEMS)
    .map(({ score, order, ...rest }) => tidy(rest));
}
function richness(items) { return items.reduce((n, it) => n + (it.image ? 1 : 0) + (it.blurb ? 1 : 0) + (it.author ? 1 : 0), 0); }

// One request, with a time limit that covers the whole download.
async function get(url, headers) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: headers || {} });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.text();
  } finally { clearTimeout(timer); }
}
function why(e) {
  return e.name === "AbortError" ? "tempo esgotado" : /fetch|load failed|network/i.test(e.message) ? "bloqueado ou fora do ar" : e.message;
}
// Reads the site's home page (or, with feed=true, its RSS feed) through one relay.
function viaRelay(relay, site, feed) {
  return inTurn(relay, async () => {
    const target = feed ? site.feed : site.home;
    const tries = [relay, ...(relay.fallback && !feed ? [relay.fallback] : [])];
    let err;
    for (const t of tries) {
      try {
        const text = await get(t.url(target), t.headers);
        const items = feed ? itemsFromFeed(site, text) : t.kind === "md" ? itemsFromMarkdown(site, text) : itemsFromHtml(site, text);
        if (items.length < 3) throw new Error(feed ? "feed vazio" : "sem manchetes");
        return items;
      } catch (e) { err = e; }
    }
    throw new Error(`${relay.name}${feed ? " (RSS)" : ""}: ${why(err)}`);
  });
}

function render(site, items, when) {
  const list = document.getElementById("list-" + site.id);
  if (!items.length) {
    list.innerHTML = `<li class="empty">Não encontrei manchetes nesta página. <a href="${site.home}" target="_blank" rel="noopener">Abrir o site</a>.</li>`;
    return;
  }
  list.innerHTML = items.map((it, i) => {
    const lead = i === 0 && it.image;
    const href = site.archive ? ARCHIVE + it.url : it.url;
    return `<li class="${lead ? "lead" : ""}"><a href="${esc(href)}" target="_blank" rel="noopener">
      <span class="txt">
        ${it.label ? `<span class="k">${esc(it.label)}</span>` : ""}
        <span class="t">${esc(it.title)}</span>
        ${it.author ? `<span class="by">${esc(it.author)}</span>` : ""}
        ${it.blurb ? `<span class="b">${esc(it.blurb)}</span>` : ""}
      </span>
      ${it.image ? `<img class="thumb" alt="" loading="lazy" referrerpolicy="no-referrer" src="${esc(it.image)}" onerror="this.remove()">` : ""}
    </a></li>`;
  }).join("");
  if (when) setStatus(site, "Atualizado " + timeAgo(when));
}

function setStatus(site, text, err) {
  const el = document.getElementById("status-" + site.id);
  el.textContent = text; el.classList.toggle("err", !!err);
}
function timeAgo(t) {
  const min = Math.round((Date.now() - t) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  return h < 24 ? `há ${h} h` : `há ${Math.round(h / 24)} d`;
}

function loadCache(site) { try { return JSON.parse(localStorage.getItem("estante3-" + site.id)); } catch { return null; } }
function saveCache(site, items) { try { localStorage.setItem("estante3-" + site.id, JSON.stringify({ when: Date.now(), items })); } catch {} }

// All relays run at once. The first usable answer is shown right away;
// a later answer with more images, authors and summaries replaces it. RSS answers are preferred.
async function update(site, force) {
  const cached = loadCache(site);
  if (!force && cached && cached.items && cached.items.length && Date.now() - cached.when < FRESH_MS) return;
  setStatus(site, "Buscando manchetes…");
  let best = null;
  const jobs = RELAYS.map(r => ({ r, feed: false }));
  if (site.feed) RELAYS.filter(r => r.raw).forEach(r => jobs.unshift({ r, feed: true }));
  const results = await Promise.allSettled(jobs.map(({ r, feed }) => viaRelay(r, site, feed).then(items => {
    const rich = richness(items) + (feed ? 8 : r.kind === "html" ? 2 : 0);
    if (!best || rich > best.rich) {
      best = { rich, items };
      render(site, items, Date.now());
      saveCache(site, items);
    }
  })));
  if (!best) {
    const reasons = results.map(r => r.reason && r.reason.message).filter(Boolean).join(" · ");
    setStatus(site, (cached ? `Sem atualização; mostrando a versão de ${timeAgo(cached.when)}. ` : "Não consegui ler a página. ") + `(${reasons})`, true);
    if (!cached) render(site, [], null);
  }
}

// ---------- page ----------
const sectionId = document.body.dataset.section;
const sections = window.ESTANTE.sections;
const section = sections.find(s => s.id === sectionId);
const SITES = section.sites.filter(s => s.read).map((s, i) => ({
  id: `${section.id}-${i}`,
  name: s.name, mono: s.mono, domain: s.domain,
  link: typeof s.url === "function" ? s.url() : s.url,
  home: s.read.home || (typeof s.url === "function" ? s.url() : s.url),
  alt: s.read.alt || [], patterns: s.read.patterns || [], loose: !!s.read.loose,
  names: s.read.names || {}, archive: !!s.read.archive, strict: !!s.read.strict, skip: s.read.skip || null, feed: s.read.feed || "", recent: s.read.recent || 0
}));

document.title = section.title + " · Estante";
document.getElementById("section-title").textContent = section.title;

// Links to the other reading pages.
const tabs = document.getElementById("tabs");
for (const s of sections.filter(s => s.page)) {
  const a = document.createElement("a");
  a.href = s.page; a.textContent = s.title;
  if (s.id === section.id) a.setAttribute("aria-current", "page");
  tabs.appendChild(a);
}

const cols = document.getElementById("cols");
for (const s of SITES) {
  const col = document.createElement("section");
  col.className = "col";
  col.setAttribute("aria-label", s.name);
  col.innerHTML = `
    <div class="head">
      <span class="logo">${esc(s.mono)}<img alt="" src="https://icons.duckduckgo.com/ip3/${s.domain}.ico"></span>
      <h2>${esc(s.name)}</h2>
      <a href="${esc(s.link)}" target="_blank" rel="noopener">abrir site ↗</a>
    </div>
    <div class="status" id="status-${s.id}"></div>
    <ol id="list-${s.id}"></ol>`;
  const img = col.querySelector("img");
  img.addEventListener("error", () => img.remove());
  cols.appendChild(col);
  const cached = loadCache(s);
  if (cached && cached.items && cached.items.length) render(s, cached.items, cached.when);
}

function updateAll(force) { SITES.forEach(s => update(s, force)); }
updateAll(false);
document.getElementById("refresh").addEventListener("click", () => updateAll(true));

const step = dir => { const w = cols.querySelector(".col")?.offsetWidth || 400; cols.scrollBy({ left: dir * w, behavior: "smooth" }); };
document.getElementById("prev").addEventListener("click", () => step(-1));
document.getElementById("next").addEventListener("click", () => step(1));
document.getElementById("openAll").addEventListener("click", () => {
  for (const s of SITES) window.open(s.link, "_blank", "noopener");
});
})();
