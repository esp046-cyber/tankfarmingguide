# Fujairah Tank Farm SCADA Guide 2026

Installable offline PWA: a field guide for delivering a Siemens PCS 7 / S7-410-H tank farm automation project at Port of Fujairah, UAE.

**Live site:** https://esp046-cyber.github.io/tankfarmingguide/

## Publish on GitHub Pages
1. Upload the **contents** of this folder to the root of `esp046-cyber/tankfarmingguide` (keep `.nojekyll` and `.well-known/`). Commit to `main`.
2. Open **Settings > Pages**. Set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
3. Wait about a minute, then open the live site.

## Preview locally
```
cd tankfarmingguide-pwa
python3 -m http.server 8080
```
Open http://localhost:8080/ (service worker works on localhost). All paths are relative.

## Updating
Change files, then bump `CACHE` in `sw.js` (currently `tankfarming-v2026.2`) so installed apps refresh.

## Notes
Planning aid only. Verify all values against the signed project specification, vendor manuals and authority requirements.
