"use client";

import { useMemo, useRef, useState } from "react";
import { Room, PathResult } from "@/lib/building-data";
import { cn } from "@/lib/utils";

interface FloorMapProps {
  rooms: Room[];
  floorName: string;
  selectedRoom: Room | null;
  pathResult: PathResult | null;
  isAdminMode: boolean;
  isPickingCoordinates: boolean;
  onRoomSelect: (room: Room) => void;
  onRoomEdit: (room: Room) => void;
  onRoomUpdate: (room: Room) => void;
  onMapClick: (x: number, y: number) => void;
}

export function FloorMap({
  rooms,
  floorName,
  selectedRoom,
  pathResult,
  isAdminMode,
  isPickingCoordinates,
  onRoomSelect,
  onRoomEdit,
  onRoomUpdate,
  onMapClick,
}: FloorMapProps) {
  const pathRoomIds = pathResult?.path.map((r) => r.id) || [];
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [dragging, setDragging] = useState<{
    id: string;
    dx: number;
    dy: number;
  } | null>(null);
  const [resizing, setResizing] = useState<{
    id: string;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  const roomById = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);

  const getSvgPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPickingCoordinates) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 800);
    onMapClick(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isAdminMode || isPickingCoordinates) return;

    if (dragging) {
      const room = roomById.get(dragging.id);
      if (!room) return;
      const p = getSvgPoint(e.clientX, e.clientY);
      onRoomUpdate({
        ...room,
        x: Math.round(p.x - dragging.dx),
        y: Math.round(p.y - dragging.dy),
      });
      return;
    }

    if (resizing) {
      const room = roomById.get(resizing.id);
      if (!room) return;
      const p = getSvgPoint(e.clientX, e.clientY);
      const newW = Math.max(20, Math.round(resizing.startW + (p.x - resizing.startX)));
      const newH = Math.max(20, Math.round(resizing.startH + (p.y - resizing.startY)));
      onRoomUpdate({
        ...room,
        width: newW,
        height: newH,
      });
    }
  };

  const stopInteractions = () => {
    setDragging(null);
    setResizing(null);
  };

  // Generate path line between rooms in the path
  const generatePathLine = () => {
    if (!pathResult || pathResult.path.length < 2) return null;

    const currentFloorId = rooms[0]?.floor;
    const segments: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i < pathResult.path.length - 1; i++) {
      const room1 = pathResult.path[i];
      const room2 = pathResult.path[i + 1];

      if (room1.floor === currentFloorId && room2.floor === currentFloorId) {
        segments.push({
          x1: room1.x + room1.width / 2,
          y1: room1.y + room1.height / 2,
          x2: room2.x + room2.width / 2,
          y2: room2.y + room2.height / 2,
        });
      }

      if (room1.floor === currentFloorId) {
        points.push({
          x: room1.x + room1.width / 2,
          y: room1.y + room1.height / 2,
        });
      }
    }

    // Add the last point if it's on this floor
    const lastRoom = pathResult.path[pathResult.path.length - 1];
    if (lastRoom.floor === currentFloorId) {
      points.push({
        x: lastRoom.x + lastRoom.width / 2,
        y: lastRoom.y + lastRoom.height / 2,
      });
    }

    if (segments.length === 0 && points.length === 0) return null;

    return (
      <g>
        {segments.map((s, i) => (
          <line
            key={`seg-${i}`}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            className="stroke-primary"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="8,4"
          />
        ))}
        {points.map((p, i) => (
          <circle
            key={`pt-${i}`}
            cx={p.x}
            cy={p.y}
            r="6"
            className="fill-primary stroke-primary-foreground"
            strokeWidth="2"
          />
        ))}
      </g>
    );
  };

  return (
    <div className="relative">
      <div className="absolute top-3 left-3 z-10">
        <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 rounded-md shadow-sm">
          {floorName}
        </span>
      </div>
      <svg
        viewBox="0 0 1000 800"
        className={cn(
          "w-full h-auto bg-gray-50 border border-border rounded-lg shadow-inner",
          isPickingCoordinates && "cursor-crosshair"
        )}
        ref={svgRef}
        onClick={handleSvgClick}
        onPointerMove={handlePointerMove}
        onPointerUp={stopInteractions}
        onPointerCancel={stopInteractions}
        onPointerLeave={stopInteractions}
      >
        {/* Static corridor/wall elements (matches provided HTML for Ground) */}
        {rooms[0]?.floor === "ground" && (
          <g>
            <line x1="50" y1="180" x2="950" y2="180" className="corridor" />
            <path
              d="M 0 300 Q 50 280 100 300 T 200 300 T 300 300 T 400 300 T 500 300 T 600 300 T 700 300 T 800 300 T 900 300 T 1000 300"
              className="wavy-line"
            />
          </g>
        )}

        {/* Rooms */}
        {rooms.map((room) => (
          <g
            key={room.id}
            onClick={(e) => {
              e.stopPropagation();
              onRoomSelect(room);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (isAdminMode) onRoomEdit(room);
            }}
            className={cn(
              "cursor-pointer transition-all duration-200",
              isAdminMode && "hover:opacity-80"
            )}
          >
            <rect
              x={room.x}
              y={room.y}
              width={room.width}
              height={room.height}
              className={cn(
                "room",
                room.type,
                pathRoomIds.includes(room.id) && "active",
                isAdminMode && "admin-mode",
                selectedRoom?.id === room.id && "admin-selected"
              )}
              rx="8"
              onPointerDown={(e) => {
                if (!isAdminMode || isPickingCoordinates) return;
                e.stopPropagation();
                (e.currentTarget as SVGRectElement).setPointerCapture(e.pointerId);

                onRoomSelect(room);

                const p = getSvgPoint(e.clientX, e.clientY);
                setDragging({
                  id: room.id,
                  dx: p.x - room.x,
                  dy: p.y - room.y,
                });
              }}
            />
            <text
              x={room.x + room.width / 2}
              y={room.y + room.height / 2 + 5}
              className="label"
            >
              {room.name}
            </text>

            {/* Resize handle (admin + selected) */}
            {isAdminMode && selectedRoom?.id === room.id && (
              <rect
                x={room.x + room.width - 8}
                y={room.y + room.height - 8}
                width={16}
                height={16}
                className="resize-handle"
                onPointerDown={(e) => {
                  if (isPickingCoordinates) return;
                  e.stopPropagation();
                  (e.currentTarget as SVGRectElement).setPointerCapture(e.pointerId);
                  const p = getSvgPoint(e.clientX, e.clientY);
                  setResizing({
                    id: room.id,
                    startX: p.x,
                    startY: p.y,
                    startW: room.width,
                    startH: room.height,
                  });
                }}
              />
            )}
          </g>
        ))}

        {/* Navigation path */}
        {generatePathLine()}

        {/* Step indicators along the path */}
        {pathResult &&
          pathResult.steps
            .filter((step) => step.floor === rooms[0]?.floor && step.distance > 0)
            .map((step, i) => {
              const pathRooms = pathResult.path.filter(
                (r) => r.floor === rooms[0]?.floor
              );
              if (i >= pathRooms.length - 1) return null;
              const room1 = pathRooms[i];
              const room2 = pathRooms[i + 1];
              if (!room1 || !room2) return null;
              const midX =
                (room1.x + room1.width / 2 + room2.x + room2.width / 2) / 2;
              const midY =
                (room1.y + room1.height / 2 + room2.y + room2.height / 2) / 2;
              return (
                <g key={`step-${i}`}>
                  <rect
                    x={midX - 25}
                    y={midY - 10}
                    width="50"
                    height="20"
                    rx="10"
                    className="fill-primary"
                  />
                  <text
                    x={midX}
                    y={midY + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-primary-foreground text-[9px] font-medium"
                  >
                    {step.distance} steps
                  </text>
                </g>
              );
            })}
      </svg>
    </div>
  );
}
