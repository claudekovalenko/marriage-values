# Discernment

A small, private PWA for holding the values I'm praying for in a wife, the roles and vision I hope for in a family, and reflections along the way. All of it Lord willing.

## Sections

- **Values**: who she is today. Each value has a priority (Non-negotiable / Essential / Important / Preference), a category, why it matters, and *what to look for* to help me discern it. Filter by priority; tap **Edit** to change anything, or add new ones.
- **Roles**: the future home: what I picture for her, for me, and for us together, plus the open questions I'm still working out.
- **Vision**: the kids we hope to raise, family life, families to learn from, and who I need to become.
- **Reflect**: a private journal for when someone comes into view. For each value, mark *Clearly seen / Some signs / Not yet known / Concern* and add notes, plus overall notes and prayer. It isn't a score; it's a way to observe fruit over time.
- **More**: export/import a JSON backup, edit categories, restore the starter content.

## Privacy

Everything is stored in the browser's `localStorage` on the device. Nothing is sent anywhere. Export a backup before switching phones or clearing browser data.

## Running it

It's plain HTML/CSS/JS with no build step. Serve the folder over HTTP(S), for example:

```sh
npx http-server .
```

To install it on a phone, host it on any static host with HTTPS (GitHub Pages, Netlify, Cloudflare Pages), open it, and choose **Add to Home Screen**. It works offline after the first load.

The starter content lives in `data.js`. When you ship changes, bump `CACHE` in `sw.js` so installed copies pick them up.
