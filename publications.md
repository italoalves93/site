---
layout: page
title: "Publications"
permalink: /publications/
---

<div id="zotero-publications">Loading publications…</div>

<style>
  .zp-item { margin-bottom: 1.2em; }
  .zp-title { font-weight: bold; }
  .zp-meta { color: #555; font-size: 0.9em; }
  .zp-doi a { font-size: 0.85em; }
</style>

<script>
  const userId = '1521053';
  const url = `https://api.zotero.org/users/${userId}/publications/items?format=json&limit=100&sort=date&direction=desc`;

  fetch(url)
    .then(r => r.json())
    .then(items => {
      const container = document.getElementById('zotero-publications');
      if (!items.length) {
        container.innerHTML = '<p>No publications found. Make sure items are added to "My Publications" in Zotero.</p>';
        return;
      }
      container.innerHTML = items.map(item => {
        const d = item.data;
        const authors = (d.creators || [])
          .filter(c => c.creatorType === 'author')
          .map(c => c.lastName ? `${c.lastName}, ${(c.firstName||'')[0]}.` : c.name)
          .join(', ');
        const year = d.date ? d.date.substring(0, 4) : '';
        const journal = d.publicationTitle || d.publisher || d.university || '';
        const doi = d.DOI ? `<div class="zp-doi"><a href="https://doi.org/${d.DOI}" target="_blank">DOI: ${d.DOI}</a></div>` : '';
        const link = d.url ? `<div class="zp-doi"><a href="${d.url}" target="_blank">Link</a></div>` : '';
        return `
          <div class="zp-item">
            <div class="zp-title">${d.title || 'Untitled'}</div>
            <div class="zp-meta">${authors}${year ? ` (${year})` : ''}${journal ? `. <em>${journal}</em>` : ''}.</div>
            ${doi || link}
          </div>`;
      }).join('');
    })
    .catch(() => {
      document.getElementById('zotero-publications').innerHTML =
        '<p>Could not load publications. Please try again later.</p>';
    });
</script>
