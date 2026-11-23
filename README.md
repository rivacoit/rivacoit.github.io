# rivacoit

Portfolio site (React + Vite). All content (education, experience, projects, skills) lives in the constants at the top of `src/App.jsx`.

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

Deploy (e.g. GitHub Pages): `npm run deploy` after configuring `homepage` / Vite `base` for your repo URL.

## Writing

Posts live at `/writing/<slug>/`, and `/writing/` lists them as a bento grid.

To add a post:

1. Put the markdown in `src/posts/<slug>.md`, and any images in `public/writing/<slug>/`.
2. Add it to the top of `POSTS` in `src/posts/index.js` with a `tone` (tile color) and `size` (`wide`, `half` or `third`).
3. Copy `writing/names-can-be-deceiving/index.html` to `writing/<slug>/index.html` and update its title and preview tags.
4. Add the new page to `build.rolldownOptions.input` in `vite.config.js`.
5. Point the post component at the new markdown file. Right now `src/Post.jsx` imports one post directly, so a second post means passing the slug in from its entry file.
