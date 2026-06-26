import React, { useState } from "react";
import { Copy, Check, FileJson } from "lucide-react";

interface RawJsonViewProps {
  data: any;
}

export const RawJsonView: React.FC<RawJsonViewProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="bg-white border border-natural-border rounded-[32px] overflow-hidden shadow-sm flex flex-col h-full" id="raw-json-viewer-container">
      {/* Viewer Header */}
      <div className="bg-natural-bg-light px-5 py-4 border-b border-natural-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileJson className="w-4 h-4 text-natural-primary" />
          <span className="text-xs font-mono font-bold tracking-wider text-natural-primary">
            RAW RESPONSE SCHEMA (JSON)
          </span>
        </div>
        <button
          onClick={handleCopy}
          id="copy-json-btn"
          className="text-[10px] font-mono text-natural-text-muted hover:text-natural-primary bg-white hover:bg-natural-bg-light border border-natural-border px-2.5 py-1 rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-natural-primary" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy Output
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="flex-1 p-5 overflow-auto max-h-[500px] bg-white">
        <pre className="text-xs font-mono text-natural-text leading-relaxed whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};
