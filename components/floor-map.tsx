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
    const isGround = currentFloorId === "ground";
    const CORRIDOR_Y = 180;

    let pathD = "";
    const points: { x: number; y: number }[] = [];

    // Filter path to only include rooms on this floor
    const floorPath = pathResult.path.filter((r) => r.floor === currentFloorId);
    if (floorPath.length < 2) return null;

    for (let i = 0; i < floorPath.length - 1; i++) {
      const room1 = floorPath[i];
      const room2 = floorPath[i + 1];

      const x1 = room1.x + room1.width / 2;
      const y1 = room1.y + room1.height / 2;
      const x2 = room2.x + room2.width / 2;
      const y2 = room2.y + room2.height / 2;

      if (pathD === "") {
        pathD = `M ${x1} ${y1}`;
        points.push({ x: x1, y: y1 });
      }

      if (isGround) {
        // STRICT CORRIDOR ROUTING: Vertical -> Horizontal -> Vertical
        // This forces the path to always go to the corridor line first
        pathD += ` L ${x1} ${CORRIDOR_Y} L ${x2} ${CORRIDOR_Y} L ${x2} ${y2}`;
      } else {
        // Standard direct connection for other floors
        pathD += ` L ${x2} ${y2}`;
      }
    }

    // Add final destination point
    const lastRoom = floorPath[floorPath.length - 1];
    points.push({
      x: lastRoom.x + lastRoom.width / 2,
      y: lastRoom.y + lastRoom.height / 2,
    });

    if (pathD === "") return null;

    return (
      <g>
        {/* Define the arrow shape once */}
        <defs>
          <path
            id="nav-arrow-shape"
            d="M -8,-6 L 8,0 L -8,6 Z"
            className="nav-arrow"
          />
        </defs>

        {/* The background dashed path */}
        <path d={pathD} fill="none" className="nav-path" />

        {/* Multiple moving arrows for flow */}
        {[0, 1, 2].map((i) => (
          <use key={`arrow-${i}`} href="#nav-arrow-shape">
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              path={pathD}
              rotate="auto"
              begin={`${i * 1.33}s`}
            />
          </use>
        ))}

        {/* Start/End markers */}
        {points.map((p, i) => (
          <circle
            key={`pt-${i}`}
            cx={p.x}
            cy={p.y}
            r="6"
            className={cn(
              "stroke-white",
              i === 0 ? "fill-green-500" : "fill-sky-600"
            )}
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

        {/* Horizontal boundary line */}
        <line
          x1="0"
          y1="320"
          x2="1000"
          y2="320"
          className="stroke-gray-300"
          strokeWidth="2"
          strokeDasharray="10,5"
        />

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
