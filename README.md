# Leafs-Tracker 🍁

A full-stack CRUD web application designed to track and display live data and performance metrics for the Toronto Maple Leafs. Built as a portfolio project to demonstrate modern backend deployment, database management, and asynchronous JavaScript data handling.

---

## 📋 Overview
The Leafs-Tracker is a web-based dashboard that fetches live RSS data, processes it through an Express backend, stores performance logs in a persistent SQLite database, and presents everything on a responsive frontend interface. It solves the challenge of consolidating team updates and game logs into a single, interactive tracking system.

---

## 🛠️ Tech Stack
* **Backend:** Node.js, Express.js (ES Modules)
* **Database:** SQLite (`sqlite` & `sqlite3` packages) with native binding compilation
* **Data Fetching:** Axios for external RSS/API requests
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (served via Express static middleware)
* **Hosting & Deployment:** Render (Web Service)

---

## ✨ Key Features
* **Live Data Integration:** Automatically pulls and parses updates regarding the Toronto Maple Leafs.
* **Persistent Data Storage:** Saves tracking metrics using a local SQLite database (`leafstracker.db`).
* **Full CRUD Operations:** Allows creating, reading, updating, and deleting tracked game logs and performance records.
* **Static Asset Serving:** Efficiently serves frontend UI files directly through the Express server.

---

## 💡 How I Built It
1. **Local Architecture:** Started by initializing an Express server in Node.js, setting up a local SQLite database connection, and structuring routes for CRUD functionality.
2. **ES Module Migration:** Updated the project configuration (`"type": "module"`) to leverage modern JavaScript `import`/`export` syntax and `import.meta.dirname` for path resolution.
3. **Deployment & Environment Hardening:** Migrated the project to Render, resolving native C++ binary compilation errors (`ERR_DLOPEN_FAILED`) for `sqlite3` by implementing a custom `postinstall` script (`npm rebuild sqlite3 --build-from-source`) to guarantee compatibility with the host Linux environment.

---

## ⚙️ Setup Instructions
1. Clone this repo: `git clone https://github.com/jeffreykgmcmillan-svg/Leafs-Tracker`
2. Install dependencies: `npm install`
3. Run the server: `node server.js`
4. Visit: `http://localhost:3000`