import fs from 'fs';
import path from 'path';
import { defaultBuildings } from './building-data';

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
      const initialData = { buildings: defaultBuildings, updatedAt: new Date() };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }

    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);

    // Backward compatibility: if data is in old format (floors at top level)
    if (parsed.floors && !parsed.buildings) {
      const buildings = { ...defaultBuildings, cb: { ...defaultBuildings.cb, floors: parsed.floors } };
      return { buildings, updatedAt: parsed.updatedAt || new Date() };
    }

    return parsed;
  } catch (error) {
    console.error('Error reading rooms data:', error);
    return { buildings: defaultBuildings, updatedAt: new Date() };
  }
}

export async function saveRoomsData(buildings: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const dataToSave = { buildings, updatedAt: new Date() };
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
    console.log('✅ Data saved to:', DATA_FILE);
    return true;
  } catch (error) {
    console.error('❌ Error saving rooms data:', error);
    return false;
  }
}
