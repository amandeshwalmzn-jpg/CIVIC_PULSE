import React from "react";
import { NearbyIssue } from "../types";
import { MapPin, Info, Compass, Layers, Radio } from "lucide-react";

interface MapPreviewProps {
  location: string;
  coordinates: string;
  nearbyIssues: NearbyIssue[];
  impactRadius?: number;
  isLikelyDuplicate?: boolean;
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  location,
  coordinates,
  nearbyIssues,
  impactRadius = 150,
  isLikelyDuplicate = false,
}) => {
  // Parse coordinates to display
  let lat = "0.0000";
  let lng = "0.0000";
  if (coordinates) {
    const parts = coordinates.split(",");
    if (parts.length >= 2) {
      lat = parts[0].trim();
      lng = parts[1].trim();
    }
  }

  return (
    <div className="bg-white border border-natural-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-full" id="map-preview-card">
      {/* Map Header */}
      <div className="bg-natural-bg-light border-b border-natural-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-natural-primary animate-ping" />
          <h4 className="font-bold text-xs tracking-widest uppercase text-natural-text-muted font-sans flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-natural-primary" />
            Civic GIS Viewport
          </h4>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-natural-text-dark font-mono bg-natural-border-light px-2 py-0.5 rounded-md">
          <span>Lat: {lat}</span>
          <span className="text-natural-border">|</span>
          <span>Lng: {lng}</span>
        </div>
      </div>

      {/* Styled Grid Canvas Area */}
      <div className="relative flex-1 min-h-[220px] bg-slate-900 overflow-hidden flex items-center justify-center select-none group">
        {/* Radar grids */}
        <div className="absolute inset-0 bg-[radial-gradient(#5a5a40_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        
        {/* Crosshair lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-[1px] bg-slate-800/40" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-[1px] bg-slate-800/40" />
        </div>

        {/* Concentric Circle Guides */}
        <div className="absolute border border-slate-800/25 rounded-full w-24 h-24 flex items-center justify-center" />
        <div className="absolute border border-slate-800/25 rounded-full w-48 h-48 flex items-center justify-center" />
        <div className="absolute border border-slate-800/25 rounded-full w-72 h-72 flex items-center justify-center" />

        {/* Impact Radius Shaded Circle (Dynamic width) */}
        {impactRadius > 0 && (
          <div 
            style={{ 
              width: `${Math.min(180, Math.max(60, impactRadius / 2))}px`, 
              height: `${Math.min(180, Math.max(60, impactRadius / 2))}px` 
            }}
            className={`absolute rounded-full border border-dashed flex items-center justify-center transition-all duration-500 ${
              isLikelyDuplicate 
                ? "bg-natural-accent-red/10 border-natural-accent-red/30 animate-pulse" 
                : "bg-natural-primary/10 border-natural-primary/30 animate-pulse"
            }`}
          >
            <span className="text-[9px] text-slate-400 font-mono absolute -top-5">
              Impact: {impactRadius}m
            </span>
          </div>
        )}

        {/* Center Target (Primary Issue Pin) */}
        <div className="absolute flex flex-col items-center justify-center z-20">
          <div className="absolute -top-12 bg-slate-950/90 text-white px-2 py-1 rounded-md text-[10px] font-medium border border-slate-800 pointer-events-none shadow-lg whitespace-nowrap">
            NEW SUBMISSION
          </div>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-natural-primary/40 animate-ping scale-150" />
            <div className="w-7 h-7 rounded-full bg-natural-primary border-2 border-white flex items-center justify-center shadow-md">
              <MapPin className="w-4 h-4 text-white animate-bounce" />
            </div>
          </div>
        </div>

        {/* Map Mock Items for nearby issues */}
        {nearbyIssues.map((issue, idx) => {
          // Put them at slight random angles around the center for representation
          const angles = [45, 135, 225, 315];
          const angle = angles[idx % angles.length] * (Math.PI / 180);
          const distanceScale = Math.min(110, Math.max(40, issue.distance_meters / 3));
          const x = Math.cos(angle) * distanceScale;
          const y = Math.sin(angle) * distanceScale;

          const statusColors = {
            resolved: { bg: "bg-natural-primary", border: "border-natural-primary", text: "text-natural-text-muted" },
            pending: { bg: "bg-natural-accent-red", border: "border-natural-accent-red", text: "text-natural-accent-red" },
            investigating: { bg: "bg-natural-accent-amber", border: "border-natural-accent-amber", text: "text-natural-accent-amber" },
          };

          const color = statusColors[issue.status] || statusColors.pending;

          return (
            <div
              key={issue.id}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className="absolute flex items-center justify-center group/marker z-10"
            >
              {/* Tooltip */}
              <div className="absolute bottom-6 bg-slate-950 text-white px-2.5 py-1 rounded text-[10px] font-medium border border-slate-800 pointer-events-none shadow-lg hidden group-hover/marker:block whitespace-nowrap">
                <span className="font-semibold text-slate-200">{issue.id}</span>
                <span className="mx-1.5 text-slate-500">•</span>
                <span>{issue.distance_meters}m away</span>
                <div className="capitalize text-[9px] mt-0.5 font-normal text-slate-400">
                  Status: {issue.status}
                </div>
              </div>

              {/* Ping line to center */}
              <div 
                style={{ 
                  width: `${distanceScale}px`, 
                  transform: `rotate(${angle + Math.PI}deg)`,
                  transformOrigin: "0 50%",
                  left: 0
                }}
                className="absolute h-[1px] border-t border-dashed border-slate-800 pointer-events-none -z-10"
              />

              <div className="relative">
                <div className={`w-4 h-4 rounded-full ${color.bg} border-2 border-slate-950 flex items-center justify-center cursor-pointer shadow-xs`}>
                  <Radio className="w-2.5 h-2.5 text-white animate-pulse" />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono font-medium text-slate-400">
                  {issue.id}
                </div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-xs border border-slate-800 p-2 rounded-lg space-y-1 text-[9px] font-mono text-slate-400 z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-natural-primary" />
            <span>Target Submission</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-natural-accent-red" />
            <span>Pending Issue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-natural-primary" />
            <span>Resolved Issue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-natural-accent-amber" />
            <span>Investigating</span>
          </div>
        </div>

        {/* Compass indicator */}
        <div className="absolute top-2 right-2 flex flex-col items-center justify-center p-1.5 bg-slate-950/50 rounded-full border border-slate-800">
          <span className="text-[7px] font-bold font-mono text-slate-500">N</span>
          <div className="w-3.5 h-3.5 border-t-2 border-natural-primary rounded-full rotate-45 mt-0.5" />
        </div>
      </div>

      {/* Map Footer Details */}
      <div className="p-3 bg-natural-bg-light border-t border-natural-border space-y-2">
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-natural-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-[11px] font-semibold text-natural-text leading-tight font-serif italic">
              {location || "No address supplied"}
            </p>
            <p className="text-[10px] text-natural-text-muted font-mono">
              Coordinates: {coordinates || "No GPS values provided"}
            </p>
          </div>
        </div>

        {nearbyIssues && nearbyIssues.length > 0 ? (
          <div className="border-t border-natural-border-light pt-2">
            <p className="text-[10px] font-bold tracking-widest uppercase text-natural-text-muted mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Nearby Registered Incidents ({nearbyIssues.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {nearbyIssues.map((issue) => (
                <div 
                  key={issue.id} 
                  className="flex items-center justify-between text-[10px] bg-white border border-natural-border p-1.5 rounded-lg"
                >
                  <div className="truncate pr-1">
                    <span className="font-bold text-natural-text-dark">{issue.id}</span>
                    <span className="text-natural-border mx-1">•</span>
                    <span className="text-natural-text truncate font-serif italic">{issue.title}</span>
                  </div>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                    issue.status === 'resolved' 
                      ? 'bg-natural-bg-light text-natural-primary border border-natural-border' 
                      : issue.status === 'pending'
                      ? 'bg-natural-accent-red/10 text-natural-accent-red border border-natural-accent-red/20'
                      : 'bg-natural-accent-amber/10 text-natural-accent-amber border border-natural-accent-amber/20'
                  }`}>
                    {issue.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="border-t border-natural-border-light pt-2 flex items-center gap-1.5 text-natural-text-muted">
            <Info className="w-3.5 h-3.5" />
            <span className="text-[10px] italic">No previously reported nearby issues in buffer.</span>
          </div>
        )}
      </div>
    </div>
  );
};
