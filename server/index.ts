import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getSheetData } from './googleSheetsService';

dotenv.config();

const app = express();
app.use(cors());

app.get('/menu-items', async (req, res) => {
  try {
    const data = await getSheetData();
    res.json(data);
  } catch (err) {
    res.status(500).send('Error fetching menu');
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
