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

  // Map Zotero item types to readable labels
  const typeLabels = {
    journalArticle: 'Journal Articles',
    bookSection: 'Book Chapters',
    book: 'Books',
    thesis: 'Theses',
    conferencePaper: 'Conference Papers',
    magazineArticle: 'Magazine Articles',
    newspaperArticle: 'Newspaper Articles',
    report: 'Reports',
    webpage: 'Web Publications',
    manuscript: 'Manuscripts',
    presentation: 'Presentations',
  };

  // Extract a clean 4-digit year from messy Zotero date strings
  function extractYear(dateStr) {
    if (!dateStr) return '';
    const match = dateStr.match(/\b(19|20)\d{2}\b/);
    return match ? match[0] : '';
  }

  // Parent item types to show; filter out attachments, notes, etc.
  const validTypes = new Set(Object.keys(typeLabels));

  fetch(url)
    .then(r => r.json())
    .then(items => {
      const container = document.getElementById('zotero-publications');

      // Keep only real publication items, not attachments/notes
      const publications = items.filter(item => validTypes.has(item.data.itemType));

      if (!publications.length) {
        container.innerHTML = '<p>No publications found.</p>';
        return;
      }

      // Group by item type
      const groups = {};
      publications.forEach(item => {
        const type = item.data.itemType;
        if (!groups[type]) groups[type] = [];
        groups[type].push(item);
      });

      // Render each group
      const html = Object.entries(groups).map(([type, items]) => {
        const label = typeLabels[type] || type;
        const itemsHtml = items.map(item => {
          const d = item.data;
          const authors = (d.creators || [])
            .filter(c => c.creatorType === 'author')
            .map(c => c.lastName ? `${c.lastName}, ${(c.firstName || '')[0]}.` : c.name)
            .join(', ');
          const year = extractYear(d.date);
          const venue = d.publicationTitle || d.publisher || d.university || d.institution || '';
          const doi = d.DOI
            ? `<a class="d-block small mt-1" href="https://doi.org/${d.DOI}" target="_blank">DOI: ${d.DOI}</a>`
            : '';
          const link = !d.DOI && d.url
            ? `<a class="d-block small mt-1" href="${d.url}" target="_blank">Link ↗</a>`
            : '';
          return `
            <div class="mb-4">
              <p class="mb-1"><strong>${d.title || 'Untitled'}</strong></p>
              <p class="mb-1 text-muted small">
                ${authors}${year ? ` (${year})` : ''}${venue ? `. <em>${venue}</em>` : ''}.
              </p>
              ${doi}${link}
            </div>`;
        }).join('');

        return `<h2 class="mt-5 mb-3">${label}</h2>${itemsHtml}`;
      }).join('');

      container.innerHTML = html;
    })
    .catch(() => {
      document.getElementById('zotero-publications').innerHTML =
        '<p>Could not load publications. Please try again later.</p>';
    });
</script>
