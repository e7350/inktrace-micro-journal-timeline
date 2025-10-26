/* scripts/main.js
   Entry script. Ensures App contract is present then initializes and renders.
*/
$(function(){
  try {
    const hasApp = !!window.App;
    const hasInit = hasApp && typeof window.App.init === 'function';
    const hasRender = hasApp && typeof window.App.render === 'function';
    if (!hasApp || !hasInit || !hasRender) {
      const details = {
        hasApp,
        hasInit,
        hasRender,
        availableKeys: hasApp ? Object.keys(window.App || {}) : [],
        hint: 'Define in scripts/ui.js: window.App = window.App || {}; App.init = function(){}; App.render = function(){};'
      };
      console.error('[Contract] Missing App.init/App.render', details);
      return;
    }
    // Only initialize the app UI when the app's DOM is present (e.g. app.html).
    // This prevents running render logic on the landing page (index.html) where
    // the entry template and timeline are not available, which previously caused
    // tpl to be undefined and .replace() to fail.
    if (typeof window.$ !== 'undefined' && (window.$('#timeline').length || window.$('#entry-template').length)) {
      window.App.init();
      window.App.render();
    } else {
      // No app UI on this page; skip initialization safely.
      // Helpful for pages like index.html that include the scripts but don't host the app.
      console.log('App init skipped: app elements not present on this page.');
    }
  } catch (e) {
    console.error('Initialization failed', e);
  }
});
