"use client";

import { useEffect, useMemo, useCallback, useRef, useState } from "react";
import { Building2 } from "lucide-react";
import { FloorMap } from "@/components/floor-map";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { RoomDialog } from "@/components/room-dialog";
import { CoordinatePicker } from "@/components/coordinate-picker";
import {
  Room,
  Floor,
  Building,
  PathResult,
  NavigationStep,
  defaultBuildings,
  findPath,
} from "@/lib/building-data";

export default function IndoorNavPage() {
  // Multi-building state
  const [buildings, setBuildings] = useState<Record<string, Building>>(defaultBuildings);
  const [selectedBuildingId, setSelectedBuildingId] = useState("cb");
  
  // Current building floors
  const floors = useMemo(() => buildings[selectedBuildingId]?.floors || [], [buildings, selectedBuildingId]);
  
  const [selectedFloor, setSelectedFloor] = useState("ground");
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const saveTimer = useRef<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const lastSavedBuildingsJson = useRef<string>(JSON.stringify(defaultBuildings));

  // Navigation state
  const [fromRoom, setFromRoom] = useState<Room | null>(null);
  const [toRoom, setToRoom] = useState<Room | null>(null);
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);

  // Admin state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isPickingCoordinates, setIsPickingCoordinates] = useState(false);
  const [pickedCoordinates, setPickedCoordinates] = useState<{ x: number; y: number } | null>(null);

  // Dialog state
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Get current floor data
  const currentFloor = useMemo(
    () => floors.find((f) => f.id === selectedFloor),
    [floors, selectedFloor]
  );

  // Get all rooms for search/select
  const allRooms = useMemo(() => floors.flatMap((f) => f.rooms), [floors]);

  // Load buildings from DB on startup
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/building", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data?.buildings) {
          setBuildings(data.buildings);
          lastSavedBuildingsJson.current = JSON.stringify(data.buildings);
          setHasUnsavedChanges(false);
          // Default start room in CB building
          const mainGate = data.buildings.cb.floors
            .flatMap((f: Floor) => f.rooms)
            .find((r: Room) => r.id === "main_gate");
          if (mainGate) setFromRoom(mainGate);
        }
      } catch {
        // ignore (keeps defaults)
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const performSave = useCallback(
    async (nextBuildings: Record<string, Building>) => {
      if (!adminKey) return false;
      try {
        setSaveStatus("saving");
        setSaveError(null);
        const res = await fetch("/api/admin/building", {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            "x-admin-key": adminKey,
          },
          body: JSON.stringify({ buildings: nextBuildings }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setSaveStatus("idle");
          setSaveError(data?.error || `Save failed (HTTP ${res.status})`);
          return false;
        }

        lastSavedBuildingsJson.current = JSON.stringify(nextBuildings);
        setHasUnsavedChanges(false);
        setSaveStatus("saved");
        window.setTimeout(() => setSaveStatus("idle"), 1200);
        return true;
      } catch {
        setSaveStatus("idle");
        setSaveError("Save failed (network). Is the server running?");
        return false;
      }
    },
    [adminKey]
  );

  const saveBuildingsToDb = useCallback(
    (nextBuildings: Record<string, Building>) => {
      if (!adminKey) return;
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        void performSave(nextBuildings);
      }, 400);
    },
    [adminKey, performSave]
  );

  const saveNow = useCallback(async () => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    return await performSave(buildings);
  }, [buildings, performSave]);

  // Filter rooms by search query
  const filteredRooms = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return allRooms.filter((room) =>
      room.name.toLowerCase().includes(query)
    );
  }, [allRooms, searchQuery]);

  // Handle building change
  const handleBuildingChange = useCallback((buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setSelectedFloor("ground");
    setFromRoom(null);
    setToRoom(null);
    setPathResult(null);
    setNavigationSteps([]);
  }, []);

  // Handle floor change
  const handleFloorChange = useCallback((floorId: string) => {
    setSelectedFloor(floorId);
    setPickedCoordinates(null);
  }, []);

  const handleRoomSelectOnMap = useCallback(
    (room: Room) => {
      if (isAdminMode) {
        setEditingRoom(room);
        return;
      }

      // If clicking the same room that's already the start, do nothing or clear it
      if (fromRoom?.id === room.id) {
        return;
      }

      // View mode: click-to-navigate behavior
      setSelectedFloor(room.floor);

      if (!fromRoom) {
        setFromRoom(room);
        // Show a temporary path-like highlight or just set the start
        return;
      }

      setToRoom(room);
      const result = findPath(fromRoom, room, floors);
      if (result) {
        setPathResult(result);
        setNavigationSteps(result.steps);
      } else {
        setPathResult(null);
        setNavigationSteps([
          {
            instruction: `No path found from ${fromRoom.name} to ${room.name}. Admin needs to connect these rooms.`,
            distance: 0,
            floor: room.floor,
          },
        ]);
      }
    },
    [isAdminMode, fromRoom, floors]
  );

  const handleRoomEditOnMap = useCallback(
    (room: Room) => {
      if (!isAdminMode) return;
      setEditingRoom(room);
      setRoomDialogOpen(true);
    },
    [isAdminMode]
  );

  const handleRoomUpdateOnMap = useCallback(
    (room: Room) => {
    setBuildings((prev) => {
      const currentBuilding = prev[selectedBuildingId];
      if (!currentBuilding) return prev;

      const nextFloors = currentBuilding.floors.map((floor) =>
        floor.id === room.floor
          ? {
              ...floor,
              rooms: floor.rooms.map((r) => (r.id === room.id ? room : r)),
            }
          : floor
      );

      const next = {
        ...prev,
        [selectedBuildingId]: { ...currentBuilding, floors: nextFloors }
      };

      if (isAdminMode) {
        const nextJson = JSON.stringify(next);
        setHasUnsavedChanges(nextJson !== lastSavedBuildingsJson.current);
      }
      saveBuildingsToDb(next);
      return next;
    });
    },
    [saveBuildingsToDb, isAdminMode, selectedBuildingId]
  );

  // Handle map click for coordinate picking
  const handleMapClick = useCallback(
    (x: number, y: number) => {
      if (isPickingCoordinates) {
        setPickedCoordinates({ x, y });
      }
    },
    [isPickingCoordinates]
  );

  // Handle show path
  const handleShowPath = useCallback(() => {
    if (!fromRoom || !toRoom) return;
    const result = findPath(fromRoom, toRoom, floors);
    if (result) {
      setPathResult(result);
      setNavigationSteps(result.steps);
      // Switch to the starting floor
      if (fromRoom.floor !== selectedFloor) {
        setSelectedFloor(fromRoom.floor);
      }
    }
  }, [fromRoom, toRoom, floors, selectedFloor]);

  // Handle clear path
  const handleClearPath = useCallback(() => {
    setPathResult(null);
    setNavigationSteps([]);
    setFromRoom(null);
    setToRoom(null);
  }, []);

  // Handle save room
  const handleSaveRoom = useCallback(
    (room: Room) => {
      setBuildings((prev) => {
        const currentBuilding = prev[selectedBuildingId];
        if (!currentBuilding) return prev;

        const nextFloors = currentBuilding.floors.map((floor) => {
          if (floor.id !== room.floor) {
            // Remove room from other floors if it was moved
            return {
              ...floor,
              rooms: floor.rooms.filter((r) => r.id !== room.id),
            };
          }
          const existingIndex = floor.rooms.findIndex((r) => r.id === room.id);
          if (existingIndex >= 0) {
            // Update existing room
            const newRooms = [...floor.rooms];
            newRooms[existingIndex] = room;
            // Update connections in connected rooms
            newRooms.forEach((r) => {
              if (room.connections.includes(r.id) && !r.connections.includes(room.id)) {
                r.connections.push(room.id);
              }
            });
            return { ...floor, rooms: newRooms };
          } else {
            // Add new room
            const newRooms = [...floor.rooms, room];
            // Add connections to corridor
            newRooms.forEach((r) => {
              if (room.connections.includes(r.id) && !r.connections.includes(room.id)) {
                r.connections.push(room.id);
              }
            });
            return { ...floor, rooms: newRooms };
          }
        });

        const next = {
          ...prev,
          [selectedBuildingId]: { ...currentBuilding, floors: nextFloors }
        };

        if (isAdminMode) {
          const nextJson = JSON.stringify(next);
          setHasUnsavedChanges(nextJson !== lastSavedBuildingsJson.current);
        }
        saveBuildingsToDb(next);
        return next;
      });
      setEditingRoom(null);
      setPickedCoordinates(null);
      setIsPickingCoordinates(false);
    },
    [saveBuildingsToDb, isAdminMode, selectedBuildingId]
  );

  // Handle delete room
  const handleDeleteRoom = useCallback(
    (roomId: string) => {
    setBuildings((prev) => {
      const currentBuilding = prev[selectedBuildingId];
      if (!currentBuilding) return prev;

      const nextFloors = currentBuilding.floors.map((floor) => ({
        ...floor,
        rooms: floor.rooms
          .filter((r) => r.id !== roomId)
          .map((r) => ({
            ...r,
            connections: r.connections.filter((c) => c !== roomId),
          })),
      }));

      const next = {
        ...prev,
        [selectedBuildingId]: { ...currentBuilding, floors: nextFloors }
      };

      if (isAdminMode) {
        const nextJson = JSON.stringify(next);
        setHasUnsavedChanges(nextJson !== lastSavedBuildingsJson.current);
      }
      saveBuildingsToDb(next);
      return next;
    });
    },
    [saveBuildingsToDb, isAdminMode, selectedBuildingId]
  );

  // Handle reset to default
  const handleResetData = useCallback(() => {
    setBuildings(defaultBuildings);
    setPathResult(null);
    setNavigationSteps([]);
    setFromRoom(null);
    setToRoom(null);
    setEditingRoom(null);
    setPickedCoordinates(null);
    setIsPickingCoordinates(false);
    lastSavedBuildingsJson.current = JSON.stringify(defaultBuildings);
    setHasUnsavedChanges(false);
  }, []);

  // Handle add room
  const handleAddRoom = useCallback(() => {
    setEditingRoom(null);
    setRoomDialogOpen(true);
  }, []);

  // Handle pick coordinates
  const handlePickCoordinates = useCallback(() => {
    setIsPickingCoordinates(!isPickingCoordinates);
    if (isPickingCoordinates) {
      setPickedCoordinates(null);
    }
  }, [isPickingCoordinates]);

  // Handle room select from search
  const handleRoomSelect = useCallback(
    (room: Room) => {
      setSelectedFloor(room.floor);
      if (!fromRoom) {
        setFromRoom(room);
      } else {
        setToRoom(room);
        // Automatically calculate path when selecting second room from search
        const result = findPath(fromRoom, room, floors);
        if (result) {
          setPathResult(result);
          setNavigationSteps(result.steps);
        }
      }
    },
    [fromRoom, floors]
  );

  // Handle add room at picked coordinates
  const handleAddRoomAtCoordinates = useCallback(() => {
    if (pickedCoordinates) {
      setEditingRoom(null);
      setRoomDialogOpen(true);
    }
  }, [pickedCoordinates]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">IndoorNav</h1>
            <p className="text-xs text-muted-foreground">
              {buildings[selectedBuildingId]?.name || "Building Navigation"} {isAdminMode && "(Admin)"}
            </p>
          </div>
          {isAdminMode && (
            <div className="ml-auto flex items-center gap-2">
              {saveStatus === "saving" && (
                <span className="text-xs text-muted-foreground">Saving…</span>
              )}
              {saveStatus === "saved" && (
                <span className="text-xs text-green-600">Saved</span>
              )}
              {saveError && (
                <span className="text-xs text-destructive max-w-[420px] truncate">
                  {saveError}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <NavigationSidebar
            buildings={buildings}
            selectedBuildingId={selectedBuildingId}
            onBuildingChange={handleBuildingChange}
            floors={floors}
            selectedFloor={selectedFloor}
            onFloorChange={handleFloorChange}
            allRooms={allRooms}
            fromRoom={fromRoom}
            toRoom={toRoom}
            onFromChange={(room) => {
              setFromRoom(room);
              setPathResult(null);
              setNavigationSteps([]);
            }}
            onToChange={(room) => {
              setToRoom(room);
              setPathResult(null);
              setNavigationSteps([]);
            }}
            onShowPath={handleShowPath}
            onClearPath={handleClearPath}
            navigationSteps={navigationSteps}
            isAdminMode={isAdminMode}
            onAdminLogin={(key) => {
              setAdminKey(key);
              setIsAdminMode(true);
              setSaveError(null);
              setSaveStatus("idle");
            }}
            onAdminLogout={() => {
              setIsAdminMode(false);
              setAdminKey(null);
              setSaveError(null);
              setSaveStatus("idle");
              setHasUnsavedChanges(false);
            }}
            hasUnsavedChanges={hasUnsavedChanges}
            saveStatus={saveStatus}
            saveError={saveError}
            onSaveNow={saveNow}
            onAddRoom={handleAddRoom}
            onPickCoordinates={handlePickCoordinates}
            onResetData={handleResetData}
            isPickingCoordinates={isPickingCoordinates}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filteredRooms={filteredRooms}
            onRoomSelect={handleRoomSelect}
          />

          {/* Map Area */}
          <div className="flex-1 relative">
            {currentFloor && (
              <FloorMap
                rooms={currentFloor.rooms}
                floorName={currentFloor.name}
                selectedRoom={editingRoom}
                pathResult={pathResult}
                isAdminMode={isAdminMode}
                isPickingCoordinates={isPickingCoordinates}
                onRoomSelect={handleRoomSelectOnMap}
                onRoomEdit={handleRoomEditOnMap}
                onRoomUpdate={handleRoomUpdateOnMap}
                onMapClick={handleMapClick}
              />
            )}

            {/* Coordinate Picker Panel */}
            {isPickingCoordinates && pickedCoordinates && (
              <CoordinatePicker
                x={pickedCoordinates.x}
                y={pickedCoordinates.y}
                onClose={() => {
                  setPickedCoordinates(null);
                  setIsPickingCoordinates(false);
                }}
                onAddRoom={handleAddRoomAtCoordinates}
              />
            )}
          </div>
        </div>
      </main>

      {/* Room Dialog */}
      <RoomDialog
        open={roomDialogOpen}
        onOpenChange={setRoomDialogOpen}
        room={editingRoom}
        floors={floors}
        currentFloor={selectedFloor}
        onSave={handleSaveRoom}
        onDelete={editingRoom ? handleDeleteRoom : undefined}
        initialX={pickedCoordinates?.x}
        initialY={pickedCoordinates?.y}
      />
    </div>
  );
}
