import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';
dotenv.config();

// Enable WebSockets in Node.js for Neon
neonConfig.webSocketConstructor = ws;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

// Setup Serverless Postgres Database (Neon / Vercel Postgres)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function convertSqliteToPostgres(sql) {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
}

async function initDb() {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT, password TEXT, role TEXT)`);
        await pool.query(`CREATE TABLE IF NOT EXISTS donees (id TEXT PRIMARY KEY, familyId TEXT, cnic TEXT, name TEXT, fatherName TEXT, address TEXT, status TEXT, amount TEXT)`);
        await pool.query(`CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, date TEXT, doneeId TEXT, familyId TEXT, doneeName TEXT, amount TEXT)`);
        await pool.query(`CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, timestamp TEXT, user TEXT, action TEXT, details TEXT)`);
        await pool.query(`INSERT INTO users (id, username, password, role) VALUES ('1', 'admin', 'admin', 'admin') ON CONFLICT (id) DO NOTHING`);
        console.log("Database initialized successfully from Neon.");
    } catch (err) {
        console.error("Neon DB Init Error. Database not configured?", err.message);
    }
}
initDb();

ipcMain.handle('db-query', async (event, sql, params = []) => {
    try {
        if (!process.env.DATABASE_URL) return [];
        const pgSql = convertSqliteToPostgres(sql);
        const { rows } = await pool.query(pgSql, params);
        return rows;
    } catch (err) {
        console.error('db-query error:', err);
        throw err;
    }
});

ipcMain.handle('db-execute', async (event, sql, params = []) => {
    try {
        if (!process.env.DATABASE_URL) return null;
        const pgSql = convertSqliteToPostgres(sql);
        return await pool.query(pgSql, params);
    } catch (err) {
        console.error('db-execute error:', err);
        throw err;
    }
});

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
