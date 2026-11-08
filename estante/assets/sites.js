/* Estante — every link on the home page and every column on the reading pages.
   To add, remove or reorder something, edit this file only.

   Each site:
     name     what is shown
     url      the link (a text, or a function that returns one)
     domain   used to fetch the site's icon
     mono     letters shown while the icon loads
     note     small grey line under the name (optional)
     flag     orange line under the name, for something still to fix (optional)
     read     only for sites that get a column on the reading page:
                home      page whose headlines are read (defaults to url)
                patterns  shapes of an article address: { re, label(match), author(match) }
                loose     also accept any address that looks like an article
                archive   open articles through archive.is
                names     nicer names for the site's sections
                feed      the site's RSS feed, tried first (needs a relay that passes files untouched)
                recent    ignore article links older than this many days
                strict    only addresses that match the patterns (also for the RSS feed)
                skip      ignore links whose address or title matches this

   relay: address of your own relay (see relay-worker.js). Leave "" to use only the public ones.
*/
(function () {
  const MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const day = m => `${+m[3]} ${MES[+m[2] - 1]} ${m[1]}`;          // from …/2026/11/08/…
  const month = (y, mm) => `${MES[+mm - 1]} ${y}`;
  const title = s => s.split("-").map(w => w ? w[0].toUpperCase() + w.slice(1) : w).join(" ");
  const ymdDate = m => new Date(+m[1], +m[2] - 1, +m[3]);

  const NYT = { us: "U.S.", nyregion: "N.Y.", world: "World", opinion: "Opinion", arts: "Arts", books: "Books",
    business: "Business", magazine: "Magazine", style: "Style", briefing: "Briefing", upshot: "The Upshot",
    climate: "Climate", science: "Science", health: "Health", technology: "Tech", sports: "Sports",
    movies: "Movies", theater: "Theater", travel: "Travel", dining: "Food", realestate: "Real Estate", well: "Well" };
  const GUARDIAN = { "us-news": "US News", "uk-news": "UK News", commentisfree: "Opinion", world: "World",
    politics: "Politics", business: "Business", books: "Books", music: "Music", film: "Film", culture: "Culture",
    "global-development": "Global Development", environment: "Environment", technology: "Tech", sport: "Sport",
    football: "Football", society: "Society", science: "Science", artanddesign: "Art", stage: "Stage", tv: "TV" };

  const NYT_PATTERNS = [
    { re: /^\/live\/(\d{4})\/(\d{2})\/(\d{2})\/([a-z-]+)\/[^/]+\/?$/, label: m => `Ao vivo · ${NYT[m[4]] || title(m[4])}` },
    { re: /^\/(\d{4})\/(\d{2})\/(\d{2})\/([a-z-]+)\/(?:[a-z-]+\/)*[^/]+\.html$/, label: m => NYT[m[4]] || title(m[4]) } ];

  window.ESTANTE = { relay: "", sections: [
    { id: "reviews", title: "Reviews", page: "reviews.html", sites: [
      { name: "London Review of Books", url: "https://www.lrb.co.uk/", domain: "lrb.co.uk", mono: "LRB",
        read: { patterns: [
          { re: /^\/the-paper\/v(\d+)\/n(\d+)\/([^/]+)\/[^/]+\/?$/, label: m => `vol. ${m[1]} nº ${m[2]}`, author: m => title(m[3]) },
          { re: /^\/blog\/(\d{4})\/([a-z]+)\/[^/]+\/?$/, label: m => `Blog · ${m[2]} ${m[1]}` } ] } },
      { name: "New York Review of Books", url: "https://www.nybooks.com/", domain: "nybooks.com", mono: "NYR",
        read: { patterns: [
          { re: /^\/articles\/(\d{4})\/(\d{2})\/(\d{2})\/[^/]+\/?$/, label: m => `Edição de ${day(m)}` },
          { re: /^\/online\/(\d{4})\/(\d{2})\/(\d{2})\/[^/]+\/?$/, label: m => `Online · ${day(m)}` } ] } },
      { name: "LA Review of Books", url: "https://lareviewofbooks.org/", domain: "lareviewofbooks.org", mono: "LA",
        read: { patterns: [
          { re: /^\/(article|review|short-takes|essay)\/[^/]+\/?$/, label: m => ({ review: "Review", "short-takes": "Short Takes", essay: "Essay" })[m[1]] || "" } ] } },
      { name: "The New Yorker", url: "https://www.newyorker.com/", domain: "newyorker.com", mono: "NY", note: "artigos via archive.is",
        read: { archive: true, patterns: [
          { re: /^\/magazine\/(\d{4})\/(\d{2})\/(\d{2})\/[^/]+\/?$/, label: m => `Edição de ${day(m)}` },
          { re: /^\/(news|culture|books|humor|science|tech|business|politics|sporting-scene|podcast)\/([a-z0-9-]+)\/[a-z0-9-]+\/?$/, label: m => title(m[2]) } ] } },
      { name: "Harper's Magazine", url: "https://harpers.org/", domain: "harpers.org", mono: "H", note: "artigos via archive.is",
        read: { archive: true, patterns: [
          { re: /^\/archive\/(\d{4})\/(\d{2})\/[a-z0-9-]+\/?$/, label: m => `Edição de ${month(m[1], m[2])}` },
          { re: /^\/(\d{4})\/(\d{2})\/[a-z0-9-]+\/?$/, label: m => `Online · ${month(m[1], m[2])}` } ] } },
      { name: "piauí", url: "https://piaui.uol.com.br/", domain: "piaui.uol.com.br", mono: "pi",
        read: { alt: ["piaui.folha.uol.com.br"], patterns: [
          { re: /^\/revista\/(\d+)\/[a-z0-9-]+\/?$/, label: m => `Revista nº ${m[1]}` },
          { re: /^\/materia\/[a-z0-9-]+\/?$/, label: () => "Revista" },
          { re: /^\/web\/[a-z0-9-]+\/?$/, label: () => "" } ] } }
    ] },

    { id: "left", title: "Left", page: "left.html", sites: [
      { name: "A Terra é Redonda", url: "https://aterraeredonda.com.br/", domain: "aterraeredonda.com.br", mono: "TR",
        read: { loose: true, feed: "https://aterraeredonda.com.br/feed/", patterns: [] } },
      { name: "New Left Review", url: "https://newleftreview.org/", domain: "newleftreview.org", mono: "NLR",
        read: { loose: true, names: { sidecar: "Sidecar", issues: "NLR" }, patterns: [
          { re: /^\/issues\/(ii\d+|iii\d+|i\d+)\/articles\/[^/]+\/?$/i, label: m => `NLR ${m[1].toUpperCase()}` },
          { re: /^\/sidecar\/posts\/[^/]+\/?$/, label: () => "Sidecar" } ] } },
      { name: "Verso Blog", url: "https://www.versobooks.com/blogs/news", domain: "versobooks.com", mono: "V",
        read: { feed: "https://www.versobooks.com/blogs/news.atom", patterns: [ { re: /^\/blogs\/news\/[^/]+\/?$/, label: () => "" } ] } },
      { name: "Marx & Philosophy Review of Books", url: "https://marxandphilosophy.org.uk/reviews/", domain: "marxandphilosophy.org.uk", mono: "M&P",
        read: { strict: true, feed: "https://marxandphilosophy.org.uk/feed/",
                patterns: [ { re: /^\/reviews\/\d+[_-][^/]+\/?$/, label: () => "Review" } ] } },
      { name: "Radical Philosophy", url: "https://www.radicalphilosophy.com/", domain: "radicalphilosophy.com", mono: "RP",
        read: { patterns: [
          { re: /^\/(article|commentary|reviews\/individual-reviews|interview|obituary|dossier|editorial)\/[^/]+\/?$/,
            label: m => ({ article: "Article", commentary: "Commentary", "reviews/individual-reviews": "Review", interview: "Interview", obituary: "Obituary", dossier: "Dossier", editorial: "Editorial" })[m[1]] } ] } },
      { name: "Monthly Review", url: "https://monthlyreview.org/", domain: "monthlyreview.org", mono: "MR",
        read: { feed: "https://monthlyreview.org/feed/", patterns: [
          { re: /^\/articles\/[^/]+\/?$/, label: () => "" },
          { re: /^\/(\d{4})\/(\d{2})\/(\d{2})\/[^/]+\/?$/, label: m => day(m) } ] } },
      { name: "Blog da Boitempo", url: "https://blogdaboitempo.com.br/", domain: "blogdaboitempo.com.br", mono: "B",
        read: { loose: true, feed: "https://blogdaboitempo.com.br/feed/", patterns: [
          { re: /^\/(\d{4})\/(\d{2})\/(\d{2})\/[^/]+\/?$/, label: m => day(m) } ] } },
      { name: "Zero à Esquerda", url: "https://zeroaesquerda.com.br/", domain: "zeroaesquerda.com.br", mono: "0",
        // The site also carries hidden casino spam links; "skip" keeps them out.
        read: { strict: true, skip: /casino|cassino|\bbet|bet\b|jackpot|gokken|spelers|bonus|roulette|slots?\b|spin|gambling/i, patterns: [
          { re: /^\/index\.php\/(\d{4})\/(\d{2})\/(\d{2})\/[a-z0-9-]+\/?$/, label: m => day(m) } ] } }
    ] },

    { id: "news", title: "News", page: "news.html", sites: [
      { name: "Sul21", url: "https://sul21.com.br/", domain: "sul21.com.br", mono: "21",
        read: { loose: true, feed: "https://sul21.com.br/feed/", patterns: [], names: { noticias: "Notícias", opiniao: "Opinião", colunas: "Colunas", cultura: "Cultura", politica: "Política", economia: "Economia", "geral": "Geral", esportes: "Esportes", internacional: "Internacional", "porto-alegre": "Porto Alegre", "ultimas-noticias": "Notícias" } } },
      { name: "The New York Times", url: "https://www.nytimes.com/", domain: "nytimes.com", mono: "T",
        read: { feed: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml", patterns: NYT_PATTERNS } },
      { name: "The Guardian", url: "https://www.theguardian.com/", domain: "theguardian.com", mono: "G",
        read: { feed: "https://www.theguardian.com/international/rss", patterns: [
          { re: /^\/([a-z-]+)(?:\/[a-z-]+)*\/(?:live\/)?(\d{4})\/([a-z]{3})\/(\d{2})\/[a-z0-9-]+$/, label: m => GUARDIAN[m[1]] || title(m[1]) } ] } },
      { name: "Financial Times · Markets", url: "https://www.ft.com/markets", domain: "ft.com", mono: "FT", note: "artigos via archive.is",
        read: { archive: true, feed: "https://www.ft.com/markets?format=rss", patterns: [ { re: /^\/content\/[0-9a-f-]{36}\/?$/, label: () => "Markets" } ] } },
      { name: "G1", url: "https://g1.globo.com/", domain: "g1.globo.com", mono: "g1",
        read: { feed: "https://g1.globo.com/rss/g1/", recent: 14, patterns: [
          { re: /^\/(?:[a-z0-9-]+\/)*noticia\/(\d{4})\/(\d{2})\/(\d{2})\/[^/]+\.ghtml$/, label: m => day(m), date: ymdDate } ] } }
    ] },

    { id: "arts", title: "Arts", page: "arts.html", sites: [
      { name: "The New York Times · Arts", url: "https://www.nytimes.com/section/arts", domain: "nytimes.com", mono: "T",
        read: { feed: "https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml", patterns: NYT_PATTERNS } },
      { name: "Pitchfork", url: "https://pitchfork.com/", domain: "pitchfork.com", mono: "P",
        read: { patterns: [
          { re: /^\/reviews\/(albums|tracks)\/[^/]+\/?$/, label: m => m[1] === "albums" ? "Album review" : "Track review" },
          { re: /^\/(news|features|thepitch)\/(?:[a-z-]+\/)?[^/]+\/?$/, label: m => ({ news: "News", features: "Feature", thepitch: "The Pitch" })[m[1]] } ] } },
      { name: "Omelete", url: "https://www.omelete.com.br/", domain: "omelete.com.br", mono: "O",
        read: { loose: true, patterns: [], names: { filmes: "Filmes", "series-tv": "Séries", series: "Séries", quadrinhos: "Quadrinhos", games: "Games", musica: "Música", criticas: "Crítica", anime: "Anime", "mangas-animes": "Mangás e animes", "omelete-entrevista": "Entrevista", ccxp: "CCXP", korea: "Coreia", streaming: "Streaming" } } }
    ] },

    { id: "outros", title: "Outros", sites: [
      { name: "easyBNF", url: "https://www.easy-bnf.fr/", domain: "easy-bnf.fr", mono: "BnF", note: "Bibliothèque nationale de France" },
      { name: "WBEZ Chicago", url: "https://www.wbez.org/", domain: "wbez.org", mono: "W", note: "Rádio · NPR" },
      { name: "Antena 1", url: "https://www.antena1.com.br/", domain: "antena1.com.br", mono: "A1", note: "Rádio" }
    ] }
  ] };
})();
