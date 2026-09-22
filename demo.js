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
