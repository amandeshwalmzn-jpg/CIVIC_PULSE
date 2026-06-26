import React from "react";
import { ReportTemplate } from "../types";
import { Sparkles, MapPin } from "lucide-react";

interface TemplateSelectorProps {
  templates: ReportTemplate[];
  selectedTemplateId: string | null;
  onSelect: (template: ReportTemplate) => void;
  onSelectCustom: () => void;
  isCustomSelected: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplateId,
  onSelect,
  onSelectCustom,
  isCustomSelected,
}) => {
  return (
    <div className="space-y-4" id="template-selector-container">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold tracking-widest uppercase text-natural-text-muted flex items-center gap-1.5 font-sans">
          <Sparkles className="w-4 h-4 text-natural-primary" />
          Select Presets or Custom Image
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {templates.map((tpl) => {
          const isSelected = !isCustomSelected && selectedTemplateId === tpl.id;
          return (
            <button
              key={tpl.id}
              onClick={() => onSelect(tpl)}
              id={`template-btn-${tpl.id}`}
              className={`flex flex-col text-left rounded-xl overflow-hidden transition-all duration-300 border text-xs cursor-pointer group ${
                isSelected
                  ? "border-natural-primary bg-natural-bg-light shadow-sm ring-1 ring-natural-primary"
                  : "border-natural-border bg-white hover:border-natural-border-light hover:bg-natural-bg-light/40"
              }`}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-natural-bg-light">
                <img
                  src={tpl.imageUrl}
                  alt={tpl.name}
                  referrerPolicy="no-referrer"
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-1 left-1 bg-natural-text/75 backdrop-blur-xs text-[10px] text-white px-1.5 py-0.5 rounded font-medium">
                  {tpl.name.split(" ")[0]}
                </div>
              </div>
              <div className="p-2 space-y-1 flex-1 flex flex-col justify-between">
                <span className="font-semibold text-natural-text line-clamp-1 block font-serif italic">
                  {tpl.name}
                </span>
                <span className="text-[10px] text-natural-text-muted flex items-center gap-0.5 line-clamp-1">
                  <MapPin className="w-3 h-3 text-natural-text-muted shrink-0" />
                  {tpl.location}
                </span>
              </div>
            </button>
          );
        })}

        <button
          onClick={onSelectCustom}
          id="template-btn-custom"
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs cursor-pointer min-h-[90px] transition-all duration-300 ${
            isCustomSelected
              ? "border-natural-primary bg-natural-bg-light ring-1 ring-natural-primary font-medium"
              : "border-dashed border-natural-border bg-white hover:border-natural-text-muted hover:bg-natural-bg-light/30"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-natural-bg-light flex items-center justify-center mb-1.5 text-natural-primary group-hover:bg-natural-border">
            ➕
          </div>
          <span className="font-semibold text-natural-text font-serif italic">Custom Image</span>
          <span className="text-[10px] text-natural-text-muted text-center mt-0.5">
            Upload from device
          </span>
        </button>
      </div>
    </div>
  );
};
