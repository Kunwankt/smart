"use client";

import { useState } from "react";
import { Search, MapPin, Navigation, Plus, MousePointer, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Room, Floor, NavigationStep } from "@/lib/building-data";

interface NavigationSidebarProps {
  floors: Floor[];
  selectedFloor: string;
  onFloorChange: (floorId: string) => void;
  allRooms: Room[];
  fromRoom: Room | null;
  toRoom: Room | null;
  onFromChange: (room: Room | null) => void;
  onToChange: (room: Room | null) => void;
  onShowPath: () => void;
  onClearPath: () => void;
  navigationSteps: NavigationStep[];
  isAdminMode: boolean;
  onAdminLogin: (adminKey: string) => void;
  onAdminLogout: () => void;
  hasUnsavedChanges: boolean;
  saveStatus: "idle" | "saving" | "saved";
  saveError: string | null;
  onSaveNow: () => Promise<boolean>;
  onAddRoom: () => void;
  onPickCoordinates: () => void;
  onResetData: () => void;
  isPickingCoordinates: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredRooms: Room[];
  onRoomSelect: (room: Room) => void;
}

export function NavigationSidebar({
  floors,
  selectedFloor,
  onFloorChange,
  allRooms,
  fromRoom,
  toRoom,
  onFromChange,
  onToChange,
  onShowPath,
  onClearPath,
  navigationSteps,
  isAdminMode,
  onAdminLogin,
  onAdminLogout,
  hasUnsavedChanges,
  saveStatus,
  saveError,
  onSaveNow,
  onAddRoom,
  onPickCoordinates,
  onResetData,
  isPickingCoordinates,
  searchQuery,
  onSearchChange,
  filteredRooms,
  onRoomSelect,
}: NavigationSidebarProps) {
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [exitBusy, setExitBusy] = useState(false);

  const handleAdminBadgeClick = () => {
    if (isAdminMode) {
      if (hasUnsavedChanges || saveStatus === "saving") {
        setExitConfirmOpen(true);
        return;
      }
      onAdminLogout();
      return;
    }
    setAdminPassword("");
    setAdminError(null);
    setAdminDialogOpen(true);
  };

  const handleAdminLogin = () => {
    const expectedKey = process.env.NEXT_PUBLIC_ADMIN_KEY || "change-me";
    
    if (adminPassword !== expectedKey) {
      setAdminError("Wrong admin password.");
      return;
    }
    
    setAdminDialogOpen(false);
    setAdminPassword("");
    setAdminError(null);
    onAdminLogin(expectedKey);
  };

  return (
    <div className="w-80 flex flex-col gap-4 h-full overflow-y-auto">
      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Room
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSearchResults(e.target.value.length > 0);
              }}
              onFocus={() => setShowSearchResults(searchQuery.length > 0)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            />
            {showSearchResults && filteredRooms.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                {filteredRooms.slice(0, 8).map((room) => (
                  <button
                    key={room.id}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between"
                    onClick={() => {
                      onRoomSelect(room);
                      setShowSearchResults(false);
                      onSearchChange("");
                    }}
                  >
                    <span>{room.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {floors.find((f) => f.id === room.floor)?.name || room.floor}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Floor Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Select Floor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {floors
              .slice()
              .sort((a, b) => b.level - a.level)
              .map((floor) => (
                <Button
                  key={floor.id}
                  variant={selectedFloor === floor.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFloorChange(floor.id)}
                  className="text-xs"
                >
                  {floor.name}
                </Button>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            Admin Controls
            <Badge
              variant={isAdminMode ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={handleAdminBadgeClick}
            >
              {isAdminMode ? "Admin: ON" : "Admin: OFF (click)"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddRoom}
              disabled={!isAdminMode}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Room
            </Button>
            <Button
              variant={isPickingCoordinates ? "default" : "outline"}
              size="sm"
              onClick={onPickCoordinates}
              disabled={!isAdminMode}
              className="text-xs"
            >
              <MousePointer className="h-3 w-3 mr-1" />
              Pick Coords
            </Button>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={async () => {
              if (!isAdminMode) return;
              setExitBusy(true);
              try {
                await onSaveNow();
              } finally {
                setExitBusy(false);
              }
            }}
            disabled={!isAdminMode || saveStatus === "saving" || exitBusy || !hasUnsavedChanges}
            className="w-full text-xs"
          >
            {saveStatus === "saving" || exitBusy ? "Saving…" : "Save Changes"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetData}
            className="w-full text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset to Default
          </Button>
          {isAdminMode && (
            <div className="space-y-1">
              {hasUnsavedChanges && saveStatus !== "saving" && (
                <p className="text-xs text-muted-foreground">
                  You have unsaved changes.
                </p>
              )}
              {saveError && (
                <p className="text-xs text-destructive truncate">{saveError}</p>
              )}
            </div>
          )}
          {isAdminMode && (
            <p className="text-xs text-muted-foreground">
              Click any room on the map to edit or delete it.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Directions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Directions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <Select
              value={fromRoom?.id || ""}
              onValueChange={(val) => {
                const room = allRooms.find((r) => r.id === val);
                onFromChange(room || null);
              }}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select starting point">
                  {fromRoom ? (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-accent" />
                      {floors.find((f) => f.id === fromRoom.floor)?.name}: {fromRoom.name}
                    </span>
                  ) : (
                    "Select starting point"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {floors.map((floor) => (
                  <div key={floor.id}>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted">
                      {floor.name}
                    </div>
                    {floor.rooms
                      .filter((r) => r.type !== "corridor")
                      .map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name}
                        </SelectItem>
                      ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <Select
              value={toRoom?.id || ""}
              onValueChange={(val) => {
                const room = allRooms.find((r) => r.id === val);
                onToChange(room || null);
              }}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select destination">
                  {toRoom ? (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-primary" />
                      {floors.find((f) => f.id === toRoom.floor)?.name}: {toRoom.name}
                    </span>
                  ) : (
                    "Select destination"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {floors.map((floor) => (
                  <div key={floor.id}>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted">
                      {floor.name}
                    </div>
                    {floor.rooms
                      .filter((r) => r.type !== "corridor")
                      .map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name}
                        </SelectItem>
                      ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onShowPath}
              disabled={!fromRoom || !toRoom}
              className="flex-1"
              size="sm"
            >
              Show Path
            </Button>
            <Button variant="outline" onClick={onClearPath} size="sm">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Steps */}
      {navigationSteps.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Navigation Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {navigationSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{step.instruction}</p>
                      {step.distance > 0 && (
                        <p className="text-xs text-muted-foreground">
                          ~{step.distance} steps
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="my-3" />
            <div className="text-sm font-medium text-center">
              Total: ~{navigationSteps.reduce((sum, s) => sum + s.distance, 0)} steps
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
            <DialogDescription>
              Enter the admin password to enable building editing controls.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Admin password..."
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
            />
            {adminError && (
              <p className="text-xs text-destructive mt-2 font-medium">{adminError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdminLogin}>Login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exitConfirmOpen} onOpenChange={setExitConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Admin Mode?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Save them before exiting?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setExitConfirmOpen(false)}
              disabled={exitBusy || saveStatus === "saving"}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setExitConfirmOpen(false);
                onAdminLogout();
              }}
              disabled={exitBusy || saveStatus === "saving"}
            >
              Exit without saving
            </Button>
            <Button
              onClick={async () => {
                setExitBusy(true);
                try {
                  const ok = await onSaveNow();
                  if (ok) {
                    setExitConfirmOpen(false);
                    onAdminLogout();
                  }
                } finally {
                  setExitBusy(false);
                }
              }}
              disabled={exitBusy || saveStatus === "saving"}
            >
              Save & exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
