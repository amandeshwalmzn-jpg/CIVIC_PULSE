import React from "react";
import { SavedReport } from "../types";
import { Clock, Trash2, MapPin, History, Sparkles, Tag } from "lucide-react";

interface ReportHistoryProps {
  history: SavedReport[];
  activeId: string | null;
  onSelectReport: (report: SavedReport) => void;
  onDeleteReport: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

export const ReportHistory: React.FC<ReportHistoryProps> = ({
  history,
  activeId,
  onSelectReport,
  onDeleteReport,
  onClearAll,
}) => {
  const formatTime = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Recently";
    }
  };

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "Today";
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-natural-accent-red/10 text-natural-accent-red border-natural-accent-red/30 font-bold";
      case "high":
        return "bg-natural-accent-amber/15 text-natural-accent-amber border-natural-accent-amber/30";
      case "medium":
        return "bg-natural-bg-light text-natural-accent-amber border-natural-border";
      default:
        return "bg-natural-bg-light text-natural-primary border-natural-border/80";
    }
  };

  return (
    <div className="bg-white border border-natural-border rounded-[32px] p-6 shadow-sm space-y-4" id="civicai-report-history-panel">
      <div className="flex items-center justify-between border-b border-natural-border-light pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-natural-primary" />
          <div>
            <h3 className="text-sm font-bold tracking-tight text-natural-primary font-serif italic">
              Recent Analysis History
            </h3>
            <p className="text-[10px] text-natural-text-muted font-bold uppercase tracking-wider">
              {history.length} Saved {history.length === 1 ? "Report" : "Reports"}
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearAll}
            id="clear-all-history-btn"
            className="text-[10px] font-mono font-bold text-natural-accent-red hover:bg-natural-accent-red/10 border border-natural-accent-red/20 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
            title="Delete all history"
          >
            <Trash2 className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 px-4 bg-natural-bg-light/40 border border-dashed rounded-2xl text-natural-text-muted italic text-xs space-y-2 border-natural-border">
          <Clock className="w-8 h-8 text-natural-text-muted mx-auto opacity-60" />
          <p className="font-medium text-natural-text-dark">No previous analyses saved</p>
          <p className="text-[10px] text-natural-text-muted max-w-[240px] mx-auto leading-relaxed">
            Every successful report analysis automatically caches locally in your browser for fast switching.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
          {history.map((item) => {
            const isActive = activeId === item.id;
            const categoryLabel = item.category.replace("_", " ");
            
            return (
              <button
                key={item.id}
                onClick={() => onSelectReport(item)}
                id={`history-item-${item.id}`}
                className={`w-full text-left p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 group cursor-pointer ${
                  isActive
                    ? "border-natural-primary bg-natural-bg-light ring-1 ring-natural-primary"
                    : "border-natural-border bg-white hover:border-natural-text-muted hover:bg-natural-bg-light/40"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Thumbnail */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-natural-bg-light border border-natural-border/50">
                    <img
                      src={item.imageSource || "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=150&q=80"}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase border shrink-0 ${getSeverityStyles(item.severity)}`}>
                        {item.severity}
                      </span>
                      <span className="text-[9px] text-natural-text-muted font-semibold flex items-center gap-0.5 uppercase tracking-wider font-mono">
                        <Tag className="w-2.5 h-2.5 shrink-0" />
                        {categoryLabel}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-natural-text truncate group-hover:text-natural-primary transition-colors font-serif italic">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[10px] text-natural-text-muted">
                      <span className="flex items-center gap-0.5 truncate max-w-[140px]">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        {item.location}
                      </span>
                      <span className="text-natural-border-light shrink-0">|</span>
                      <span className="shrink-0 flex items-center gap-0.5 font-mono">
                        <Clock className="w-2.5 h-2.5 shrink-0" />
                        {formatDate(item.timestamp)} {formatTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={(e) => onDeleteReport(item.id, e)}
                    className="p-1.5 rounded-xl text-natural-text-muted hover:text-natural-accent-red hover:bg-natural-accent-red/10 transition-colors cursor-pointer"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
