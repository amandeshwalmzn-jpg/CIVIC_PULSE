import React, { useState, useEffect } from "react";
import {
  Upload,
  MapPin,
  FileText,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  Sparkles,
  RefreshCw,
  Sliders,
  Database,
  Layers,
  ArrowRight,
  Shield,
  LayoutDashboard,
  Code2
} from "lucide-react";
import { REPORT_TEMPLATES } from "./data";
import { CivicAIAnalysis, ReportTemplate, NearbyIssue, SavedReport } from "./types";
import { TemplateSelector } from "./components/TemplateSelector";
import { MapPreview } from "./components/MapPreview";
import { AnalysisDisplay } from "./components/AnalysisDisplay";
import { RawJsonView } from "./components/RawJsonView";
import { ReportHistory } from "./components/ReportHistory";

export default function App() {
  // Preset templates & current state
  const templates = REPORT_TEMPLATES;
  
  // Input fields
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(templates[0].id);
  const [isCustomSelected, setIsCustomSelected] = useState<boolean>(false);
  
  const [location, setLocation] = useState<string>(templates[0].location);
  const [coordinates, setCoordinates] = useState<string>(templates[0].coordinates);
  const [description, setDescription] = useState<string>(templates[0].description);
  const [reporterHistoryCount, setReporterHistoryCount] = useState<number>(templates[0].reporterHistoryCount);
  const [nearbyIssues, setNearbyIssues] = useState<NearbyIssue[]>(templates[0].nearbyIssues);
  
  // Custom image upload states
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  // Active selected image URL/source to display
  const [imageSource, setImageSource] = useState<string>(templates[0].imageUrl);

  // Analysis result
  const [analysisResult, setAnalysisResult] = useState<CivicAIAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPhase, setLoadingPhase] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Persistent report history from LocalStorage
  const [reportHistory, setReportHistory] = useState<SavedReport[]>(() => {
    try {
      const saved = localStorage.getItem("civicai_report_history");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error reading history from localStorage", e);
      return [];
    }
  });
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("civicai_report_history", JSON.stringify(reportHistory));
    } catch (e) {
      console.error("Error writing history to localStorage", e);
    }
  }, [reportHistory]);

  // Active view tabs for output
  const [activeTab, setActiveTab] = useState<"visual" | "json">("visual");

  // Editable single nearby issue form state (for additions)
  const [newNearbyTitle, setNewNearbyTitle] = useState("");
  const [newNearbyCategory, setNewNearbyCategory] = useState("road_damage");
  const [newNearbyStatus, setNewNearbyStatus] = useState<"pending" | "resolved" | "investigating">("pending");
  const [newNearbyDistance, setNewNearbyDistance] = useState(120);
  const [newNearbyDaysAgo, setNewNearbyDaysAgo] = useState(3);

  // Update form inputs when changing templates
  const handleSelectTemplate = (template: ReportTemplate) => {
    setIsCustomSelected(false);
    setSelectedTemplateId(template.id);
    setLocation(template.location);
    setCoordinates(template.coordinates);
    setDescription(template.description);
    setReporterHistoryCount(template.reporterHistoryCount);
    setNearbyIssues(template.nearbyIssues);
    setImageSource(template.imageUrl);
    setCustomImageBase64(null);
    setError(null);
    setActiveHistoryId(null);
  };

  const handleSelectCustom = () => {
    setIsCustomSelected(true);
    setSelectedTemplateId(null);
    setLocation("");
    setCoordinates("37.7749, -122.4194"); // default coords
    setDescription("");
    setReporterHistoryCount(0);
    setNearbyIssues([]);
    setImageSource("");
    setCustomImageBase64(null);
    setError(null);
    setActiveHistoryId(null);
  };

  // Drag and drop image upload handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, or WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCustomImageBase64(base64);
      setImageSource(base64);
      setIsCustomSelected(true);
      setSelectedTemplateId(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Interactive addition of custom nearby issues to test duplicate checks
  const handleAddNearbyIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNearbyTitle.trim()) return;

    const newIssue: NearbyIssue = {
      id: `ISS-${Math.floor(100 + Math.random() * 900)}`,
      title: newNearbyTitle,
      category: newNearbyCategory,
      status: newNearbyStatus,
      distance_meters: Number(newNearbyDistance),
      reported_days_ago: Number(newNearbyDaysAgo),
    };

    setNearbyIssues([newIssue, ...nearbyIssues]);
    setNewNearbyTitle("");
  };

  const handleRemoveNearbyIssue = (id: string) => {
    setNearbyIssues(nearbyIssues.filter((i) => i.id !== id));
  };

  // Call server-side API to trigger CivicAI analysis
  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    // Sequential loading animation phases to simulate real-time ML systems
    const phases = [
      "Uploading telemetry and raw sensory imagery...",
      "Running Computer Vision checks for object classifications...",
      "Evaluating coordinate coordinates against local municipal grids...",
      "Analyzing duplicate ratios with surrounding historical markers...",
      "Compiling CivicAI dispatch routes and reward valuations...",
    ];

    let phaseIndex = 0;
    setLoadingPhase(phases[0]);
    const phaseTimer = setInterval(() => {
      if (phaseIndex < phases.length - 1) {
        phaseIndex++;
        setLoadingPhase(phases[phaseIndex]);
      }
    }, 1200);

    try {
      const payload: any = {
        location,
        coordinates,
        description,
        nearbyIssues,
        reporterHistoryCount,
      };

      if (isCustomSelected) {
        if (!customImageBase64) {
          throw new Error("Please upload an image or select a preset template first.");
        }
        payload.image = customImageBase64;
      } else {
        payload.imageUrl = imageSource;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "An error occurred during analysis.");
      }

      setAnalysisResult(data);
      setError(null);

      // Save report to persistent local storage history
      const newReport: SavedReport = {
        id: `REP-${Date.now()}`,
        timestamp: Date.now(),
        title: data.community?.public_title || location || "Civic Incident Analysis",
        category: data.issue?.category || "other",
        severity: data.issue?.severity || "medium",
        location,
        coordinates,
        description,
        reporterHistoryCount,
        nearbyIssues: [...nearbyIssues],
        imageSource,
        isCustomSelected,
        customImageBase64,
        analysisResult: data,
      };

      setReportHistory((prev) => {
        const filtered = prev.filter(
          (item) => !(item.location === location && item.coordinates === coordinates && item.category === data.issue?.category)
        );
        return [newReport, ...filtered];
      });
      setActiveHistoryId(newReport.id);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to contact CivicAI server.");
    } finally {
      clearInterval(phaseTimer);
      setLoading(false);
      setLoadingPhase("");
    }
  };

  // Switch back to a previous report from history without re-running analysis
  const handleSelectHistoryReport = (report: SavedReport) => {
    setAnalysisResult(report.analysisResult);
    setLocation(report.location);
    setCoordinates(report.coordinates);
    setDescription(report.description);
    setReporterHistoryCount(report.reporterHistoryCount);
    setNearbyIssues(report.nearbyIssues);
    setImageSource(report.imageSource);
    setIsCustomSelected(report.isCustomSelected);
    setCustomImageBase64(report.customImageBase64);
    setActiveHistoryId(report.id);
    setSelectedTemplateId(null);
    setError(null);
  };

  // Delete a single historical report
  const handleDeleteHistoryReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReportHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
      setAnalysisResult(null);
    }
  };

  // Clear all persistent history records
  const handleClearAllHistory = () => {
    setReportHistory([]);
    setActiveHistoryId(null);
  };

  return (
    <div className="min-h-screen bg-natural-bg flex flex-col font-sans text-natural-text" id="civicai-root">
      {/* Top Professional Header Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-natural-border shadow-xs" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Branding Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-natural-primary flex items-center justify-center text-white shadow-sm shadow-natural-primary/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold font-serif italic text-natural-primary">
                    CivicAI
                  </h1>
                  <span className="bg-natural-bg-light text-natural-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-natural-border">
                    Smart-Dispatch v2.4
                  </span>
                </div>
                <p className="text-[10px] text-natural-text-muted font-bold tracking-wider uppercase">
                  AI-Powered Community Incident Analytics
                </p>
              </div>
            </div>

            {/* Static Live Public Feed Metrics to look extremely professional */}
            <div className="hidden md:flex items-center gap-6 text-xs">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold font-mono text-natural-text-muted uppercase tracking-widest">
                  DISPATCH SLA RATIO
                </span>
                <span className="font-semibold text-natural-text font-mono">98.4% (On-Time)</span>
              </div>
              <div className="h-8 w-[1px] bg-natural-border-light" />
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold font-mono text-natural-text-muted uppercase tracking-widest">
                  MUNICIPAL ACCURACY
                </span>
                <span className="font-semibold text-natural-text font-mono">99.1% Confidence</span>
              </div>
              <div className="h-8 w-[1px] bg-natural-border-light" />
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold font-mono text-natural-text-muted uppercase tracking-widest">
                  POINTS REDEEMED
                </span>
                <span className="font-semibold text-natural-accent-amber font-mono">142,550 pts</span>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-12 gap-8" id="workspace-layout">
        
        {/* LEFT COLUMN: Input Workspace Panel (5/12 columns) */}
        <section className="xl:col-span-5 space-y-6 flex flex-col" id="citizen-report-builder">
          <div className="bg-white border border-natural-border rounded-[32px] p-6 shadow-sm space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold tracking-tight text-natural-primary font-serif italic flex items-center gap-2">
                <FileText className="w-5 h-5 text-natural-primary" />
                Incident Submission Form
              </h2>
              <p className="text-xs text-natural-text-dark leading-relaxed">
                Provide civic imagery and coordinates below. CivicAI will classify the category, score priority, check for duplicates, and route to standard dispatch.
              </p>
            </div>

            {/* 1. Template Presets Selection Slider */}
            <TemplateSelector
              templates={templates}
              selectedTemplateId={selectedTemplateId}
              onSelect={handleSelectTemplate}
              onSelectCustom={handleSelectCustom}
              isCustomSelected={isCustomSelected}
            />

            <hr className="border-natural-border-light" />

            {/* 2. Upload/Display Sensory Image Frame */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-natural-text-muted uppercase tracking-widest font-mono">
                Report Incident Imagery
              </label>

              {isCustomSelected ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl aspect-video flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-300 ${
                    dragActive
                      ? "border-natural-primary bg-natural-bg-light/40"
                      : "border-natural-border bg-natural-bg-light/20 hover:border-natural-text-muted hover:bg-natural-bg-light/40"
                  }`}
                  style={{ position: "relative" }}
                >
                  {customImageBase64 ? (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden group">
                      <img
                        src={customImageBase64}
                        alt="Citizen submission preview"
                        referrerPolicy="no-referrer"
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-natural-text/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs gap-1">
                        <span>Drag & Drop to replace</span>
                        <span className="font-semibold text-[10px] uppercase font-mono text-slate-300">
                          Click browse below
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-natural-text-muted py-4">
                      <div className="w-10 h-10 rounded-full bg-natural-bg-light flex items-center justify-center mx-auto text-natural-primary border border-natural-border-light">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-natural-text">
                          Drag and drop incident photo here
                        </p>
                        <p className="text-[10px] text-natural-text-muted">
                          PNG, JPG, or WEBP up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    id="custom-image-file-input"
                  />
                </div>
              ) : (
                <div className="relative border border-natural-border rounded-2xl overflow-hidden aspect-video bg-natural-bg-light">
                  <img
                    src={imageSource}
                    alt="Active preset image"
                    referrerPolicy="no-referrer"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-2 left-2 bg-natural-text/85 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-md border border-natural-border">
                    PRESET IMAGE FRAME
                  </div>
                </div>
              )}
            </div>

            {/* 3. Location and Coordinates Input fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-natural-text-muted uppercase tracking-widest font-mono flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-natural-primary" />
                    Civic Address Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. 1422 Elmwood Ave, Springfield"
                    id="input-address-field"
                    className="w-full text-xs font-medium px-3 py-2 border border-natural-border rounded-xl bg-white focus:outline-hidden focus:border-natural-primary focus:ring-2 focus:ring-natural-primary/15"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-natural-text-muted uppercase tracking-widest font-mono flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-natural-primary" />
                    GPS Coordinates
                  </label>
                  <input
                    type="text"
                    value={coordinates}
                    onChange={(e) => setCoordinates(e.target.value)}
                    placeholder="e.g. 42.8833, -87.9042"
                    id="input-gps-field"
                    className="w-full text-xs font-mono px-3 py-2 border border-natural-border rounded-xl bg-white focus:outline-hidden focus:border-natural-primary focus:ring-2 focus:ring-natural-primary/15"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-natural-text-muted uppercase tracking-widest font-mono">
                  User Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe details regarding this incident..."
                  rows={2}
                  id="input-description-area"
                  className="w-full text-xs px-3 py-2 border border-natural-border rounded-xl bg-white focus:outline-hidden focus:border-natural-primary focus:ring-2 focus:ring-natural-primary/15"
                />
              </div>

              {/* Past submissions of this reporter count */}
              <div className="space-y-1 bg-natural-bg-light border border-natural-border-light p-3.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-natural-text-muted uppercase tracking-widest font-mono flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-natural-primary" />
                    Reporter history count
                  </label>
                  <span className="text-xs font-extrabold font-mono text-natural-text bg-white border border-natural-border px-2 py-0.5 rounded-md shadow-xs">
                    {reporterHistoryCount} reports
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={reporterHistoryCount}
                  onChange={(e) => setReporterHistoryCount(Number(e.target.value))}
                  id="reporter-history-slider"
                  className="w-full accent-natural-primary h-1 bg-natural-border rounded-lg cursor-pointer mt-1"
                />
                <p className="text-[9px] text-natural-text-muted mt-1 leading-snug italic">
                  Points valuation and quality score multiplier adjusts based on past reporter loyalty and audit records.
                </p>
              </div>
            </div>

            {/* 4. Interactive Configuration of Nearby Issues (Testing Duplication Engine) */}
            <div className="border border-natural-border rounded-xl overflow-hidden bg-natural-bg-light/30">
              <div className="bg-natural-bg-light border-b border-natural-border px-3.5 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-natural-primary flex items-center gap-1.5 font-sans">
                  <Database className="w-4 h-4 text-natural-primary" />
                  Simulate Nearby Issues ({nearbyIssues.length})
                </span>
                <span className="text-[9px] text-natural-text-muted font-mono uppercase font-semibold">
                  Sensing Buffer Zone
                </span>
              </div>

              <div className="p-3 space-y-3">
                {/* List of current simulated issues */}
                {nearbyIssues.length > 0 ? (
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {nearbyIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="flex items-center justify-between text-[10px] bg-white border border-natural-border p-2 rounded-lg"
                      >
                        <div className="space-y-0.5 truncate pr-2">
                          <p className="font-bold text-natural-text flex items-center gap-1.5">
                            <span className="font-mono text-natural-text-muted text-[9px]">{issue.id}</span>
                            <span className="truncate font-serif italic">{issue.title}</span>
                          </p>
                          <p className="text-[9px] text-natural-text-muted font-mono">
                            {issue.distance_meters}m away • {issue.reported_days_ago}d ago • <span className="capitalize">{issue.category.replace("_", " ")}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold uppercase border ${
                            issue.status === 'resolved' 
                              ? 'bg-natural-primary/10 text-natural-primary border-natural-primary/20' 
                              : issue.status === 'pending'
                              ? 'bg-natural-accent-red/10 text-natural-accent-red border-natural-accent-red/20'
                              : 'bg-natural-accent-amber/10 text-natural-accent-amber border-natural-accent-amber/20'
                          }`}>
                            {issue.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveNearbyIssue(issue.id)}
                            className="text-natural-text-muted hover:text-natural-text p-0.5 font-semibold text-xs cursor-pointer"
                            title="Remove issue"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-white border border-dashed rounded-lg text-natural-text-muted italic text-[10px] border-natural-border">
                    No nearby issues simulated. Duplicate checking engine will report 100% unique score.
                  </div>
                )}

                {/* Inline form to add simulated nearby issue */}
                <form onSubmit={handleAddNearbyIssue} className="border-t border-natural-border-light pt-3 space-y-2">
                  <p className="text-[9px] font-bold text-natural-text-muted uppercase tracking-widest">
                    Add custom incident to buffer:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Broken streetlight lamp"
                      value={newNearbyTitle}
                      onChange={(e) => setNewNearbyTitle(e.target.value)}
                      className="col-span-2 text-[10px] px-2.5 py-1.5 border border-natural-border rounded-lg bg-white"
                    />
                    <select
                      value={newNearbyCategory}
                      onChange={(e) => setNewNearbyCategory(e.target.value)}
                      className="text-[10px] px-2 py-1.5 border border-natural-border rounded-lg bg-white"
                    >
                      <option value="road_damage">Road Damage</option>
                      <option value="pothole">Pothole</option>
                      <option value="water_leak">Water Leak</option>
                      <option value="streetlight">Streetlight</option>
                      <option value="garbage">Garbage</option>
                      <option value="drainage">Drainage</option>
                      <option value="sewage">Sewage</option>
                      <option value="other">Other</option>
                    </select>
                    <select
                      value={newNearbyStatus}
                      onChange={(e) => setNewNearbyStatus(e.target.value as any)}
                      className="text-[10px] px-2 py-1.5 border border-natural-border rounded-lg bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Distance (m)"
                      value={newNearbyDistance}
                      onChange={(e) => setNewNearbyDistance(Number(e.target.value))}
                      className="text-[10px] px-2 py-1.5 border border-natural-border rounded-lg bg-white"
                      title="Distance in meters"
                    />
                    <input
                      type="number"
                      placeholder="Days ago"
                      value={newNearbyDaysAgo}
                      onChange={(e) => setNewNearbyDaysAgo(Number(e.target.value))}
                      className="text-[10px] px-2 py-1.5 border border-natural-border rounded-lg bg-white"
                      title="Reported days ago"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-natural-primary hover:bg-natural-primary/90 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Add Incident to sensing buffer</span>
                  </button>
                </form>
              </div>
            </div>

            {/* ERROR CALLOUT */}
            {error && (
              <div className="bg-natural-accent-red/10 border border-natural-accent-red/35 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-natural-accent-red shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-natural-accent-red uppercase tracking-widest font-sans">
                    CivicAI Dispatch Failure
                  </h4>
                  <p className="text-xs text-natural-accent-red leading-relaxed">
                    {error}
                  </p>
                  {error.includes("GEMINI_API_KEY") && (
                    <div className="text-[11px] font-medium text-natural-accent-red/90 bg-natural-accent-red/5 p-2 rounded border border-natural-accent-red/25 mt-2">
                      💡 <strong>How to fix:</strong> Open the <strong>Settings &gt; Secrets</strong> panel in the upper-right of Google AI Studio and configure a variable named <code>GEMINI_API_KEY</code> with your personal Gemini developer key.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ANALYZE ACTION BUTTON */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              id="civicai-analyze-trigger-btn"
              className={`w-full py-3.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                loading
                  ? "bg-natural-bg-light text-natural-text-muted border border-natural-border cursor-not-allowed"
                  : "bg-natural-primary hover:bg-natural-primary/95 text-white active:scale-98"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-natural-primary" />
                  <span>CivicAI Dispatch Parsing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Execute CivicAI Report Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Persistent analysis history records list */}
          <ReportHistory
            history={reportHistory}
            activeId={activeHistoryId}
            onSelectReport={handleSelectHistoryReport}
            onDeleteReport={handleDeleteHistoryReport}
            onClearAll={handleClearAllHistory}
          />
        </section>

        {/* RIGHT COLUMN: Output Dashboard Visualizer (7/12 columns) */}
        <section className="xl:col-span-7 flex flex-col space-y-6" id="dashboard-results-panel">
          
          {loading ? (
            /* Detailed simulation terminals displaying the current processing phase */
            <div className="bg-natural-primary border border-natural-border rounded-[32px] p-8 shadow-md text-white flex-1 flex flex-col items-center justify-center min-h-[500px]" id="simulated-terminal-loading">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-white animate-spin flex items-center justify-center" />
                <Sparkles className="w-6 h-6 text-natural-accent-amber absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center space-y-2 max-w-sm">
                <h3 className="text-sm font-bold tracking-widest uppercase text-white font-mono">
                  CivicAI Computing Core Active
                </h3>
                <p className="text-xs text-natural-bg-light/95 font-mono h-12 flex items-center justify-center">
                  {loadingPhase}
                </p>
                <div className="w-48 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-white rounded-full animate-[shimmer_2s_infinite] w-24" />
                </div>
              </div>
            </div>
          ) : analysisResult ? (
            /* Complete Dashboard Display once analysis has succeeded */
            <div className="space-y-6 flex-1 flex flex-col" id="active-dashboard-panel">
              {/* Tabs for switching dashboard types */}
              <div className="flex items-center justify-between border-b border-natural-border pb-2">
                <div className="flex gap-2 bg-natural-bg-light p-1 rounded-xl border border-natural-border-light">
                  <button
                    onClick={() => setActiveTab("visual")}
                    id="tab-btn-visual"
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === "visual"
                        ? "bg-white text-natural-primary shadow-sm border border-natural-border/30"
                        : "text-natural-text-muted hover:text-natural-text"
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    CivicAI Bento Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab("json")}
                    id="tab-btn-json"
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === "json"
                        ? "bg-white text-natural-primary shadow-sm border border-natural-border/30"
                        : "text-natural-text-muted hover:text-natural-text"
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    Raw JSON Output
                  </button>
                </div>
                
                {/* Reset button to clear output */}
                <button
                  onClick={() => {
                    setAnalysisResult(null);
                    setError(null);
                  }}
                  id="reset-dashboard-btn"
                  className="text-xs text-natural-text-muted hover:text-natural-primary flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Clear Analysis
                </button>
              </div>

              {/* Toggle Content rendering */}
              <div className="flex-1">
                {activeTab === "visual" ? (
                  <div className="space-y-6">
                    {/* Bento Dashboard display */}
                    <AnalysisDisplay analysis={analysisResult} />
                    
                    {/* Simulated Map Viewport representing location and spatial diagnostics */}
                    <MapPreview
                      location={location}
                      coordinates={coordinates}
                      nearbyIssues={nearbyIssues}
                      impactRadius={analysisResult.community.impact_radius_meters}
                      isLikelyDuplicate={analysisResult.duplicate_check.is_likely_duplicate}
                    />
                  </div>
                ) : (
                  <RawJsonView data={analysisResult} />
                )}
              </div>
            </div>
          ) : (
            /* Default Welcome / Inactive State View (GIS guidance & tutorial) */
            <div className="bg-white border border-natural-border rounded-[32px] p-8 text-center flex-1 flex flex-col items-center justify-center min-h-[500px]" id="welcome-dashboard-placeholder">
              <div className="w-16 h-16 rounded-2xl bg-natural-bg-light border border-natural-border flex items-center justify-center text-natural-primary mb-6 shadow-xs">
                <Compass className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-3">
                <h3 className="text-lg font-bold tracking-tight text-natural-primary font-serif italic">
                  Waiting for citizen dispatch logs
                </h3>
                <p className="text-xs text-natural-text-dark leading-relaxed">
                  Select one of our preset report templates (such as the Elmwood Ave Pothole or Broad St Water Leak) on the left sidebar to pre-populate details, or toggle to "Custom Image" and upload your own civic photograph.
                </p>
                <div className="flex justify-center items-center gap-3 pt-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-natural-text bg-natural-bg-light px-3 py-1 rounded-full border border-natural-border-light">
                    <Shield className="w-3.5 h-3.5 text-natural-primary" />
                    Encrypted Key Safe
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-natural-text bg-natural-bg-light px-3 py-1 rounded-full border border-natural-border-light">
                    <Layers className="w-3.5 h-3.5 text-natural-primary" />
                    Spatial Cross-checking
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>

      </main>

      {/* Humble professional civic footer */}
      <footer className="bg-white border-t border-natural-border py-6 text-center" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 text-natural-text-muted text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono">
            © 2026 CivicAI Inc. Licensed for municipal and community reporting.
          </p>
          <div className="flex items-center gap-4 text-[11px] font-medium">
            <span className="hover:text-natural-primary cursor-pointer">SLA Status</span>
            <span>•</span>
            <span className="hover:text-natural-primary cursor-pointer">Privacy Charter</span>
            <span>•</span>
            <span className="hover:text-natural-primary cursor-pointer">API Integration</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
