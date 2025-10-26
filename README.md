# InkTrace - Micro Journal Timeline

InkTrace is a simple, beautiful micro journaling web app built by [Teda.dev](https://teda.dev), the AI app builder for everyday problems. It offers a fast timeline for short entries, tag support, and instant search, all stored locally in your browser.

Features

- Quick capture: Add short entries (up to 280 characters) with optional comma separated tags.
- Timeline: Reverse chronological list with smooth micro-interactions.
- Tags: Clickable tag cloud with counts and quick filter.
- Fast search: Instant filtering by text or tag.
- Persisted locally: All entries are saved in browser localStorage.
- Keyboard friendly: Press N to focus the new entry, Escape to clear filters.

Files

- index.html - Marketing focused landing page with editorial layout and CTA.
- app.html - Main application page with timeline, form, search, and tag cloud.
- styles/main.css - Custom CSS used alongside Tailwind.
- scripts/helpers.js - Storage and utility helpers (exposes window.App.Storage).
- scripts/ui.js - UI module that defines window.App.init and window.App.render.
- scripts/main.js - Entry script that bootstraps the app.

How to run

1. Open index.html in your browser. Click Open the App or navigate to app.html.
2. Add entries using the form. Entries are saved locally.
3. Use the search box or click a tag to filter the timeline.

Accessibility and preferences

- The app respects prefers-reduced-motion and provides clear focus outlines.
- Touch friendly targets and keyboard interactions are included.

Notes

- All data is stored locally. Clearing browser site data will delete entries.
- This project was created with a focus on typography, whitespace, and a magazine-style landing experience.
