# Osama Mohamed Rizk — Portfolio

Personal portfolio site, editorial design. Plain HTML, CSS and JavaScript. Animations use [GSAP](https://gsap.com) + ScrollTrigger and smooth scrolling uses [Lenis](https://lenis.darkroom.engineering), both loaded from a CDN. There is no build step.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Structure

```
index.html      all content (sections, project case-study templates)
css/style.css   colour tokens in :root, layout, responsive rules
js/main.js      loader, nav/menu, Lenis smooth scroll, drawer, GSAP scroll animations
assets/         cover images (drawer), phone crops (work cards), favicon, CV PDF
```

## Common edits

- **CV download:** put your PDF at `assets/Osama_Mohamed_Rizk_CV.pdf`. The button hides itself while the file is missing.
- **Add a project:** copy one `<article class="work-card">` block in `index.html` (set `data-open="KEY"` and a `--tint` colour), then add a matching `<template id="tpl-KEY">` for its case-study drawer.
- **Intro loader:** plays once per browser session. To see it again, open a new tab or clear `sessionStorage`.
- **Colours:** change the variables at the top of `css/style.css`.
- **Store links:** add `<a>` links to App Store / Google Play inside each work card or drawer template.

## Deploy (GitHub Pages)

1. Create a public repo named `osamamohamedr1.github.io` on GitHub.
2. Push this folder:
   ```bash
   git remote add origin https://github.com/osamamohamedr1/osamamohamedr1.github.io.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, then `main` / `/ (root)`.
4. The site goes live at **https://osamamohamedr1.github.io** within about a minute. Each later `git push` updates it.
