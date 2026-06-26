export interface IssueDetails {
  category: "pothole" | "water_leak" | "streetlight" | "garbage" | "drainage" | "graffiti" | "road_damage" | "tree_hazard" | "sewage" | "other";
  subcategory: string;
  severity: "low" | "medium" | "high" | "critical";
  severity_reason: string;
  confidence_score: number;
  description: string;
  tags: string[];
}

export interface RoutingDetails {
  department: string;
  priority_score: number;
  estimated_resolution_days: number;
  escalate_immediately: boolean;
  escalation_reason: string | null;
}

export interface DuplicateCheckDetails {
  is_likely_duplicate: boolean;
  duplicate_confidence: number;
  matching_issue_id: string | null;
  duplicate_reason: string | null;
}

export interface CommunityDetails {
  public_title: string;
  public_summary: string;
  suggested_hashtags: string[];
  impact_radius_meters: number;
}

export interface GamificationDetails {
  reporter_points_awarded: number;
  points_reason: string;
  badge_unlocked: string | null;
  quality_score: "poor" | "fair" | "good" | "excellent";
}

export interface CivicAIAnalysis {
  issue: IssueDetails;
  routing: RoutingDetails;
  duplicate_check: DuplicateCheckDetails;
  community: CommunityDetails;
  gamification: GamificationDetails;
  ai_insight: string;
}

export interface NearbyIssue {
  id: string;
  title: string;
  category: string;
  status: "resolved" | "pending" | "investigating";
  distance_meters: number;
  reported_days_ago: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  imageUrl: string;
  location: string;
  coordinates: string;
  description: string;
  nearbyIssues: NearbyIssue[];
  reporterHistoryCount: number;
}

export interface SavedReport {
  id: string;
  timestamp: number;
  title: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  location: string;
  coordinates: string;
  description: string;
  reporterHistoryCount: number;
  nearbyIssues: NearbyIssue[];
  imageSource: string;
  isCustomSelected: boolean;
  customImageBase64: string | null;
  analysisResult: CivicAIAnalysis;
}
