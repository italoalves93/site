---
layout: basic
title: "Photography"
description: "Visual narratives through photography"
---

# Photography

Photography serves as both artistic expression and philosophical inquiry, capturing moments that reveal deeper truths about human experience and our relationship with place.

Through the camera, I explore how landscape shapes consciousness, how light reveals the hidden dimensions of everyday life, and how the act of seeing can become a form of contemplative practice. Each project represents an extended meditation on place, time, and the philosophical implications of visual experience.

<div class="section pt-0">
  <div class="container">
    <div class="row">
      {% assign photography_projects = site.projects | where: "categories", "photography" | sort: "date" | reverse %}
      {% for project in photography_projects %}
        <div class="col-12 col-md-6 mb-3">
          <div class="project">
            <div class="project-image">
              <a href="{{ project.url | relative_url }}">
                {% if project.thumbnail %}
                  <img alt="{{ project.title }}" class="img-fluid" src="{{ project.thumbnail | relative_url }}" />
                {% elsif project.image %}
                  <img alt="{{ project.title }}" class="img-fluid" src="{{ project.image | relative_url }}" />
                {% endif %}
              </a>
            </div>
            <div class="project-content">
              <h3 class="project-title">
                <a href="{{ project.url | relative_url }}">{{ project.title }}</a>
              </h3>
              <p class="project-description">{{ project.description }}</p>
            </div>
          </div>
        </div>
      {% endfor %}
    </div>
  </div>
</div>
