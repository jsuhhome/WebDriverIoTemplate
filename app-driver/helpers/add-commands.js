/* global browser */

/**
 * Add Command 'Focus' on the element
 *
 */

await browser.addCommand('focus', async function () {
   await browser.execute(function (domElement) {
      domElement.focus();
   }, this);
}, true);
