import fs from 'fs';
import path from 'path';
import { defaultBuildingData } from './building-data';

// Use /tmp for Vercel or local 'data' directory for local dev
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const DATA_DIR = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'rooms.json');

export async function getRoomsData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // If file doesn't exist, create it with default data
    if (!fs.existsSync(DATA_FILE)) {
      const initialData = { floors: defaultBuildingData, updatedAt: new Date() };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }

    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading rooms data:', error);
    return { floors: defaultBuildingData };
  }
}

export async function saveRoomsData(floors: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const dataToSave = { floors, updatedAt: new Date() };
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
    console.log('✅ Data saved to:', DATA_FILE);
    return true;
  } catch (error) {
    console.error('❌ Error saving rooms data:', error);
    return false;
  }
}
