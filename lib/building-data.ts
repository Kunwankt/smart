export interface Room {
  id: string;
  name: string;
  floor: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type:
    | "room"
    | "corridor"
    | "stairs"
    | "elevator"
    | "entrance"
    | "washroom"
    | "office"
    | "audi"
    | "stairs-lift"
    | "gate"
    | "desk"
    | "lab"
    | "classroom"
    | "fire"
    | "faculty";
  connections: string[];
}

export interface Floor {
  id: string;
  name: string;
  level: number;
  rooms: Room[];
}

// Allows defining exact step counts between two directly connected rooms.
// Key format: "<fromId>-><toId>" (order doesn't matter; we check both directions).
export const stepOverrides: Record<string, number> = {
  "main_gate->help_desk": 2,
  "help_desk->center_gate_left": 10,
};

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
      {
        id: "main_gate",
        name: "Main Gate",
        floor: "ground",
        x: 400,
        y: 700,
        width: 120,
        height: 60,
        type: "gate",
        connections: ["help_desk"],
      },
      {
        id: "help_desk",
        name: "Help Desk",
        floor: "ground",
        x: 400,
        y: 600,
        width: 140,
        height: 50,
        type: "desk",
        connections: ["main_gate", "center_gate_left"],
      },
      {
        id: "center_gate_left",
        name: "Center Gate (Entry)",
        floor: "ground",
        x: 400,
        y: 350,
        width: 100,
        height: 60,
        type: "gate",
        connections: ["help_desk", "colonel", "lift_left_g", "stairs_left_g", "room_011"],
      },
      {
        id: "center_gate_right",
        name: "Center Gate (Exit)",
        floor: "ground",
        x: 500,
        y: 350,
        width: 100,
        height: 60,
        type: "gate",
        connections: [],
      },
      {
        id: "lift_left_g",
        name: "Lift (Left)",
        floor: "ground",
        x: 300,
        y: 350,
        width: 60,
        height: 60,
        type: "stairs-lift",
        connections: ["center_gate_left"],
      },
      {
        id: "stairs_left_g",
        name: "Stairs (Left)",
        floor: "ground",
        x: 230,
        y: 350,
        width: 60,
        height: 60,
        type: "stairs-lift",
        connections: ["center_gate_left"],
      },
      {
        id: "lift_right_g",
        name: "Lift (Right)",
        floor: "ground",
        x: 640,
        y: 350,
        width: 60,
        height: 60,
        type: "stairs-lift",
        connections: [],
      },
      {
        id: "stairs_right_g",
        name: "Stairs (Right)",
        floor: "ground",
        x: 710,
        y: 350,
        width: 60,
        height: 60,
        type: "stairs-lift",
        connections: [],
      },
      {
        id: "exit_left",
        name: "Exit (Left End)",
        floor: "ground",
        x: 20,
        y: 80,
        width: 80,
        height: 80,
        type: "gate",
        connections: [],
      },
      {
        id: "washroom_girls",
        name: "Washroom (Girls)",
        floor: "ground",
        x: 110,
        y: 80,
        width: 120,
        height: 80,
        type: "washroom",
        connections: [],
      },
      {
        id: "colonel",
        name: "Colonel's Office",
        floor: "ground",
        x: 47,
        y: 210,
        width: 173,
        height: 95,
        type: "office",
        connections: ["center_gate_left"],
      },
      {
        id: "room_011",
        name: "011 Room",
        floor: "ground",
        x: 243,
        y: 83,
        width: 100,
        height: 80,
        type: "office",
        connections: ["center_gate_left", "executive_hall"],
      },
      {
        id: "executive_hall",
        name: "012 Executive Hall",
        floor: "ground",
        x: 354,
        y: 80,
        width: 349,
        height: 77,
        type: "office",
        connections: ["room_011", "washroom_male"],
      },
      {
        id: "washroom_male",
        name: "Washroom (Male)",
        floor: "ground",
        x: 710,
        y: 80,
        width: 120,
        height: 80,
        type: "washroom",
        connections: ["executive_hall", "audi_sv"],
      },
      {
        id: "audi_sv",
        name: "Audi SV",
        floor: "ground",
        x: 860,
        y: 50,
        width: 100,
        height: 200,
        type: "audi",
        connections: ["washroom_male"],
      },
    ],
  },
  {
    id: "1st",
    name: "1st Floor",
    level: 1,
    rooms: [
      {
        id: "lift_left_1",
        name: "Lift (Left)",
        floor: "1st",
        x: 300,
        y: 350,
        width: 60,
        height: 60,
        type: "stairs-lift",
        connections: ["hod", "staff1"],
      },
      {
        id: "stairs_left_1",
        name: "Stairs (Left)",
        floor: "1st",
        x: 230,
        y: 350,
        width: 60,
        height: 60,
        type: "stairs-lift",
        connections: ["hod", "staff1"],
      },
      {
        id: "hod",
        name: "HOD Office",
        floor: "1st",
        x: 50,
        y: 50,
        width: 150,
        height: 150,
        type: "office",
        connections: ["lift_left_1"],
      },
      {
        id: "staff1",
        name: "Staff Room A",
        floor: "1st",
        x: 210,
        y: 50,
        width: 150,
        height: 150,
        type: "office",
        connections: ["lift_left_1"],
      },
    ],
  },
  {
    id: "2nd",
    name: "2nd Floor",
    level: 2,
    rooms: [
      {
        id: "lift_left_2",
        name: "Lift (Left)",
        floor: "2nd",
        x: 300,
        y: 350,
        width: 60,
        height: 60,
        type: "stairs-lift",
        connections: ["lab1"],
      },
      {
        id: "stairs_left_2",
        name: "Stairs (Left)",
        floor: "2nd",
        x: 230,
        y: 350,
        width: 60,
        height: 60,
        type: "stairs-lift",
        connections: ["lab1"],
      },
      {
        id: "lab1",
        name: "Computer Lab 1",
        floor: "2nd",
        x: 50,
        y: 50,
        width: 150,
        height: 150,
        type: "lab",
        connections: ["lift_left_2"],
      },
    ],
  },
  {
    id: "3rd",
    name: "3rd Floor",
    level: 3,
    rooms: [
      {
        id: "lift_left_3",
        name: "Lift (Left)",
        floor: "3rd",
        x: 300,
        y: 350,
        width: 60,
        height: 60,
        type: "stairs-lift",
        connections: ["cr1"],
      },
      {
        id: "stairs_left_3",
        name: "Stairs (Left)",
        floor: "3rd",
        x: 230,
        y: 350,
        width: 60,
        height: 60,
        type: "stairs-lift",
        connections: ["cr1"],
      },
      {
        id: "cr1",
        name: "Classroom 301",
        floor: "3rd",
        x: 50,
        y: 50,
        width: 150,
        height: 150,
        type: "classroom",
        connections: ["lift_left_3"],
      },
    ],
  },
  {
    id: "4th",
    name: "4th Floor",
    level: 4,
    rooms: [
      {
        id: "lift_left_4",
        name: "Lift (Left)",
        floor: "4th",
        x: 300,
        y: 350,
        width: 60,
        height: 60,
        type: "stairs-lift",
        connections: ["auditorium"],
      },
      {
        id: "stairs_left_4",
        name: "Stairs (Left)",
        floor: "4th",
        x: 230,
        y: 350,
        width: 60,
        height: 60,
        type: "stairs-lift",
        connections: ["auditorium"],
      },
      {
        id: "auditorium",
        name: "Auditorium",
        floor: "4th",
        x: 50,
        y: 50,
        width: 700,
        height: 150,
        type: "audi",
        connections: ["lift_left_4"],
      },
    ],
  },
  {
    id: "5th",
    name: "5th Floor",
    level: 5,
    rooms: [
      {
        id: "lift_left_5",
        name: "Lift (Left)",
        floor: "5th",
        x: 300,
        y: 350,
        width: 60,
        height: 60,
        type: "stairs-lift",
        connections: ["library"],
      },
      {
        id: "stairs_left_5",
        name: "Stairs (Left)",
        floor: "5th",
        x: 230,
        y: 350,
        width: 60,
        height: 60,
        type: "stairs-lift",
        connections: ["library"],
      },
      {
        id: "library",
        name: "Main Library",
        floor: "5th",
        x: 50,
        y: 50,
        width: 500,
        height: 400,
        type: "office",
        connections: ["lift_left_5"],
      },
    ],
  },
];

// Calculate distance between two rooms (Manhattan distance for indoor navigation)
export function calculateDistance(room1: Room, room2: Room): number {
  const override =
    stepOverrides[`${room1.id}->${room2.id}`] ??
    stepOverrides[`${room2.id}->${room1.id}`];
  if (typeof override === "number") return override;

  const dx = Math.abs((room1.x + room1.width / 2) - (room2.x + room2.width / 2));
  const dy = Math.abs((room1.y + room1.height / 2) - (room2.y + room2.height / 2));
  return Math.round((dx + dy) / 10); // Convert to approximate steps
}

function isConnector(room: Room) {
  return (
    room.type === "stairs" || room.type === "elevator" || room.type === "stairs-lift"
  );
}

function connectorKey(roomId: string) {
  // Matches patterns like:
  // - lift_left_g, lift_left_1, lift_left_2 -> lift_left
  // - stairs_0, stairs_1 -> stairs
  // - elevator_a_g, elevator_a_1 -> elevator_a
  return roomId.replace(/(_(g|\d+))?$/i, "").replace(/_$/, "");
}

function buildRoomIndex(floors: Floor[]) {
  const allRooms = floors.flatMap((f) => f.rooms);
  const roomById = new Map(allRooms.map((r) => [r.id, r]));
  const floorLevelById = new Map(floors.map((f) => [f.id, f.level]));
  return { allRooms, roomById, floorLevelById };
}

function buildAdjacency(floors: Floor[]) {
  const { allRooms, roomById, floorLevelById } = buildRoomIndex(floors);

  const neighbors = new Map<string, { to: string; weight: number }[]>();
  const addEdge = (from: string, to: string, weight: number) => {
    const list = neighbors.get(from) ?? [];
    list.push({ to, weight });
    neighbors.set(from, list);
  };

  // Same-floor and cross-floor explicit edges
  for (const room of allRooms) {
    for (const connId of room.connections) {
      const neighbor = roomById.get(connId);
      if (!neighbor) continue;
      
      const w = calculateDistance(room, neighbor);
      // If they are on different floors, add a vertical cost
      const floorA = floorLevelById.get(room.floor) ?? 0;
      const floorB = floorLevelById.get(neighbor.floor) ?? 0;
      const verticalCost = Math.abs(floorA - floorB) * 15; // 15 steps per floor
      
      addEdge(room.id, neighbor.id, w + verticalCost);
      addEdge(neighbor.id, room.id, w + verticalCost);
    }
  }

  // Cross-floor connector edges (stairs/lift) auto-linked by id pattern.
  const connectors = allRooms.filter(isConnector);
  const byKey = new Map<string, Room[]>();
  for (const c of connectors) {
    const key = connectorKey(c.id);
    const list = byKey.get(key) ?? [];
    list.push(c);
    byKey.set(key, list);
  }

  for (const [, list] of byKey) {
    const sorted = list
      .slice()
      .sort(
        (a, b) =>
          (floorLevelById.get(a.floor) ?? 0) - (floorLevelById.get(b.floor) ?? 0)
      );

    // Link adjacent floors only (more realistic than fully connecting every floor).
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i];
      const b = sorted[i + 1];
      const levelA = floorLevelById.get(a.floor);
      const levelB = floorLevelById.get(b.floor);
      if (typeof levelA !== "number" || typeof levelB !== "number") continue;

      const floorsDiff = Math.abs(levelB - levelA);
      const verticalCost = Math.max(1, floorsDiff) * 10; // ~10 steps per floor
      addEdge(a.id, b.id, verticalCost);
      addEdge(b.id, a.id, verticalCost);
    }
  }

  return { neighbors, roomById, floorLevelById };
}

function dijkstraPath(
  startId: string,
  endId: string,
  neighbors: Map<string, { to: string; weight: number }[]>
) {
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();

  dist.set(startId, 0);
  prev.set(startId, null);

  // Small dataset: simple O(V^2) Dijkstra keeps this dependency-free.
  while (true) {
    let current: string | null = null;
    let currentDist = Number.POSITIVE_INFINITY;

    for (const [id, d] of dist) {
      if (visited.has(id)) continue;
      if (d < currentDist) {
        current = id;
        currentDist = d;
      }
    }

    if (!current) return null;
    if (current === endId) break;

    visited.add(current);
    const outs = neighbors.get(current) ?? [];
    for (const { to, weight } of outs) {
      if (visited.has(to)) continue;
      const nextDist = currentDist + weight;
      const prevDist = dist.get(to);
      if (prevDist === undefined || nextDist < prevDist) {
        dist.set(to, nextDist);
        prev.set(to, current);
      }
    }
  }

  const pathIds: string[] = [];
  let cur: string | null = endId;
  while (cur) {
    pathIds.push(cur);
    cur = prev.get(cur) ?? null;
  }
  pathIds.reverse();
  return pathIds;
}

function edgeWeight(
  fromId: string,
  toId: string,
  neighbors: Map<string, { to: string; weight: number }[]>
) {
  const outs = neighbors.get(fromId) ?? [];
  return outs.find((e) => e.to === toId)?.weight ?? null;
}

function generateStepsForGraphPath(
  path: Room[],
  floorLevelById: Map<string, number>,
  neighbors: Map<string, { to: string; weight: number }[]>
): NavigationStep[] {
  const steps: NavigationStep[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];
    const w = edgeWeight(current.id, next.id, neighbors) ?? calculateDistance(current, next);

    if (current.floor !== next.floor) {
      const levelA = floorLevelById.get(current.floor);
      const levelB = floorLevelById.get(next.floor);
      const diff =
        typeof levelA === "number" && typeof levelB === "number" ? levelB - levelA : 0;
      const direction = diff >= 0 ? "up" : "down";
      const floorsCount = Math.max(1, Math.abs(diff));

      steps.push({
        instruction: `Take the ${
          current.type === "elevator" || current.type === "stairs-lift" ? "lift" : "stairs"
        } ${direction} ${floorsCount} floor${floorsCount > 1 ? "s" : ""}`,
        distance: w,
        floor: next.floor,
      });
    } else {
      steps.push({
        instruction: `Walk to ${next.name}`,
        distance: w,
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

// Shortest-path navigation across the whole building (like Google Maps).
export function findPath(
  startRoom: Room,
  endRoom: Room,
  floors: Floor[]
): PathResult | null {
  const { neighbors, roomById, floorLevelById } = buildAdjacency(floors);
  const pathIds = dijkstraPath(startRoom.id, endRoom.id, neighbors);
  if (!pathIds) return null;

  const pathRooms: Room[] = [];
  for (const id of pathIds) {
    const r = roomById.get(id);
    if (!r) return null;
    pathRooms.push(r);
  }

  const steps = generateStepsForGraphPath(pathRooms, floorLevelById, neighbors);
  return {
    path: pathRooms,
    steps,
    totalDistance: steps.reduce((sum, s) => sum + s.distance, 0),
  };
}
