import React from "react";
import { CivicAIAnalysis } from "../types";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Award,
  Zap,
  Tag,
  ShieldAlert,
  Building2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Hash,
  Lightbulb,
} from "lucide-react";

interface AnalysisDisplayProps {
  analysis: CivicAIAnalysis;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  const { issue, routing, duplicate_check, community, gamification, ai_insight } = analysis;

  // Severity style mapping
  const severityStyles = {
    low: { bg: "bg-natural-bg-light text-natural-primary border-natural-border", badge: "bg-natural-primary", label: "Low Priority" },
    medium: { bg: "bg-natural-bg-light text-natural-accent-amber border-natural-border", badge: "bg-natural-accent-amber", label: "Medium Priority" },
    high: { bg: "bg-natural-accent-amber/10 text-natural-accent-amber border-natural-accent-amber/25", badge: "bg-natural-accent-amber", label: "High Priority" },
    critical: { bg: "bg-natural-accent-red/10 text-natural-accent-red border-natural-accent-red/35 border-2 animate-pulse", badge: "bg-natural-accent-red", label: "CRITICAL ALERT" },
  };

  const severity = severityStyles[issue.severity] || severityStyles.low;

  // Confidence rating display
  const confidencePercent = Math.round(issue.confidence_score * 100);

  // Quality score colors
  const qualityColors = {
    poor: "bg-natural-accent-red/10 text-natural-accent-red border-natural-accent-red/20",
    fair: "bg-natural-accent-amber/10 text-natural-accent-amber border-natural-accent-amber/20",
    good: "bg-natural-bg-light text-natural-primary border-natural-border",
    excellent: "bg-natural-bg-light text-natural-primary border-natural-primary/30 font-bold",
  };
  const qualityStyle = qualityColors[gamification.quality_score] || qualityColors.good;

  return (
    <div className="space-y-6" id="analysis-dashboard">
      {/* 1. Header: Quick Overview Card */}
      <div className="bg-white border border-natural-border rounded-[32px] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold bg-natural-bg-light text-natural-text-muted px-2.5 py-0.5 rounded-full font-mono border border-natural-border">
              Public Broadcast
            </span>
            <span className="text-natural-border">|</span>
            <span className="text-xs font-semibold text-natural-text-dark flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${severity.badge}`} />
              Category: <strong className="text-natural-text capitalize font-mono">{issue.category.replace("_", " ")}</strong>
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-natural-primary font-serif italic">
            {community.public_title}
          </h2>
          <p className="text-natural-text-dark text-sm leading-relaxed">
            {community.public_summary}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {community.suggested_hashtags.map((tag) => (
              <span key={tag} className="text-[11px] font-medium text-natural-primary bg-natural-bg-light px-3 py-0.5 rounded-full flex items-center gap-0.5 border border-natural-border-light">
                <Hash className="w-2.5 h-2.5 text-natural-text-muted" />
                {tag.replace("#", "")}
              </span>
            ))}
          </div>
        </div>

        {/* Confidence Gauge */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center p-4 bg-natural-bg-light rounded-2xl border border-natural-border shrink-0 min-w-[140px]">
          <span className="text-[9px] text-natural-text-muted font-bold uppercase tracking-widest font-mono">
            AI CONFIDENCE
          </span>
          <div className="text-2xl font-bold text-natural-text tracking-tight font-serif italic mt-0.5">
            {confidencePercent}%
          </div>
          <div className="w-24 bg-natural-border-light h-1.5 rounded-full overflow-hidden mt-1.5">
            <div 
              style={{ width: `${confidencePercent}%` }} 
              className={`h-full rounded-full transition-all duration-500 ${
                confidencePercent > 80 ? "bg-natural-primary" : confidencePercent > 50 ? "bg-natural-accent-amber" : "bg-natural-accent-red"
              }`}
            />
          </div>
        </div>
      </div>

      {/* 2. Core Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Issue Diagnostics & Description */}
        <div className="space-y-6">
          <div className="bg-white border border-natural-border rounded-[32px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-natural-border-light pb-3">
              <h3 className="font-bold text-xs tracking-widest uppercase text-natural-text-muted font-sans">
                Issue Diagnostics
              </h3>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${severity.bg}`}>
                {severity.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-natural-text-muted uppercase tracking-widest">Subcategory</span>
                <p className="text-sm font-semibold text-natural-text capitalize font-serif italic">
                  {issue.subcategory}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-natural-text-muted uppercase tracking-widest">Impact Radius</span>
                <p className="text-sm font-semibold text-natural-text">
                  {community.impact_radius_meters} meters
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-mono text-natural-text-muted uppercase tracking-widest">Severity Justification</span>
              <p className="text-xs text-natural-text-dark italic bg-natural-bg-light p-3 rounded-xl border border-natural-border-light">
                "{issue.severity_reason}"
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-mono text-natural-text-muted uppercase tracking-widest">Expert Description</span>
              <p className="text-sm text-natural-text leading-relaxed font-sans bg-natural-bg-light/40 border border-natural-border-light p-3.5 rounded-2xl">
                {issue.description}
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[9px] font-mono text-natural-text-muted uppercase tracking-widest block">Meta Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {issue.tags.map((tag) => (
                  <span key={tag} className="text-xs font-mono text-natural-text-dark bg-natural-bg-light px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-natural-border-light">
                    <Tag className="w-2.5 h-2.5 text-natural-primary" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Operations & Routing Routing */}
        <div className="space-y-6">
          <div className="bg-white border border-natural-border rounded-[32px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-natural-border-light pb-3">
              <h3 className="font-bold text-xs tracking-widest uppercase text-natural-text-muted font-sans">
                Operations & Dispatch
              </h3>
              <span className="text-[9px] uppercase font-mono bg-natural-bg-light text-natural-text-dark px-2.5 py-0.5 rounded-full border border-natural-border">
                Ticket #{(Math.random() * 100000).toFixed(0)}
              </span>
            </div>

            {/* Department Alert */}
            <div className="flex items-center gap-3.5 bg-natural-bg-light border border-natural-border p-3.5 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-white border border-natural-border flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-natural-primary" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-natural-text-muted uppercase tracking-widest block">Assigned Dispatch Department</span>
                <p className="text-sm font-bold text-natural-primary font-serif italic">
                  {routing.department}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Priority score slider indicator */}
              <div className="bg-natural-bg-light border border-natural-border p-4 rounded-2xl space-y-1.5 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono text-natural-text-muted uppercase tracking-widest block">PRIORITY VALUE</span>
                  <span className="text-2xl font-bold text-natural-text font-serif italic">{routing.priority_score}</span>
                  <span className="text-[10px] text-natural-text-muted font-bold"> / 100</span>
                </div>
                <div className="w-full bg-natural-border h-1 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${routing.priority_score}%` }} 
                    className={`h-full rounded-full ${
                      routing.priority_score > 75 ? "bg-natural-accent-red" : routing.priority_score > 45 ? "bg-natural-accent-amber" : "bg-natural-primary"
                    }`}
                  />
                </div>
              </div>

              {/* ETA Resolution */}
              <div className="bg-natural-bg-light border border-natural-border p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[9px] font-mono text-natural-text-muted uppercase tracking-widest block">ESTIMATED TIMELINE</span>
                <div>
                  <span className="text-2xl font-bold text-natural-text font-serif italic">
                    {routing.estimated_resolution_days}
                  </span>
                  <span className="text-xs text-natural-text-dark font-medium ml-1">Days</span>
                </div>
                <p className="text-[9px] text-natural-text-muted flex items-center gap-1 leading-none">
                  <Calendar className="w-3 h-3 text-natural-primary" />
                  Target SLA countdown
                </p>
              </div>
            </div>

            {/* Escalation Area */}
            {routing.escalate_immediately ? (
              <div className="bg-natural-accent-red/10 border border-natural-accent-red/35 p-4 rounded-2xl flex items-start gap-3 animate-pulse">
                <ShieldAlert className="w-5 h-5 text-natural-accent-red shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-natural-accent-red uppercase tracking-widest font-sans">
                    🚨 IMMEDIATE CRISIS ESCALATION TRIGGERED
                  </h4>
                  <p className="text-xs text-natural-accent-red leading-normal">
                    {routing.escalation_reason || "This issue has been escalated to dispatch supervisions due to high-hazard conditions."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-natural-bg-light border border-natural-border p-3.5 rounded-2xl flex items-center gap-2 text-natural-text-dark">
                <CheckCircle2 className="w-4 h-4 text-natural-primary" />
                <span className="text-xs font-medium">SLA remains standard. No instant escalation triggers hit.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. Bottom Row: Cross-check & Gamification rewards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Duplicate check results */}
        <div className="bg-white border border-natural-border rounded-[32px] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-natural-border-light pb-3">
            <h3 className="font-bold text-xs tracking-widest uppercase text-natural-text-muted font-sans">
              Duplicate Check Engine
            </h3>
            <span className={`px-2.5 py-0.5 text-[10px] font-mono uppercase rounded-full font-bold ${
              duplicate_check.is_likely_duplicate 
                ? "bg-natural-accent-amber/15 text-natural-accent-amber border border-natural-accent-amber/30" 
                : "bg-natural-primary/15 text-natural-primary border border-natural-primary/30"
            }`}>
              {duplicate_check.is_likely_duplicate ? "Likely Duplicate" : "Unique Submission"}
            </span>
          </div>

          <div className="flex items-start gap-3.5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              duplicate_check.is_likely_duplicate ? "bg-natural-accent-amber/15" : "bg-natural-primary/15"
            }`}>
              {duplicate_check.is_likely_duplicate ? (
                <AlertTriangle className="w-5 h-5 text-natural-accent-amber" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-natural-primary" />
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              {duplicate_check.is_likely_duplicate ? (
                <>
                  <p className="text-xs text-natural-text leading-normal">
                    <span className="font-bold text-natural-text-dark">Alert:</span> This report closely aligns with an active logged incident{" "}
                    <span className="font-mono bg-natural-bg-light px-1.5 py-0.5 text-[11px] font-semibold text-natural-text rounded border border-natural-border">
                      {duplicate_check.matching_issue_id || "Unknown ID"}
                    </span>{" "}
                    (Confidence: {Math.round((duplicate_check.duplicate_confidence || 0) * 100)}%).
                  </p>
                  <p className="text-xs text-natural-text-dark italic bg-natural-bg-light p-3 rounded-xl border border-natural-border-light">
                    "{duplicate_check.duplicate_reason}"
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs text-natural-text font-medium leading-relaxed">
                    This issue has been cleared! No similar reports found nearby within matching coordinates buffer.
                  </p>
                  <p className="text-xs text-natural-text-muted leading-relaxed">
                    Duplicate checks scoring was calculated against local registry records using coordinates thresholds and visual categories.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Gamification loyalty card */}
        <div className="bg-white border border-natural-border rounded-[32px] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-natural-border-light pb-3">
            <h3 className="font-bold text-xs tracking-widest uppercase text-natural-text-muted font-sans">
              Citizen Rewards & Quality
            </h3>
            <span className="text-[10px] uppercase font-mono text-natural-text-muted">
              Civic Engagement Hub
            </span>
          </div>

          <div className="flex items-start gap-4">
            {/* Big Badge Awarded */}
            <div className="flex flex-col items-center justify-center bg-natural-accent-amber/10 border border-natural-accent-amber/25 p-3 rounded-2xl shrink-0 min-w-[90px]">
              <Award className="w-7 h-7 text-natural-accent-amber animate-bounce" />
              <div className="text-lg font-extrabold text-natural-accent-amber font-mono mt-1">
                +{gamification.reporter_points_awarded}
              </div>
              <span className="text-[9px] font-bold text-natural-accent-amber uppercase font-mono tracking-wider">
                POINTS
              </span>
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-natural-text-muted font-mono">REPORT QUALITY:</span>
                <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm border ${qualityStyle}`}>
                  {gamification.quality_score}
                </span>
              </div>

              <p className="text-xs text-natural-text leading-snug">
                {gamification.points_reason}
              </p>

              {gamification.badge_unlocked && (
                <div className="flex items-center gap-1.5 bg-natural-bg-light border border-natural-border px-2.5 py-1.5 rounded-lg text-xs text-natural-text-dark">
                  <Zap className="w-3.5 h-3.5 text-natural-accent-amber shrink-0" />
                  <span>
                    New Badge: <strong className="font-semibold text-natural-primary">{gamification.badge_unlocked}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 4. Large full-width AI insight callout */}
      <div className="bg-natural-primary text-white rounded-[40px] p-6 shadow-md relative overflow-hidden" id="ai-insight-box">
        {/* Ambient background glow effect */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex gap-4 items-start relative z-10">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/10">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-sans flex items-center gap-1">
              CivicAI Contextual Predictive Insight
            </h4>
            <p className="text-sm font-light text-white leading-relaxed font-sans opacity-95">
              {ai_insight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
