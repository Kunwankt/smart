import fs from 'fs';
import path from 'path';
import { defaultBuildingData } from './building-data';

// Use /tmp for Vercel or local 'data' directory for local dev
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const DATA_DIR = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'building.json');

export async function getLocalData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
      return { floors: defaultBuildingData };
    }

    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local data:', error);
    return { floors: defaultBuildingData };
  }
}

export async function saveLocalData(floors: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify({ floors, updatedAt: new Date() }, null, 2));
    console.log('Successfully saved to:', DATA_FILE);
    return true;
  } catch (error) {
    console.error('Error saving local data to', DATA_FILE, ':', error);
    return false;
  }
}
