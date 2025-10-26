/* scripts/helpers.js
   Responsibilities:
   - Provide storage helpers that persist entries to localStorage
   - Provide utility functions: id generation, date formatting, input sanitization
   This module attaches helpers to window.App.Storage to avoid global collisions.
*/
(function(window, $){
  'use strict';

  window.App = window.App || {};
  window.App.Storage = window.App.Storage || {};

  const STORAGE_KEY = 'inktrace.entries.v1';

  // Safe JSON parse with fallback
  function safeParse(str){
    try { return JSON.parse(str || '[]'); } catch (e) { console.error('Parse error', e); return []; }
  }

  // Generate a reasonably unique id using timestamp and random
  function generateId(){
    const t = Date.now().toString(36);
    const r = Math.random().toString(36).slice(2,8);
    return `${t}-${r}`;
  }

  // Format ISO string into readable form
  function formatDate(iso){
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch (e) { return iso; }
  }

  // Load entries from localStorage
  function loadEntries(){
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const entries = safeParse(raw);
      // Ensure array and stable shape
      return Array.isArray(entries) ? entries : [];
    } catch (e) {
      console.error('Failed to load entries', e);
      return [];
    }
  }

  // Save entries to localStorage
  function saveEntries(entries){
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      return true;
    } catch (e) {
      console.error('Failed to save entries', e);
      return false;
    }
  }

  function clearAll(){
    try { window.localStorage.removeItem(STORAGE_KEY); return true; } catch(e){ return false; }
  }

  function sanitizeText(text){
    // Trim and strip unusual control chars
    return String(text || '').replace(/[\u0000-\u001F\u007F]/g, '').trim();
  }

  // Public API
  window.App.Storage.generateId = generateId;
  window.App.Storage.loadEntries = loadEntries;
  window.App.Storage.saveEntries = saveEntries;
  window.App.Storage.formatDate = formatDate;
  window.App.Storage.sanitizeText = sanitizeText;
  window.App.Storage.clearAll = clearAll;

})(window, jQuery);
