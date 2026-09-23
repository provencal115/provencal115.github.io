# Isaac Provencal — Portfolio

Personal portfolio of Isaac Provencal, a Ghana-based software developer and technical founder. The site presents selected web systems, the technologies used to build them, and education. It is a static site prepared for GitHub Pages.

## Features

- Sticky navigation with a working mobile menu
- Dark and light themes, including system preference on the first visit and a saved choice
- A separate academic presentation player, kept apart from the current projects
- Project links only where a public repository exists
- Semantic HTML, keyboard access, and visible focus states
- Open Graph metadata, `robots.txt`, and a sitemap placeholder

## Technologies

- HTML5
- CSS3
- JavaScript

No framework, build step, or database is required.

## Project structure

```
/
├── index.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── .nojekyll
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   ├── images/
│   │   ├── favicon.svg
│   │   ├── favicon.svg
│   │   ├── presentation-poster.svg
│   │   └── defence-poster.jpg
│   └── videos/
│       └── project-defense.mp4
└── README.md
```

`.nojekyll` tells GitHub Pages to publish the files as they are, without a Jekyll build.

## Run locally

Open `index.html` in a browser, or serve the folder so paths resolve the same way they will online.

With PHP:

```bash
php -S localhost:8000
```

With Python:

```bash
python -m http.server 8000
```

If this folder is already inside XAMPP’s `htdocs` directory, Apache can serve it at:

```
http://localhost/personalprofile/
```

## Replace before you publish

1. **Online Service Booking repository.** No public repository URL was available. Add a GitHub button in that project only when a real URL exists. The spot is marked with an HTML comment.
2. **Live demos.** None are linked. Add a live demo button only when you have a real URL.

The project defence recording is `assets/videos/project-defense.mp4`. The page plays that file with a normal video player and does not autoplay it. Paths are relative, so they work at `https://provencal115.github.io/`.

Project repositories already linked:

- SmartWaste Ghana: https://github.com/provencal115/SmartWaste-Ghana-Waste-Management-System
- APEX HRMS: https://github.com/provencal115/APEX-HRMS
- Splendid Catering: https://github.com/provencal115/Splendid-Catering

Profile links:

- Email: provencalisaac@gmail.com
- GitHub: https://github.com/provencal115
- LinkedIn: https://www.linkedin.com/in/isaac-provencal-9b742b427

## Deploy to GitHub Pages

1. Create a new public repository on GitHub, for example `personalprofile`.
2. In this folder, initialize git if you have not already, then push the `main` branch:

```bash
git init
git add .
git commit -m "Add personal portfolio site"
git branch -M main
git remote add origin https://github.com/provencal115/personalprofile.git
git push -u origin main
```

Use your actual repository name in the remote URL.

3. On GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
5. Choose branch **main** and folder **/ (root)**, then save.
6. After the deployment finishes, the site is published at `https://provencal115.github.io/<repository-name>/`.
7. Put that URL into `robots.txt`, `sitemap.xml`, and the canonical / Open Graph tags in `index.html`, then commit and push again.

GitHub Pages serves `404.html` automatically for unknown paths on the site.

Do not add passwords, API keys, tokens, or other private information to this project.
