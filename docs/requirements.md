# System Requirements: Leafs-Tracker

## 💻 Software Requirements
* **Node.js:** Version 24.14.1 or higher (utilizing native ES module features like `import.meta.dirname`)
* **npm:** Node Package Manager (used for dependency management and native module rebuilding)
* **Git:** For version control and deployment integration with Render

## 📦 Dependencies & Packages

### Production Dependencies
* **`express`** (^4.x) — Web framework handling HTTP routing, middleware, and static file serving.
* **`axios`** — Promise-based HTTP client for fetching external RSS and team data feeds.
* **`sqlite`** — Async wrapper for working with SQLite databases.
* **`sqlite3`** — Low-level SQLite database bindings (requires compilation from source on Linux deployment environments).

### Environment & Build Tooling
* Standard Node.js runtime environment.
* Custom `postinstall` script hook (`npm rebuild sqlite3 --build-from-source`) configured in `package.json` to handle native binary compilation during cloud hosting builds.

## V2 Goals
- [ ] Implement user authentication (SSO).
- [ ] Transition from in-memory JSON to a persistent SQLite database.
- [ ] Create a "Season Dashboard" for deeper analytics.

## Use Cases
- A user wants to log into their account to save their personal team analysis.
- A user wants to filter historical Leafs game data by a specific season year.