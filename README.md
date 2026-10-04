# Osama Mohamed Rizk — Portfolio

Personal portfolio site. Plain HTML, CSS and JavaScript, with animations from [GSAP](https://gsap.com) loaded from a CDN. There is no build step.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Structure

```
index.html      all content (sections, project case-study templates)
css/style.css   colour tokens in :root, layout, responsive rules
js/main.js      nav, typing effect, modal, GSAP scroll animations
assets/         images, favicon, CV PDF
```

## Common edits

- **CV download:** put your PDF at `assets/Osama_Mohamed_Rizk_CV.pdf`. The button hides itself while the file is missing.
- **Add a project:** copy one `<article class="project">` block in `index.html`, then add a matching `<template id="tpl-KEY">` and set `data-open="KEY"` on its button.
- **Colours:** change the variables at the top of `css/style.css`.
- **Store links:** replace the `badge-shipped` spans with `<a>` links to App Store / Google Play.

## Deploy (GitHub Pages)

1. Create a public repo named `osamamohamedr1.github.io` on GitHub.
2. Push this folder:
   ```bash
   git remote add origin https://github.com/osamamohamedr1/osamamohamedr1.github.io.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, then `main` / `/ (root)`.
4. The site goes live at **https://osamamohamedr1.github.io** within about a minute. Each later `git push` updates it.
