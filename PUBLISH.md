# Publish step (batch mode)

This repo was built and verified locally under the owner's 2026-09-22 batch-mode
instruction (GitHub Actions minutes low). It has not been pushed. When the
how-to series is published in one batch, create and push it with:

```
gh repo create toclocoinc/lattice-grid-howto-format-numbers-currencies-dates-by-locale \
  --public \
  --description "How to format numbers, currencies and dates by locale with Lattice Grid" \
  --homepage https://toclocoinc.github.io/lattice-grid-howto-format-numbers-currencies-dates-by-locale/
```

Then push this local repo's `main` to it, and enable Pages from the `main`
branch root (the checked-in `.github/workflows/pages.yml` publishes on every
push to `main`, so pushing is the only remaining step).

- **Description:** How to format numbers, currencies and dates by locale with Lattice Grid
- **Homepage:** https://toclocoinc.github.io/lattice-grid-howto-format-numbers-currencies-dates-by-locale/
- **Topics:** `lattice-grid`, `data-grid`, `javascript`, `how-to`

Site page this repo's README links back to (also not yet pushed, committed
locally on branch `howto/format-numbers-currencies-dates-by-locale` of the site repo):
https://www.latticegrid.dev/docs/how-to/format-numbers-currencies-dates-by-locale/
