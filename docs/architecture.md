# System Architecture

## Overview
The Leafs-Tracker follows a monolithic client-server architecture. The backend is powered by Node.js and Express, acting as both an API service and a static file server. Data persistence is handled via a lightweight embedded SQLite database, eliminating the need for an external database server instance.

## Components
1. **Frontend Client (`/public`)**
   * Static HTML, CSS, and client-side JavaScript assets.
   * Communicates asynchronously with the backend via `fetch` API requests to render tracking data dynamically.

2. **Express Server (`server.js`)**
   * Acts as the core application entry point.
   * Configured using modern ES Modules (`type: "module"`).
   * Exposes RESTful API endpoints for CRUD operations.
   * Serves static frontend assets using `express.static` paired with `import.meta.dirname`.

3. **Database Layer (`sqlite` & `sqlite3`)**
   * Manages relational storage via `leafstracker.db`.
   * Compiled from source during deployment via a custom `postinstall` script to match target Linux server architectures.

4. **External Data Provider**
   * Uses `axios` to fetch external RSS feeds and team statistics.

## Data Flow

 [ User Browser ] 
       │  (HTTP Request / UI Interaction)
       ▼
 [ Express Server (`server.js`) ] 
       │ 
       ├──────────────────────────────┐
       │ (Static Files)               │ (API / DB Queries)
       ▼                              ▼
 [ `/public` Frontend ]        [ SQLite Database (`leafstracker.db`) ]