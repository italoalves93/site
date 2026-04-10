---
layout: basic
title: Publications
description: My academic publications
permalink: /publications/
---

<div id="zotero-publications" class="mt-3">Loading publications…</div>

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
        const doi = d.DOI ? `<a class="d-block small mt-1" href="https://doi.org/${d.DOI}" target="_blank">DOI: ${d.DOI}</a>` : '';
        const link = !d.DOI && d.url ? `<a class="d-block small mt-1" href="${d.url}" target="_blank">Link</a>` : '';
        return `
          <div class="mb-4">
            <p class="mb-1"><strong>${d.title || 'Untitled'}</strong></p>
            <p class="mb-1 text-muted small">${authors}${year ? ` (${year})` : ''}${journal ? `. <em>${journal}</em>` : ''}.</p>
            ${doi}${link}
          </div>`;
      }).join('');
    })
    .catch(() => {
      document.getElementById('zotero-publications').innerHTML =
        '<p>Could not load publications. Please try again later.</p>';
    });
</script>
