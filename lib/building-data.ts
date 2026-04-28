export interface Room {
  id: string;
  name: string;
  floor: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "room" | "corridor" | "stairs" | "elevator" | "entrance";
  connections: string[];
}

export interface Floor {
  id: string;
  name: string;
  level: number;
  rooms: Room[];
}

export interface NavigationStep {
  instruction: string;
  distance: number;
  floor: string;
}

export interface PathResult {
  path: Room[];
  steps: NavigationStep[];
  totalDistance: number;
}

// Default building data for CB Building
export const defaultBuildingData: Floor[] = [
  {
    id: "ground",
    name: "Ground",
    level: 0,
    rooms: [
      { id: "entrance", name: "Main Entrance", floor: "ground", x: 400, y: 350, width: 80, height: 40, type: "entrance", connections: ["lobby"] },
      { id: "lobby", name: "Lobby", floor: "ground", x: 350, y: 250, width: 180, height: 80, type: "corridor", connections: ["entrance", "stairs-g", "elevator-g", "room-g1", "room-g2"] },
      { id: "stairs-g", name: "Stairs (Ground)", floor: "ground", x: 250, y: 200, width: 60, height: 60, type: "stairs", connections: ["lobby", "corridor-g"] },
      { id: "elevator-g", name: "Elevator (Ground)", floor: "ground", x: 570, y: 200, width: 50, height: 60, type: "elevator", connections: ["lobby"] },
      { id: "corridor-g", name: "Main Corridor", floor: "ground", x: 200, y: 120, width: 480, height: 60, type: "corridor", connections: ["stairs-g", "room-g1", "room-g2", "room-g3", "room-g4", "room-g5"] },
      { id: "room-g1", name: "Reception", floor: "ground", x: 100, y: 50, width: 100, height: 70, type: "room", connections: ["corridor-g"] },
      { id: "room-g2", name: "Security Office", floor: "ground", x: 220, y: 50, width: 90, height: 70, type: "room", connections: ["corridor-g"] },
      { id: "room-g3", name: "Meeting Room G1", floor: "ground", x: 330, y: 50, width: 100, height: 70, type: "room", connections: ["corridor-g"] },
      { id: "room-g4", name: "Cafeteria", floor: "ground", x: 450, y: 50, width: 120, height: 70, type: "room", connections: ["corridor-g"] },
      { id: "room-g5", name: "Storage G1", floor: "ground", x: 590, y: 50, width: 80, height: 70, type: "room", connections: ["corridor-g"] },
    ],
  },
  {
    id: "1st",
    name: "1st Floor",
    level: 1,
    rooms: [
      { id: "stairs-1", name: "Stairs (1st)", floor: "1st", x: 250, y: 200, width: 60, height: 60, type: "stairs", connections: ["corridor-1"] },
      { id: "elevator-1", name: "Elevator (1st)", floor: "1st", x: 570, y: 200, width: 50, height: 60, type: "elevator", connections: ["corridor-1"] },
      { id: "corridor-1", name: "Main Corridor", floor: "1st", x: 200, y: 120, width: 480, height: 60, type: "corridor", connections: ["stairs-1", "elevator-1", "room-101", "room-102", "room-103", "room-104"] },
      { id: "room-101", name: "Office 101", floor: "1st", x: 100, y: 50, width: 100, height: 70, type: "room", connections: ["corridor-1"] },
      { id: "room-102", name: "Office 102", floor: "1st", x: 220, y: 50, width: 100, height: 70, type: "room", connections: ["corridor-1"] },
      { id: "room-103", name: "Conference Room A", floor: "1st", x: 340, y: 50, width: 120, height: 70, type: "room", connections: ["corridor-1"] },
      { id: "room-104", name: "Office 103", floor: "1st", x: 480, y: 50, width: 100, height: 70, type: "room", connections: ["corridor-1"] },
    ],
  },
  {
    id: "2nd",
    name: "2nd Floor",
    level: 2,
    rooms: [
      { id: "stairs-2", name: "Stairs (2nd)", floor: "2nd", x: 250, y: 200, width: 60, height: 60, type: "stairs", connections: ["corridor-2"] },
      { id: "elevator-2", name: "Elevator (2nd)", floor: "2nd", x: 570, y: 200, width: 50, height: 60, type: "elevator", connections: ["corridor-2"] },
      { id: "corridor-2", name: "Main Corridor", floor: "2nd", x: 200, y: 120, width: 480, height: 60, type: "corridor", connections: ["stairs-2", "elevator-2", "room-201", "room-202", "room-203"] },
      { id: "room-201", name: "IT Department", floor: "2nd", x: 100, y: 50, width: 140, height: 70, type: "room", connections: ["corridor-2"] },
      { id: "room-202", name: "Server Room", floor: "2nd", x: 260, y: 50, width: 100, height: 70, type: "room", connections: ["corridor-2"] },
      { id: "room-203", name: "Office 201", floor: "2nd", x: 380, y: 50, width: 100, height: 70, type: "room", connections: ["corridor-2"] },
    ],
  },
  {
    id: "3rd",
    name: "3rd Floor",
    level: 3,
    rooms: [
      { id: "stairs-3", name: "Stairs (3rd)", floor: "3rd", x: 250, y: 200, width: 60, height: 60, type: "stairs", connections: ["corridor-3"] },
      { id: "elevator-3", name: "Elevator (3rd)", floor: "3rd", x: 570, y: 200, width: 50, height: 60, type: "elevator", connections: ["corridor-3"] },
      { id: "corridor-3", name: "Main Corridor", floor: "3rd", x: 200, y: 120, width: 480, height: 60, type: "corridor", connections: ["stairs-3", "elevator-3", "room-301", "room-302", "room-303"] },
      { id: "room-301", name: "HR Office", floor: "3rd", x: 100, y: 50, width: 120, height: 70, type: "room", connections: ["corridor-3"] },
      { id: "room-302", name: "Finance", floor: "3rd", x: 240, y: 50, width: 120, height: 70, type: "room", connections: ["corridor-3"] },
      { id: "room-303", name: "Training Room", floor: "3rd", x: 380, y: 50, width: 140, height: 70, type: "room", connections: ["corridor-3"] },
    ],
  },
  {
    id: "4th",
    name: "4th Floor",
    level: 4,
    rooms: [
      { id: "stairs-4", name: "Stairs (4th)", floor: "4th", x: 250, y: 200, width: 60, height: 60, type: "stairs", connections: ["corridor-4"] },
      { id: "elevator-4", name: "Elevator (4th)", floor: "4th", x: 570, y: 200, width: 50, height: 60, type: "elevator", connections: ["corridor-4"] },
      { id: "corridor-4", name: "Main Corridor", floor: "4th", x: 200, y: 120, width: 480, height: 60, type: "corridor", connections: ["stairs-4", "elevator-4", "room-401", "room-402"] },
      { id: "room-401", name: "Executive Suite", floor: "4th", x: 100, y: 50, width: 160, height: 70, type: "room", connections: ["corridor-4"] },
      { id: "room-402", name: "Board Room", floor: "4th", x: 280, y: 50, width: 160, height: 70, type: "room", connections: ["corridor-4"] },
    ],
  },
  {
    id: "5th",
    name: "5th Floor",
    level: 5,
    rooms: [
      { id: "stairs-5", name: "Stairs (5th)", floor: "5th", x: 250, y: 200, width: 60, height: 60, type: "stairs", connections: ["corridor-5"] },
      { id: "elevator-5", name: "Elevator (5th)", floor: "5th", x: 570, y: 200, width: 50, height: 60, type: "elevator", connections: ["corridor-5"] },
      { id: "corridor-5", name: "Main Corridor", floor: "5th", x: 200, y: 120, width: 480, height: 60, type: "corridor", connections: ["stairs-5", "elevator-5", "room-501", "room-502", "room-503"] },
      { id: "room-501", name: "Rooftop Lounge", floor: "5th", x: 100, y: 50, width: 140, height: 70, type: "room", connections: ["corridor-5"] },
      { id: "room-502", name: "Gym", floor: "5th", x: 260, y: 50, width: 120, height: 70, type: "room", connections: ["corridor-5"] },
      { id: "room-503", name: "Break Room", floor: "5th", x: 400, y: 50, width: 100, height: 70, type: "room", connections: ["corridor-5"] },
    ],
  },
];

// Calculate distance between two rooms (Manhattan distance for indoor navigation)
export function calculateDistance(room1: Room, room2: Room): number {
  const dx = Math.abs((room1.x + room1.width / 2) - (room2.x + room2.width / 2));
  const dy = Math.abs((room1.y + room1.height / 2) - (room2.y + room2.height / 2));
  return Math.round((dx + dy) / 10); // Convert to approximate steps
}

// Simple BFS pathfinding within a floor
export function findPath(
  startRoom: Room,
  endRoom: Room,
  floors: Floor[]
): PathResult | null {
  const allRooms = floors.flatMap((f) => f.rooms);
  const roomMap = new Map(allRooms.map((r) => [r.id, r]));
  
  // If rooms are on different floors, we need to use stairs or elevator
  if (startRoom.floor !== endRoom.floor) {
    const startFloor = floors.find((f) => f.id === startRoom.floor);
    const endFloor = floors.find((f) => f.id === endRoom.floor);
    
    if (!startFloor || !endFloor) return null;
    
    // Find stairs/elevator on start floor
    const startStairs = startFloor.rooms.find((r) => r.type === "stairs" || r.type === "elevator");
    const endStairs = endFloor.rooms.find((r) => r.type === "stairs" || r.type === "elevator");
    
    if (!startStairs || !endStairs) return null;
    
    // Build path: start -> stairs on start floor -> stairs on end floor -> end
    const pathToStairs = bfsPath(startRoom, startStairs, startFloor.rooms, roomMap);
    const pathFromStairs = bfsPath(endStairs, endRoom, endFloor.rooms, roomMap);
    
    if (!pathToStairs || !pathFromStairs) return null;
    
    const fullPath = [...pathToStairs.slice(0, -1), startStairs, endStairs, ...pathFromStairs.slice(1)];
    const steps = generateSteps(fullPath, startFloor.level, endFloor.level);
    
    return {
      path: fullPath,
      steps,
      totalDistance: steps.reduce((sum, s) => sum + s.distance, 0),
    };
  }
  
  // Same floor navigation
  const floor = floors.find((f) => f.id === startRoom.floor);
  if (!floor) return null;
  
  const path = bfsPath(startRoom, endRoom, floor.rooms, roomMap);
  if (!path) return null;
  
  const steps = generateSteps(path, floor.level, floor.level);
  
  return {
    path,
    steps,
    totalDistance: steps.reduce((sum, s) => sum + s.distance, 0),
  };
}

function bfsPath(
  start: Room,
  end: Room,
  floorRooms: Room[],
  roomMap: Map<string, Room>
): Room[] | null {
  const visited = new Set<string>();
  const queue: { room: Room; path: Room[] }[] = [{ room: start, path: [start] }];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current.room.id === end.id) {
      return current.path;
    }
    
    if (visited.has(current.room.id)) continue;
    visited.add(current.room.id);
    
    for (const connId of current.room.connections) {
      const neighbor = roomMap.get(connId);
      if (neighbor && !visited.has(connId) && floorRooms.some((r) => r.id === connId)) {
        queue.push({
          room: neighbor,
          path: [...current.path, neighbor],
        });
      }
    }
  }
  
  return null;
}

function generateSteps(path: Room[], startLevel: number, endLevel: number): NavigationStep[] {
  const steps: NavigationStep[] = [];
  
  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];
    const distance = calculateDistance(current, next);
    
    // Check if this is a floor transition
    if (current.floor !== next.floor) {
      const levelDiff = endLevel - startLevel;
      const direction = levelDiff > 0 ? "up" : "down";
      const floors = Math.abs(levelDiff);
      steps.push({
        instruction: `Take the ${current.type === "elevator" ? "elevator" : "stairs"} ${direction} ${floors} floor${floors > 1 ? "s" : ""}`,
        distance: floors * 10,
        floor: next.floor,
      });
    } else {
      steps.push({
        instruction: `Walk to ${next.name}`,
        distance,
        floor: current.floor,
      });
    }
  }
  
  if (path.length > 0) {
    const lastRoom = path[path.length - 1];
    steps.push({
      instruction: `Arrive at ${lastRoom.name}`,
      distance: 0,
      floor: lastRoom.floor,
    });
  }
  
  return steps;
}
