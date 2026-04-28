"use client";

import { Room, PathResult } from "@/lib/building-data";
import { cn } from "@/lib/utils";

interface FloorMapProps {
  rooms: Room[];
  floorName: string;
  selectedRoom: Room | null;
  pathResult: PathResult | null;
  isAdminMode: boolean;
  isPickingCoordinates: boolean;
  onRoomClick: (room: Room) => void;
  onMapClick: (x: number, y: number) => void;
}

export function FloorMap({
  rooms,
  floorName,
  selectedRoom,
  pathResult,
  isAdminMode,
  isPickingCoordinates,
  onRoomClick,
  onMapClick,
}: FloorMapProps) {
  const pathRoomIds = pathResult?.path.map((r) => r.id) || [];

  const getRoomColor = (room: Room) => {
    if (pathRoomIds.includes(room.id)) {
      return "fill-primary/80 stroke-primary";
    }
    switch (room.type) {
      case "entrance":
        return "fill-accent/60 stroke-accent";
      case "stairs":
        return "fill-amber-100 stroke-amber-500";
      case "elevator":
        return "fill-sky-100 stroke-sky-500";
      case "corridor":
        return "fill-muted stroke-muted-foreground/30";
      default:
        return "fill-card stroke-border hover:fill-secondary";
    }
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPickingCoordinates) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 800);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 450);
    onMapClick(x, y);
  };

  // Generate path line between rooms in the path
  const generatePathLine = () => {
    if (!pathResult || pathResult.path.length < 2) return null;

    const currentFloorPath = pathResult.path.filter(
      (room) => room.floor === rooms[0]?.floor
    );
    if (currentFloorPath.length < 2) return null;

    const points = currentFloorPath.map((room) => ({
      x: room.x + room.width / 2,
      y: room.y + room.height / 2,
    }));

    const pathD = points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(" ");

    return (
      <g>
        <path
          d={pathD}
          fill="none"
          className="stroke-primary"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8,4"
        />
        {points.map((p, i) => (
          <circle
            key={i}
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
        viewBox="0 0 800 450"
        className={cn(
          "w-full h-auto bg-background border border-border rounded-lg shadow-inner",
          isPickingCoordinates && "cursor-crosshair"
        )}
        onClick={handleSvgClick}
      >
        {/* Grid pattern */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              className="stroke-border/50"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="800" height="450" fill="url(#grid)" />

        {/* Building outline */}
        <rect
          x="50"
          y="30"
          width="700"
          height="380"
          fill="none"
          className="stroke-foreground/20"
          strokeWidth="2"
          strokeDasharray="10,5"
          rx="8"
        />

        {/* Rooms */}
        {rooms.map((room) => (
          <g
            key={room.id}
            onClick={(e) => {
              e.stopPropagation();
              onRoomClick(room);
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
                getRoomColor(room),
                "stroke-2 transition-colors duration-200",
                selectedRoom?.id === room.id && "stroke-primary stroke-[3px]"
              )}
              rx="4"
            />
            <text
              x={room.x + room.width / 2}
              y={room.y + room.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-[10px] font-medium pointer-events-none"
            >
              {room.name.length > 12
                ? room.name.slice(0, 10) + "..."
                : room.name}
            </text>
            {room.type === "stairs" && (
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2 + 12}
                textAnchor="middle"
                className="fill-muted-foreground text-[8px] pointer-events-none"
              >
                (Stairs)
              </text>
            )}
            {room.type === "elevator" && (
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2 + 12}
                textAnchor="middle"
                className="fill-muted-foreground text-[8px] pointer-events-none"
              >
                (Elevator)
              </text>
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
