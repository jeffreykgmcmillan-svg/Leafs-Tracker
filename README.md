# 🍁 Leafs Performance Tracker

A local-first, full-stack application designed to track Toronto Maple Leafs historical performance. This project serves as a V1 exploration of database management, API infrastructure, and front-end state synchronization.

## 🚀 Tech Stack
- **Backend:** Node.js, Express
- **Database:** SQLite3
- **Frontend:** HTML5, Tailwind CSS
- **Data Source:** NHL Public API

## 📋 Key Features
- **Historical Data Filtering:** Select any season to view specific team performance.
- **Dynamic Stats:** Auto-calculates W/L/OTL and points based on your selected filters.
- **Local Persistence:** Uses SQLite for reliable, local data storage.

## 🛠 How I Built It
The challenge for V1 was balancing local data persistence with responsive UI updates. I implemented a SQLite layer to handle historical data, ensuring the app remains performant even when dealing with multi-season records, and utilized Tailwind CSS for a professional, "sports-analytics" aesthetic.

## ⚙️ Setup Instructions
1. Clone this repo: `git clone https://github.com/jeffreykgmcmillan-svg/Leafs-Tracker`
2. Install dependencies: `npm install`
3. Run the server: `node server.js`
4. Visit: `http://localhost:3000`