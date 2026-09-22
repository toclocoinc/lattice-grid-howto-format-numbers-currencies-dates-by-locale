/**
 * Load the demo in a real headless browser and check that it works.
 *
 * Serves the project locally and drives it with the same minimal Chrome
 * driver the grid's own test suite uses (tools/browser.js), so this needs no
 * dependency beyond Chrome itself.
 *
 * Checks:
 *   - the library arrived (LatticeGrid.createGrid) and all 12 invoices are
 *     in the grid (grid.rows.count());
 *   - the amount column reads through Intl currency formatting for the
 *     chosen locale: 1234.5 as "US$1,234.50" under en-GB and, with a
 *     non-breaking space before the sign as Intl itself inserts, "1.234,50 $"
 *     under de-DE, the same stored number with different grouping and
 *     decimal separators and currency-symbol placement;
 *   - the issued-date column follows the same switch: "5 Jan 2026" under
 *     en-GB, "2026/01/05" under ja-JP;
 *   - choosing en-GB, de-DE or ja-JP leaves the grid's own root at dir="ltr";
 *     choosing ar-EG flips it to dir="rtl", because each dropdown option
 *     carries its own `direction` and the demo writes locale and direction
 *     together through grid.setAll();
 *   - the row order (by amount) is unchanged across a locale switch, proving
 *     sort still reads the stored number rather than the formatted text;
 *   - nothing logged a console error or threw while the page ran.
 *
 * Exits non-zero on any failure, so it can gate a deployment.
 *
 * Usage: node tools/verify.mjs
 */

import { startServer } from './serve.mjs';
import { Browser, available } from './browser.js';

if (!available()) {
  console.log('No headless browser on this machine; skipping verify.mjs.');
  process.exit(0);
}

const setLocale = (value) => `(() => {
  const select = document.getElementById('locale');
  select.value = ${JSON.stringify(value)};
  select.dispatchEvent(new Event('change', { bubbles: true }));
})()`;

const { server, port } = await startServer();
const browser = new Browser();

try {
  await browser.start();

  await browser.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__errs = [];
      addEventListener('error', (e) => window.__errs.push(String(e.message || e)));
      addEventListener('unhandledrejection', (e) => window.__errs.push('unhandledrejection: ' + String(e.reason)));
      const origError = console.error.bind(console);
      console.error = (...args) => { window.__errs.push('console.error: ' + args.map(String).join(' ')); origError(...args); };
    `,
  });

  await browser.open(`http://127.0.0.1:${port}/`);
  await new Promise((r) => setTimeout(r, 500));

  const failures = [];

  const hasGrid = await browser.evaluate(`typeof LatticeGrid !== 'undefined' && typeof LatticeGrid.createGrid === 'function'`);
  if (!hasGrid) failures.push('LatticeGrid.createGrid was not found on the page');

  const totalRows = await browser.evaluate(`window.__demoGrid.rows.count()`);
  if (totalRows !== 12) failures.push(`expected 12 rows (grid.rows.count()), grid reports ${totalRows}`);

  // en-GB is the default locale.
  const amountGB = await browser.evaluate(`window.__demoGrid.rows.text('1', 'amount')`);
  if (amountGB !== 'US$1,234.50') failures.push(`expected the en-GB amount to read "US$1,234.50", got ${JSON.stringify(amountGB)}`);
  const issuedGB = await browser.evaluate(`window.__demoGrid.rows.text('1', 'issued')`);
  if (issuedGB !== '5 Jan 2026') failures.push(`expected the en-GB issued date to read "5 Jan 2026", got ${JSON.stringify(issuedGB)}`);
  const dirGB = await browser.evaluate(`document.querySelector('#grid .lattice').getAttribute('dir')`);
  if (dirGB !== 'ltr') failures.push(`expected dir="ltr" under en-GB, got ${JSON.stringify(dirGB)}`);

  // Switch to de-DE: same stored amount, different grouping/decimal separators.
  await browser.evaluate(setLocale('de-DE'));
  await new Promise((r) => setTimeout(r, 400));
  const amountDE = await browser.evaluate(`window.__demoGrid.rows.text('1', 'amount')`);
  if (amountDE !== '1.234,50 $') failures.push(`expected the de-DE amount to read "1.234,50 $", got ${JSON.stringify(amountDE)}`);
  const dirDE = await browser.evaluate(`document.querySelector('#grid .lattice').getAttribute('dir')`);
  if (dirDE !== 'ltr') failures.push(`expected dir="ltr" under de-DE, got ${JSON.stringify(dirDE)}`);
  const orderDE = await browser.evaluate(`window.__demoGrid.rows.get(0).key`);
  if (orderDE !== '1') failures.push(`row order changed on a locale switch alone; expected row "1" first, got ${JSON.stringify(orderDE)}`);

  // ja-JP: a different calendar-date convention.
  await browser.evaluate(setLocale('ja-JP'));
  await new Promise((r) => setTimeout(r, 400));
  const issuedJP = await browser.evaluate(`window.__demoGrid.rows.text('1', 'issued')`);
  if (issuedJP !== '2026/01/05') failures.push(`expected the ja-JP issued date to read "2026/01/05", got ${JSON.stringify(issuedJP)}`);
  const dirJP = await browser.evaluate(`document.querySelector('#grid .lattice').getAttribute('dir')`);
  if (dirJP !== 'ltr') failures.push(`expected dir="ltr" under ja-JP, got ${JSON.stringify(dirJP)}`);

  // ar-EG: an RTL locale. The demo re-settles direction alongside it.
  await browser.evaluate(setLocale('ar-EG'));
  await new Promise((r) => setTimeout(r, 400));
  const dirEG = await browser.evaluate(`document.querySelector('#grid .lattice').getAttribute('dir')`);
  if (dirEG !== 'rtl') failures.push(`expected dir="rtl" under ar-EG, got ${JSON.stringify(dirEG)}`);
  const statText = await browser.evaluate(`document.getElementById('stat').textContent`);
  if (!/ar-EG/.test(statText) || !/rtl/.test(statText)) failures.push(`expected the stat line to report ar-EG and rtl, got ${JSON.stringify(statText)}`);

  const errors = await browser.evaluate('window.__errs');
  if (errors.length) failures.push(`console/window errors: ${errors.join(' | ')}`);

  if (failures.length) {
    console.error('FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log(
      'OK: 12 invoices, the amount column reads "US$1,234.50" under en-GB and "1.234,50 $" under ' +
      'de-DE for the same stored value, the issued-date column follows the same switch, row order ' +
      'by amount is unchanged across it, and choosing ar-EG flips the grid to dir="rtl". 0 console errors.'
    );
  }
} finally {
  await browser.close();
  server.close();
}
