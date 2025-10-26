/* scripts/ui.js
   Responsibilities:
   - Define window.App namespace and App.init, App.render
   - Manage rendering timeline, tag cloud, search and form interactions
   - Use jQuery for DOM manipulation and event handling
*/
(function(window, $){
  'use strict';

  window.App = window.App || {};

  // Local module state
  const State = {
    entries: [],
    filter: { text: '', tag: '' }
  };

  // Helpers referencing storage methods
  function loadState(){
    State.entries = window.App.Storage.loadEntries().slice();
    sortEntries();
  }

  function saveState(){
    return window.App.Storage.saveEntries(State.entries.slice());
  }

  function sortEntries(){
    State.entries.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Convert comma separated tags into normalized array
  function parseTags(input){
    if (!input) return [];
    return input.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  }

  // Render single entry card using template
  function renderEntry(entry){
    const tpl = $('#entry-template').html();
    const tagsHtml = (entry.tags || []).map(t => `<button class="tag" data-tag="${escapeHtml(t)}">#${escapeHtml(t)}</button>`).join('');
    const html = tpl.replace('__ID__', escapeHtml(entry.id))
                    .replace('__DATE__', escapeHtml(window.App.Storage.formatDate(entry.createdAt)))
                    .replace('__TEXT__', escapeHtml(entry.text))
                    .replace('__TAGS__', tagsHtml);
    return $(html);
  }

  function escapeHtml(str){
    return String(str || '').replace(/[&"'<>]/g, function(s){
      return ({'&':'&amp;','"':'&quot;','\'':'&#39;','<':'&lt;','>':'&gt;'})[s];
    });
  }

  // Render full timeline according to current filter
  function renderTimeline(){
    const $timeline = $('#timeline');
    $timeline.empty();

    const filtered = State.entries.filter(e => {
      // filter by tag if present
      if (State.filter.tag) {
        return (e.tags || []).indexOf(State.filter.tag) !== -1;
      }
      // filter by text search
      if (State.filter.text) {
        const term = State.filter.text.toLowerCase();
        const inText = (e.text || '').toLowerCase().indexOf(term) !== -1;
        const inTags = (e.tags || []).some(t => t.indexOf(term.replace(/^#/,'')) !== -1);
        return inText || inTags;
      }
      return true;
    });

    if (filtered.length === 0) {
      $('#empty-state').show();
    } else {
      $('#empty-state').hide();
    }

    filtered.forEach(entry => {
      const $el = renderEntry(entry);
      // attach handlers for edit and delete and tag clicks
      $el.find('.btn-delete').on('click', function(){
        confirmAndDelete(entry.id);
      });
      $el.find('.btn-edit').on('click', function(){
        openEdit(entry.id);
      });
      $el.find('.tag').on('click', function(){
        const tag = $(this).data('tag');
        State.filter.tag = tag;
        $('#quick-search').val('');
        renderAll();
      });
      $timeline.append($el);
    });

    $('#count').text(filtered.length);
  }

  function renderTagCloud(){
    const map = {};
    State.entries.forEach(e => {
      (e.tags || []).forEach(t => { map[t] = (map[t] || 0) + 1; });
    });
    const tags = Object.keys(map).sort((a,b) => map[b] - map[a]);
    const $cloud = $('#tag-cloud');
    $cloud.empty();
    tags.forEach(t => {
      const btn = $(`<button class="tag" data-tag="${escapeHtml(t)}">#${escapeHtml(t)} <span class=\"muted\">(${map[t]})</span></button>`);
      btn.on('click', function(){ State.filter.tag = t; $('#quick-search').val(''); renderAll(); });
      $cloud.append(btn);
    });
  }

  function renderAll(){
    renderTagCloud();
    renderTimeline();
  }

  function confirmAndDelete(id){
    if (!confirm('Delete this entry?')) return;
    State.entries = State.entries.filter(e => e.id !== id);
    saveState();
    renderAll();
  }

  function openEdit(id){
    const entry = State.entries.find(e => e.id === id);
    if (!entry) return;
    // populate form
    $('#entry-text').val(entry.text);
    $('#entry-tags').val((entry.tags || []).join(', '));
    // when saving, update existing
    $('#save-entry').data('editing', id);
    // focus text
    $('#entry-text').focus();
  }

  function clearForm(){
    $('#entry-text').val('');
    $('#entry-tags').val('');
    $('#save-entry').removeData('editing');
  }

  function wireForm(){
    $('#entry-form').on('submit', function(e){
      e.preventDefault();
      try {
        const rawText = $('#entry-text').val();
        const text = window.App.Storage.sanitizeText(rawText);
        if (!text) { alert('Please add some text.'); $('#entry-text').focus(); return; }
        const rawTags = $('#entry-tags').val();
        const tags = parseTags(rawTags);

        const editingId = $('#save-entry').data('editing');
        if (editingId) {
          // update
          const entry = State.entries.find(x => x.id === editingId);
          if (entry) {
            entry.text = text;
            entry.tags = tags;
            entry.updatedAt = new Date().toISOString();
            saveState();
            clearForm();
            renderAll();
            return;
          }
        }

        const newEntry = {
          id: window.App.Storage.generateId(),
          text: text,
          tags: tags,
          createdAt: new Date().toISOString()
        };
        State.entries.unshift(newEntry);
        saveState();
        clearForm();
        // animate the insertion
        renderAll();
        const $first = $('#timeline').children().first();
        $first.hide().slideDown(200);
      } catch (err) {
        console.error('Save failed', err); alert('Could not save entry.');
      }
    });

    $('#cancel-entry').on('click', function(){ clearForm(); });

    $('#quick-search').on('input', function(){
      State.filter.text = $(this).val().trim();
      State.filter.tag = '';
      renderAll();
    });

    $('#btn-clear').on('click', function(){
      if (confirm('Clear all entries? This cannot be undone.')){
        window.App.Storage.clearAll();
        loadState();
        renderAll();
      }
    });

    $('#btn-new').on('click', function(){
      $('#entry-text').focus();
    });

    // keyboard shortcuts
    $(document).on('keydown', function(e){
      // N for new (not when typing)
      if (e.key === 'n' || e.key === 'N'){
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault(); $('#entry-text').focus();
      }
      if (e.key === 'Escape'){
        $('#quick-search').val(''); State.filter.text = ''; State.filter.tag = ''; clearForm(); renderAll();
      }
    });
  }

  // Public API defined on window.App
  window.App.init = function(){
    // Load data and bind form handlers
    try {
      loadState();
      wireForm();
      // Pre-focus behavior for accessibility
      $('#entry-text').attr('aria-label', 'Entry text area');
    } catch (e) {
      console.error('App.init failed', e);
    }
  };

  window.App.render = function(){
    try {
      renderAll();
      // ensure focusable elements
      $('#timeline').attr('tabindex','0');
    } catch (e) {
      console.error('App.render failed', e);
    }
  };

})(window, jQuery);
