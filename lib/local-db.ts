import fs from 'fs';
import path from 'path';
import { defaultBuildingData } from './building-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'building.json');

export async function getLocalData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    return { floors: defaultBuildingData };
  }

  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local data:', error);
    return { floors: defaultBuildingData };
  }
}

export async function saveLocalData(floors: any) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ floors, updatedAt: new Date() }, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving local data:', error);
    return false;
  }
}
