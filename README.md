# PCForge

PCForge is a pet/hobby project — a beginner-friendly PC builder website and learning platform. The goal is to help newcomers understand PC components and assemble custom PC builds with clear, easy-to-follow UI and explanations.

## About

This project started as a frontend-only prototype with basic functionality. It aims to provide:
- A simple UI to browse components (CPU, GPU, RAM, storage, etc.)
- A guided "build" flow so new users can pick parts and see a summary
- A comparison view for looking at parts side-by-side
- A personal "my builds" area to view saved builds (frontend-only for now)

Over time I plan to add a proper backend to support advanced features like part compatibility checks, detailed performance and FPS comparisons by game/resolution, user accounts, and more.

## Tech stack (current)

- HTML
- CSS
- JavaScript

This is a static frontend at the moment. No server or backend is required to view the app.

## Project structure (high level)

Key files and folders:

- `index.html` — landing page
- `build.html` — builder UI
- `compare.html` — compare components
- `my-builds.html` — saved builds view
- `css/` — stylesheets
- `js/` — client-side JavaScript and small JSON databases used by the UI
- `assets/` — icons and images

## How to run locally

Because this is a static site, you can open `index.html` directly in the browser. For best results (and to avoid some browser restrictions), run a simple local HTTP server from the project root.

Using Python (if installed):

```powershell
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

Or, if you have Node.js installed, you can use a lightweight server such as `http-server` (install globally with `npm i -g http-server`) and run:

```powershell
npx http-server -p 8000
```

## Roadmap / Future plans

- Add a backend (Node, Python, or similar) and a database to persist user data
- Implement parts compatibility checks (socket, TDP, size, BIOS, etc.)
- Add performance/fps estimates and game-specific comparisons by resolution
- Allow user accounts and cloud-saved builds
- Improve UX, accessibility, and documentation

## Contributing

This is a personal project, but suggestions and ideas are welcome.


## Notes

- This project is a learning/pet project. Features and priorities may change as I experiment and learn.
- If you'd like to contact me feel free to do so.

---

Thank you for checking out PCForge! If you have ideas or feedback feel free to reach out to me.
