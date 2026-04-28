"use client";

import { useState, useMemo, useCallback } from "react";
import { Building2 } from "lucide-react";
import { FloorMap } from "@/components/floor-map";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { RoomDialog } from "@/components/room-dialog";
import { CoordinatePicker } from "@/components/coordinate-picker";
import {
  Room,
  Floor,
  PathResult,
  NavigationStep,
  defaultBuildingData,
  findPath,
} from "@/lib/building-data";

export default function IndoorNavPage() {
  // Building data state
  const [floors, setFloors] = useState<Floor[]>(defaultBuildingData);
  const [selectedFloor, setSelectedFloor] = useState("ground");

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

  // Filter rooms by search query
  const filteredRooms = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return allRooms.filter((room) =>
      room.name.toLowerCase().includes(query)
    );
  }, [allRooms, searchQuery]);

  // Handle floor change
  const handleFloorChange = useCallback((floorId: string) => {
    setSelectedFloor(floorId);
    setPickedCoordinates(null);
  }, []);

  // Handle room click
  const handleRoomClick = useCallback(
    (room: Room) => {
      if (isAdminMode) {
        setEditingRoom(room);
        setRoomDialogOpen(true);
      }
    },
    [isAdminMode]
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
      setFloors((prev) =>
        prev.map((floor) => {
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
        })
      );
      setEditingRoom(null);
      setPickedCoordinates(null);
      setIsPickingCoordinates(false);
    },
    []
  );

  // Handle delete room
  const handleDeleteRoom = useCallback((roomId: string) => {
    setFloors((prev) =>
      prev.map((floor) => ({
        ...floor,
        rooms: floor.rooms
          .filter((r) => r.id !== roomId)
          .map((r) => ({
            ...r,
            connections: r.connections.filter((c) => c !== roomId),
          })),
      }))
    );
  }, []);

  // Handle reset to default
  const handleResetData = useCallback(() => {
    setFloors(defaultBuildingData);
    setPathResult(null);
    setNavigationSteps([]);
    setFromRoom(null);
    setToRoom(null);
    setEditingRoom(null);
    setPickedCoordinates(null);
    setIsPickingCoordinates(false);
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
      } else if (!toRoom) {
        setToRoom(room);
      }
    },
    [fromRoom, toRoom]
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
              CB Building Navigation {isAdminMode && "(Admin)"}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <NavigationSidebar
            floors={floors}
            selectedFloor={selectedFloor}
            onFloorChange={handleFloorChange}
            allRooms={allRooms}
            fromRoom={fromRoom}
            toRoom={toRoom}
            onFromChange={setFromRoom}
            onToChange={setToRoom}
            onShowPath={handleShowPath}
            onClearPath={handleClearPath}
            navigationSteps={navigationSteps}
            isAdminMode={isAdminMode}
            onToggleAdminMode={() => setIsAdminMode(!isAdminMode)}
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
                onRoomClick={handleRoomClick}
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
