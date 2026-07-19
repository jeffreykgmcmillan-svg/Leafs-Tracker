# System Architecture

## Overview
The application follows a standard Client-Server model.

## Components
- **Client:** A browser-based frontend (HTML/Tailwind) that makes `fetch` requests to the API.
- **API Server:** A Node.js Express server that handles routing and logic.
- **Data Layer:** A SQLite3 database that stores all game logs, ensuring persistence across server restarts.

## Data Flow
1. Client requests data from `GET /api/games`.
2. Express server queries the SQLite database.
3. Database returns JSON payload to Express.
4. Express sends the JSON back to the client for rendering.