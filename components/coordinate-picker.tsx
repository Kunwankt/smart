"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CoordinatePickerProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddRoom: () => void;
}

export function CoordinatePicker({
  x,
  y,
  onClose,
  onAddRoom,
}: CoordinatePickerProps) {
  return (
    <Card className="absolute bottom-4 left-4 z-20 w-64 shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Coordinates</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">X:</span>
            <span className="font-mono font-medium">{x}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Y:</span>
            <span className="font-mono font-medium">{y}</span>
          </div>
        </div>
        <Button size="sm" className="w-full" onClick={onAddRoom}>
          Add Room Here
        </Button>
      </CardContent>
    </Card>
  );
}
