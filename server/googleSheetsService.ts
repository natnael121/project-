// server/googleSheetsService.ts
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

  async function getSheetData(): Promise<{ id: any; name: any; description: any; price: number; photo: any; category: any; available: boolean; preparation_time: number; ingredients: any; allergens: any; popularity_score: number; views: number; orders: number; last_updated: any; }[]> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !key) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in .env");
  }

  const auth = new google.auth.JWT({
    email, // <- fix TypeScript error by ensuring email is string
    key: key.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID!;
  const range = 'Sheet1!A2:M';

  const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = response.data.values;

  if (!rows || rows.length === 0) return [];

interface SheetRow {
    id: any;
    name: any;
    description: any;
    price: number;
    photo: any;
    category: any;
    available: boolean;
    preparation_time: number;
    ingredients: any;
    allergens: any;
    popularity_score: number;
    views: number;
    orders: number;
    last_updated: any;
}

return rows.map((row: any[]): SheetRow => ({
    id: row[0],
    name: row[1],
    description: row[2],
    price: parseFloat(row[3]),
    photo: row[4],
    category: row[5],
    available: row[6] === 'yes',
    preparation_time: Number(row[7]),
    ingredients: row[8],
    allergens: row[9],
    popularity_score: parseInt(row[10]) || 0,
    views: parseInt(row[11]) || 0,
    orders: parseInt(row[12]) || 0,
    last_updated: row[13] || new Date().toISOString(),
}));
}

module.exports = { getSheetData };
