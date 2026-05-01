"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Navigation, Plus, MousePointer, RotateCcw, Database, Wifi, WifiOff, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db, enableNetwork } from "@/lib/firebase";
import { onSnapshot, doc } from "firebase/firestore";

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
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean | null>(null);
  const [showDiag, setShowDiag] = useState(false);
  const [isAdBlockDetected, setIsAdBlockDetected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const firebaseDiag = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "MISSING",
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "SET (OK)" : "MISSING",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "SET (OK)" : "MISSING",
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ? "SET (OK)" : "NOT SET",
  };

  const handleReconnect = async () => {
    if (!db) return;
    setIsReconnecting(true);
    try {
      await enableNetwork(db);
      console.log("Network enabled manually");
    } catch (err) {
      console.error("Failed to enable network manually:", err);
    } finally {
      setTimeout(() => setIsReconnecting(false), 1000);
    }
  };

  useEffect(() => {
    if (!db) {
      setIsFirebaseConnected(false);
      return;
    }
    // Check connection status by listening to a document
    const unsub = onSnapshot(
      doc(db, "building", "cb_building"),
      { includeMetadataChanges: true },
      (snapshot) => {
        setIsFirebaseConnected(!snapshot.metadata.fromCache);
        setIsAdBlockDetected(false);
      },
      (error: any) => {
        console.warn("Firebase connection status check failed:", error);
        setIsFirebaseConnected(false);
        // Detect if blocked by client (ad-blocker)
        if (error.message?.includes("blocked-by-client") || error.code === "unavailable") {
          setIsAdBlockDetected(true);
        }
      }
    );
    return () => unsub();
  }, []);

  const handleAdminBadgeClick = () => {
    if (isAdminMode) {
      if (hasUnsavedChanges) {
        setExitConfirmOpen(true);
      } else {
        onAdminLogout();
      }
    } else {
      setAdminDialogOpen(true);
    }
  };

  const handleAdminLogin = () => {
    const expectedKey = process.env.NEXT_PUBLIC_ADMIN_KEY || "change-me";
    if (adminPassword !== expectedKey) {
      setAdminError("Wrong admin password.");
      return;
    }
    onAdminLogin(expectedKey);
    setAdminPassword("");
    setAdminError(null);
    setAdminDialogOpen(false);
  };

  const handleExitConfirm = async () => {
    setExitBusy(true);
    try {
      const success = await onSaveNow();
      if (success) {
        onAdminLogout();
        setExitConfirmOpen(false);
      }
    } finally {
      setExitBusy(false);
    }
  };

  return (
    <div className="w-80 flex flex-col h-full bg-background border-r border-border p-4 gap-4 overflow-hidden">
      <Card className="flex-shrink-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            Admin Controls
            <div className="flex items-center gap-2">
              {db && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {isFirebaseConnected === null ? (
                    <Database className="h-3 w-3 text-gray-400 animate-pulse" />
                  ) : isFirebaseConnected ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                  <span>Firebase</span>
                </div>
              )}
              <Badge 
                variant={isAdminMode ? "default" : "outline"} 
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onClick={handleAdminBadgeClick}
              >
                {isAdminMode ? "Admin On" : "Admin Off"}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={() => setShowDiag(!showDiag)}
              >
                <Info className="h-3 w-3" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showDiag && (
            <div className="p-2 bg-muted rounded-md text-[10px] space-y-1 font-mono">
              <div className="flex justify-between border-b border-border pb-1 mb-1 font-bold">
                <span>Firebase Diagnostics</span>
                <span className={isFirebaseConnected ? "text-green-500" : "text-red-500"}>
                  {isFirebaseConnected ? "CONNECTED" : "DISCONNECTED"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Project:</span>
                <span className="text-blue-500 truncate ml-2 max-w-[120px]">{firebaseDiag.projectId}</span>
              </div>
              <div className="flex justify-between">
                <span>API Key:</span>
                <span className={firebaseDiag.apiKey === "MISSING" ? "text-red-500" : "text-green-500"}>
                  {firebaseDiag.apiKey}
                </span>
              </div>
              <div className="flex justify-between">
                <span>App ID:</span>
                <span className={firebaseDiag.appId === "MISSING" ? "text-red-500" : "text-green-500"}>
                  {firebaseDiag.appId}
                </span>
              </div>
              <div className="flex justify-between">
                <span>DB URL:</span>
                <span className={firebaseDiag.databaseURL === "NOT SET" ? "text-yellow-500" : "text-green-500"}>
                  {firebaseDiag.databaseURL}
                </span>
              </div>
              {isAdBlockDetected && (
                <div className="mt-2 p-1 bg-red-500/20 text-red-400 font-bold border border-red-500/50 rounded animate-pulse">
                  ⚠️ AD-BLOCKER DETECTED!
                  <div className="font-normal mt-1">
                    Disable AdBlock/uBlock for localhost to allow sync.
                  </div>
                </div>
              )}
              {!isFirebaseConnected && !isAdBlockDetected && (
                <div className="mt-2 space-y-2">
                  <div className="text-red-400 italic">
                    * Restart terminal after editing .env.local
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-[10px] h-7 flex items-center gap-2"
                    onClick={handleReconnect}
                    disabled={isReconnecting}
                  >
                    <RefreshCw className={`h-3 w-3 ${isReconnecting ? "animate-spin" : ""}`} />
                    Try Reconnect
                  </Button>
                </div>
              )}
            </div>
          )}
          {isAdminMode ? (
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline" size="sm" onClick={onAddRoom}>
                <Plus className="mr-2 h-4 w-4" /> Add Room
              </Button>
              <Button 
                className={`w-full justify-start ${isPickingCoordinates ? "bg-primary text-primary-foreground" : ""}`} 
                variant="outline" 
                size="sm" 
                onClick={onPickCoordinates}
              >
                <MousePointer className="mr-2 h-4 w-4" /> 
                {isPickingCoordinates ? "Click Map Now" : "Pick Coordinates"}
              </Button>
              <Button className="w-full justify-start" variant="outline" size="sm" onClick={onResetData}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reset Data
              </Button>
              <Separator className="my-2" />
              <Button 
                className="w-full" 
                variant={hasUnsavedChanges ? "default" : "secondary"} 
                size="sm" 
                onClick={onSaveNow}
                disabled={saveStatus === "saving" || !hasUnsavedChanges}
              >
                {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Now"}
              </Button>
              {saveError && <p className="text-[10px] text-destructive mt-1">{saveError}</p>}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Login as admin to edit the map.</p>
          )}
        </CardContent>
      </Card>

      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          placeholder="Search rooms..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setShowSearchResults(true);
          }}
          onFocus={() => setShowSearchResults(true)}
        />
        {showSearchResults && filteredRooms.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg max-h-60 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {filteredRooms.map((room) => (
                  <Button
                    key={room.id}
                    variant="ghost"
                    className="w-full justify-start text-sm h-8"
                    onClick={() => {
                      onRoomSelect(room);
                      setShowSearchResults(false);
                    }}
                  >
                    <MapPin className="mr-2 h-3 w-3" />
                    {room.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>

      <div className="space-y-4 overflow-hidden flex flex-col min-h-0">
        <div className="space-y-2">
          <label className="text-sm font-medium">Floor</label>
          <Select value={selectedFloor} onValueChange={onFloorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select floor" />
            </SelectTrigger>
            <SelectContent>
              {floors.map((floor) => (
                <SelectItem key={floor.id} value={floor.id}>
                  {floor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">From</label>
          <Select 
            value={fromRoom?.id || ""} 
            onValueChange={(val) => onFromChange(allRooms.find(r => r.id === val) || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select starting point" />
            </SelectTrigger>
            <SelectContent>
              {allRooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">To</label>
          <Select 
            value={toRoom?.id || ""} 
            onValueChange={(val) => onToChange(allRooms.find(r => r.id === val) || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent>
              {allRooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" onClick={onShowPath} disabled={!fromRoom || !toRoom}>
          <Navigation className="mr-2 h-4 w-4" /> Show Path
        </Button>

        {navigationSteps.length > 0 && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Directions</label>
              <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={onClearPath}>
                Clear
              </Button>
            </div>
            <ScrollArea className="flex-1 border rounded-md p-3 bg-muted/50">
              <div className="space-y-3">
                {navigationSteps.map((step, idx) => (
                  <div key={idx} className="text-sm flex gap-3">
                    <span className="text-muted-foreground font-mono">{idx + 1}.</span>
                    <span>{step.instruction}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
            <DialogDescription>
              Enter the admin password to enable editing mode.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              />
              {adminError && <p className="text-sm text-destructive">{adminError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdminLogin}>Login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exitConfirmOpen} onOpenChange={setExitConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Would you like to save them before logging out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { onAdminLogout(); setExitConfirmOpen(false); }} disabled={exitBusy}>
              Discard Changes
            </Button>
            <Button onClick={handleExitConfirm} disabled={exitBusy}>
              {exitBusy ? "Saving..." : "Save and Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
