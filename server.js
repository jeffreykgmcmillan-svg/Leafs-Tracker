import express from 'express';
import axios from 'axios';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'node:path';

const app = express();
app.use(express.json());

// Point Express to your public folder. 
// This automatically serves index.html at http://localhost:3000/
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
let db;

// 1. Initialize SQLite Database & Tables
(async () => {
    try {
        db = await open({
            filename: './leafs_tracker.db',
            driver: sqlite3.Database
        });

        // Ensure table matches structure with required attributes
        await db.exec(`
            CREATE TABLE IF NOT EXISTS games (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                season TEXT,
                gameNumber INTEGER,
                gameType INTEGER, -- 1 = Preseason, 2 = Regular, 3 = Playoffs
                opponent TEXT,
                date TEXT,
                leafsScore INTEGER,
                opponentScore INTEGER,
                result TEXT
            )
        `);

        console.log("🏒 SQLite Database initialized successfully.");

        // Automatically trigger historical seeding if the database is brand new/empty
        const countRow = await db.get("SELECT COUNT(*) as count FROM games");
        if (countRow.count === 0) {
            console.log("Database is empty. Initiating background historical fetch...");
            // Running without 'await' keeps the startup sequence responsive while seeding in background
            seedHistoricalData();
        }

    } catch (err) {
        console.error("❌ Database initialization error:", err.message);
    }
})();

// 2. Core Historical NHL Data Seeder Function
async function seedHistoricalData() {
    // You can alter startYear to pull even older history (e.g., 2010)
    const startYear = 2015; 
    const currentYear = new Date().getFullYear();

    console.log(`🚀 Starting Maple Leafs historical sync from ${startYear} to present...`);

    for (let year = startYear; year <= currentYear; year++) {
        const seasonStr = `${year}${year + 1}`; // e.g. "20232024"
        console.log(`⏳ Synchronizing Season: ${year}-${year + 1}...`);

        try {
            const url = `https://api-web.nhle.com/v1/club-schedule-season/TOR/${seasonStr}`;
            const response = await axios.get(url);
            const data = response.data;

            if (!data || !data.games || data.games.length === 0) {
                console.log(`⚠️ No data records returned for season ${seasonStr}.`);
                continue;
            }

            // Differentiate tracking indices per sub-season format
            let preseasonCounter = 0;
            let regularSeasonCounter = 0;
            let playoffCounter = 0;

            for (const nhlGame of data.games) {
                const gameType = nhlGame.gameType; 

                // Handle Preseason (1), Regular Season (2), and Playoffs (3) nicely
                if (gameType !== 1 && gameType !== 2 && gameType !== 3) continue;

                try {
                    // Safe structural navigation across API version payloads
                    const homeAbbrev = nhlGame.homeTeam?.abbrev || nhlGame.homeTeam?.placeName?.default || "UNKNOWN";
                    const awayAbbrev = nhlGame.awayTeam?.abbrev || nhlGame.awayTeam?.placeName?.default || "UNKNOWN";

                    const isHome = homeAbbrev === "TOR";
                    const opponent = isHome ? awayAbbrev : homeAbbrev;

                    // Compute clean tracking indices relative to game category
                    let gameNumber;
                    if (gameType === 1) gameNumber = ++preseasonCounter;
                    else if (gameType === 2) gameNumber = ++regularSeasonCounter;
                    else if (gameType === 3) gameNumber = ++playoffCounter;

                    const leafsScore = isHome ? (nhlGame.homeTeam?.score ?? 0) : (nhlGame.awayTeam?.score ?? 0);
                    const opponentScore = isHome ? (nhlGame.awayTeam?.score ?? 0) : (nhlGame.homeTeam?.score ?? 0);

                    let result = "Scheduled";
                    const isFinished = nhlGame.gameState === "OFF" || nhlGame.gameState === "FINAL";

                    if (isFinished) {
                        if (leafsScore > opponentScore) {
                            result = "Win";
                        } else {
                            // Extract period profile accurately for Overtime (OT) and Shootouts (SO)
                            const pType = nhlGame.periodDescriptor?.periodType || nhlGame.gameOutcome?.lastPeriodType;
                            const isOT = pType === "OT" || pType === "SO";
                            result = isOT ? "OT Loss" : "Loss";
                        }
                    }

                    await db.run(
                        `INSERT INTO games (season, gameNumber, gameType, opponent, date, leafsScore, opponentScore, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [seasonStr, gameNumber, gameType, opponent, nhlGame.gameDate || "0000-00-00", leafsScore, opponentScore, result]
                    );

                } catch (gameError) {
                    // Safe boundaries protect sequence execution loop against isolated data variations
                    console.error(`⚠️ Row skip on specific game row inside ${seasonStr}: ${gameError.message}`);
                }
            }

            console.log(`✅ Completed data extraction for season: ${seasonStr}`);
            // Explicit pacing prevents server connections from hitting remote host request thresholds
            await new Promise(resolve => setTimeout(resolve, 400));

        } catch (error) {
            console.error(`❌ Network error context matching season ${seasonStr}: ${error.message}`);
        }
    }
    console.log("🎉 Historical database seeding process complete!");
}

// 3. REST API CRUD Endpoints

// GET all games (with optional query filters for season or gameType)
app.get('/api/games', async (req, res) => {
    const { season, gameType } = req.query;
    let query = "SELECT * FROM games WHERE 1=1";
    const params = [];

    if (season) {
        query += " AND season = ?";
        params.push(season);
    }
    if (gameType) {
        query += " AND gameType = ?";
        params.push(gameType);
    }

    try {
        const db = await open({ filename: './leafs_tracker.db', driver: sqlite3.Database });
        const games = await db.all(query, params);
        res.json(games);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a manual game entry
app.post('/api/games', async (req, res) => {
    try {
        const { season, gameNumber, gameType, opponent, date, leafsScore, opponentScore, result } = req.body;
        const sql = `INSERT INTO games (season, gameNumber, gameType, opponent, date, leafsScore, opponentScore, result) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const actionResult = await db.run(sql, [season, gameNumber, gameType, opponent, date, leafsScore, opponentScore, result]);
        res.status(201).json({ id: actionResult.lastID, message: "Game entry added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT (update) an existing game entry
app.put('/api/games/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { season, gameNumber, gameType, opponent, date, leafsScore, opponentScore, result } = req.body;
        const sql = `UPDATE games SET season = ?, gameNumber = ?, gameType = ?, opponent = ?, date = ?, leafsScore = ?, opponentScore = ?, result = ?
                     WHERE id = ?`;
        const actionResult = await db.run(sql, [season, gameNumber, gameType, opponent, date, leafsScore, opponentScore, result, id]);
        
        if (actionResult.changes === 0) {
            return res.status(404).json({ message: "Target game record not found" });
        }
        res.json({ message: "Game record modified successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE a game entry
app.delete('/api/games/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const actionResult = await db.run("DELETE FROM games WHERE id = ?", id);
        
        if (actionResult.changes === 0) {
            return res.status(404).json({ message: "Target game record not found" });
        }
        res.json({ message: "Game record removed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST Route to explicitly force a refresh and wipe/re-fetch everything manually
app.post('/api/seed/force', async (req, res) => {
    try {
        console.log("🔄 Force re-seed request received. Purging matching tables...");
        await db.run("DELETE FROM games");
        seedHistoricalData(); // Runs asynchronously in background thread
        res.json({ message: "Wipe complete. Historical sync running in background terminal window!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the Express Engine Server Container
app.listen(PORT, () => {
    console.log(`🚀 Leafs Tracker API is skating on http://localhost:${PORT}`);
});

app.get('/api/seasons', async (req, res) => {
    try {
        const db = await open({ filename: './leafs_tracker.db', driver: sqlite3.Database });
        // This SQL query gets a unique list of seasons sorted by year descending
        const seasons = await db.all("SELECT DISTINCT season FROM games ORDER BY season DESC");
        res.json(seasons.map(s => s.season));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});