# How to format numbers, currencies and dates by locale

Twelve invoices sit in one grid: a client, an amount, an issued date and a due date. The amount
column is `type: 'number'` with `format: { style: 'currency', currency: 'USD' }`; the two date
columns are `type: 'date'` with `format: { dateStyle: 'medium' }`. Pick a locale from the dropdown
and every cell reformats in place, the same stored `1234.5` and the same stored `'2026-01-05'`,
read a different way: `US$1,234.50` and `5 Jan 2026` under `en-GB`, `1.234,50 $` and `05.01.2026`
under `de-DE`. Choose Arabic and the whole grid mirrors right to left.

Live demo: https://toclocoinc.github.io/lattice-grid-howto-format-numbers-currencies-dates-by-locale/

**Read the how-to:** https://www.latticegrid.dev/docs/how-to/format-numbers-currencies-dates-by-locale/

## The full listing

Two files: the two tags below in `index.html` that load the grid, and `demo.js` in full. Copy both
into two files of your own and it runs.

### The tags, from `index.html`

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.css"
  integrity="sha384-mcpd7S8C5nz58bZDAXdYH6rzezEhfN7B4u2SlW426dSe20GnkxTu4TygyOILnCth"
  crossorigin="anonymous"
/>
<script
  src="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.js"
  integrity="sha384-vCzLyFYn0T0lz/vkdH4x0JpJZkOazZgI2LiGui7lm5uerdZd0Z46G9hr3Aq1FFPS"
  crossorigin="anonymous"
></script>
<script src="./demo.js"></script>
```

Plus the mount points the script above expects:

```html
<select id="locale">
  <option value="en-GB">English (UK), en-GB</option>
  <option value="de-DE">Deutsch (DE), de-DE</option>
  <option value="ja-JP">日本語 (JP), ja-JP</option>
  <option value="ar-EG">العربية (EG), ar-EG</option>
</select>
<div id="grid"></div>
<p id="stat"></p>
```

### `demo.js`, verbatim

```js
/**
 * Number, currency and date columns, reformatted for a locale chosen from a
 * dropdown at runtime. Nothing about the data changes: the same stored
 * amount and the same stored calendar date, read a different way.
 *
 * Each option in the dropdown carries its own layout direction, and
 * grid.setAll() writes both the locale and the direction in one update, so
 * choosing Arabic also mirrors the grid right to left.
 */

// Tied to toclocoinc.github.io only; has no effect anywhere else and needs
// no key at all to run this page from a local copy.
LatticeGrid.setLicence(
  'LG1.eyJ2IjoxLCJwIjoibGF0dGljZS1ncmlkIiwidCI6IlRPQ0xPQ08gSW5jIC0gcHVibGljIGRlbW9zIiwiZSI6IjIwMzAtMDEtMDEiLCJkIjpbInRvY2xvY29pbmMuZ2l0aHViLmlvIl19.9De42ua3aCGpiMB6EVRP7Tv-upUlDI-0T07rlSPzvCrsqg8t4YJi7SRnStEpAg48uzmcG7il1fR_TfwkUE7iCA'
);

const ROWS = [
  { id: 1, client: 'Acme Ltd', amount: 1234.5, issued: '2026-01-05', due: '2026-02-04' },
  { id: 2, client: 'Borealis GmbH', amount: 15990, issued: '2026-01-12', due: '2026-02-11' },
  { id: 3, client: 'Cedar & Co', amount: 342.75, issued: '2026-01-18', due: '2026-02-17' },
  { id: 4, client: 'Delta Works', amount: 8760.2, issued: '2026-01-22', due: '2026-02-21' },
  { id: 5, client: 'Eastridge Ltd', amount: 2100, issued: '2026-02-02', due: '2026-03-04' },
  { id: 6, client: 'Fenwick Retail', amount: 560.45, issued: '2026-02-09', due: '2026-03-11' },
  { id: 7, client: 'Grove Media', amount: 12345.6, issued: '2026-02-14', due: '2026-03-16' },
  { id: 8, client: 'Harlow Inc', amount: 975, issued: '2026-02-20', due: '2026-03-22' },
  { id: 9, client: 'Ironclad Systems', amount: 4300.1, issued: '2026-02-27', due: '2026-03-29' },
  { id: 10, client: 'Juniper Supply', amount: 189.99, issued: '2026-03-03', due: '2026-04-02' },
  { id: 11, client: 'Kestrel Freight', amount: 27650, issued: '2026-03-09', due: '2026-04-08' },
  { id: 12, client: 'Lattice Finishing', amount: 745.3, issued: '2026-03-15', due: '2026-04-14' },
];

const grid = LatticeGrid.createGrid(document.getElementById('grid'), {
  rowKey: 'id',
  locale: 'en-GB',
  columns: [
    { field: 'client', title: 'Client', layout: { width: 200 } },
    {
      field: 'amount', title: 'Amount', type: 'number',
      format: { style: 'currency', currency: 'USD' }, total: 'sum',
    },
    { field: 'issued', title: 'Issued', type: 'date', format: { dateStyle: 'medium' } },
    { field: 'due', title: 'Due', type: 'date', format: { dateStyle: 'medium' } },
  ],
  rows: ROWS,
});
window.__demoGrid = grid; // read by tools/verify.mjs

const stat = document.getElementById('stat');
const report = () => {
  const dir = document.querySelector('#grid .lattice')?.getAttribute('dir') || 'ltr';
  stat.textContent = `Locale: ${grid.get('locale')} (layout direction: ${dir}).`;
};
report();
grid.on('config:changed', report); // fires after grid.setAll() applies

const DIRECTIONS = { 'en-GB': 'ltr', 'de-DE': 'ltr', 'ja-JP': 'ltr', 'ar-EG': 'rtl' };

document.getElementById('locale').addEventListener('change', (e) => {
  const value = e.target.value;
  grid.setAll({ locale: value, direction: DIRECTIONS[value] });
});
```

## Three things to know

- **`grid.setAll(values)` applies several configuration changes in one update.** Writing `locale`
  and `direction` together avoids a visible reflow between the two, and produces one
  `config:changed` event rather than two.
- **Time zones never enter it.** The issued and due dates are stored as plain calendar strings
  (`'2026-01-05'`), not instants, so there is no time zone to get wrong; a column of timestamps
  would need one.
- **Sorting reads the stored value, not the formatted text.** The amount column still sorts
  1234.5 as a number under every locale in the dropdown; only its display changes.

## Running it yourself

Open `index.html` in a browser, or serve the folder with any static file server. The grid loads
from jsDelivr by script tag, so there is no install and no build step. It runs keyless on
`localhost`; the licence key in `demo.js` is bound to `toclocoinc.github.io` and has no effect
anywhere else.

## Licence

MIT, see [LICENSE](./LICENSE). Lattice Grid itself is licensed separately per domain:
https://www.latticegrid.dev/pricing/
