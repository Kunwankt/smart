"use client";

import { useState, useEffect } from "react";
import { Room, Floor } from "@/lib/building-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  floors: Floor[];
  currentFloor: string;
  onSave: (room: Room) => void;
  onDelete?: (roomId: string) => void;
  initialX?: number;
  initialY?: number;
}

const roomTypes: Room["type"][] = [
  "room",
  "corridor",
  "stairs",
  "elevator",
  "entrance",
  "washroom",
  "office",
  "audi",
  "stairs-lift",
  "gate",
  "desk",
  "lab",
  "classroom",
  "fire",
  "faculty",
];

export function RoomDialog({
  open,
  onOpenChange,
  room,
  floors,
  currentFloor,
  onSave,
  onDelete,
  initialX = 100,
  initialY = 100,
}: RoomDialogProps) {
  const [formData, setFormData] = useState<Partial<Room>>({
    id: "",
    name: "",
    floor: currentFloor,
    x: initialX,
    y: initialY,
    width: 100,
    height: 70,
    type: "room",
    connections: [],
  });

  useEffect(() => {
    if (room) {
      setFormData({ ...room });
    } else {
      setFormData({
        id: `room-${Date.now()}`,
        name: "",
        floor: currentFloor,
        x: initialX,
        y: initialY,
        width: 100,
        height: 70,
        type: "room",
        connections: [],
      });
    }
  }, [room, currentFloor, initialX, initialY]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.id) return;

    // Auto-connect to corridors on the same floor
    const floor = floors.find((f) => f.id === formData.floor);
    const corridors = floor?.rooms.filter((r) => r.type === "corridor") || [];
    const connections = formData.connections || [];
    
    corridors.forEach((corridor) => {
      if (!connections.includes(corridor.id)) {
        connections.push(corridor.id);
      }
    });

    onSave({
      id: formData.id!,
      name: formData.name!,
      floor: formData.floor || currentFloor,
      x: formData.x || initialX,
      y: formData.y || initialY,
      width: formData.width || 100,
      height: formData.height || 70,
      type: formData.type || "room",
      connections,
    });
    onOpenChange(false);
  };

  const isEditing = !!room;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Room" : "Add New Room"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modify the room details below."
              : "Enter the details for the new room."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                placeholder="Room name"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: Room["type"]) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="floor" className="text-right">
                Floor
              </Label>
              <Select
                value={formData.floor}
                onValueChange={(value) =>
                  setFormData({ ...formData, floor: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Position</Label>
              <div className="col-span-3 flex gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">X:</span>
                  <Input
                    type="number"
                    value={formData.x || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, x: parseInt(e.target.value) || 0 })
                    }
                    className="w-20"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Y:</span>
                  <Input
                    type="number"
                    value={formData.y || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, y: parseInt(e.target.value) || 0 })
                    }
                    className="w-20"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Size</Label>
              <div className="col-span-3 flex gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">W:</span>
                  <Input
                    type="number"
                    value={formData.width || 100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        width: parseInt(e.target.value) || 100,
                      })
                    }
                    className="w-20"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">H:</span>
                  <Input
                    type="number"
                    value={formData.height || 70}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        height: parseInt(e.target.value) || 70,
                      })
                    }
                    className="w-20"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onDelete(room!.id);
                  onOpenChange(false);
                }}
              >
                Delete Room
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Save Changes" : "Add Room"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
