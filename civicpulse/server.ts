import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Lazy initializer for Google Gen AI client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Settings > Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Endpoint to analyze the community report
app.post("/api/analyze", async (req, res) => {
  try {
    const {
      image,
      imageUrl,
      location,
      coordinates,
      description,
      nearbyIssues,
      reporterHistoryCount,
    } = req.body;

    // Get the base64 data of the image
    let base64Data = "";
    let mimeType = "image/jpeg";

    if (image) {
      // Direct base64 upload
      // Extract data if it has data URL prefix, e.g., "data:image/jpeg;base64,..."
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      } else {
        base64Data = image;
      }
    } else if (imageUrl) {
      // We need to fetch the image from the URL and convert it to base64
      try {
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) {
          throw new Error(`Failed to fetch image from URL: ${imageUrl}`);
        }
        const buffer = await imageRes.arrayBuffer();
        base64Data = Buffer.from(buffer).toString("base64");
        const contentType = imageRes.headers.get("content-type");
        if (contentType) {
          mimeType = contentType;
        }
      } catch (err: any) {
        return res.status(400).json({
          error: `Failed to download image template: ${err.message}`,
        });
      }
    } else {
      return res.status(400).json({
        error: "An image or an imageUrl is required for analysis.",
      });
    }

    const ai = getAiClient();

    // Prepare prompt according to user requirements
    const promptText = `
You are CivicAI, an intelligent assistant embedded in a community issue reporting platform.
A citizen has just submitted a report with the attached image and the following details:
- Location: ${location || "Unknown"}
- Coordinates: ${coordinates || "Unknown"}
- User description (optional): "${description || ""}"
- Nearby previously reported issues: ${JSON.stringify(nearbyIssues || [])}
- Reporter's past reports: ${reporterHistoryCount || 0} reports submitted

Analyze the image carefully and return a JSON object with details of the issue, routing, duplication check, community details, gamification points, and predictive AI insights.

Ensure the returned JSON perfectly follows this schema structure.
`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: promptText,
    };

    // Define response schema to strictly guarantee the structure
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        issue: {
          type: Type.OBJECT,
          description: "Details about the identified civic issue",
          properties: {
            category: {
              type: Type.STRING,
              description: "Must be one of: pothole | water_leak | streetlight | garbage | drainage | graffiti | road_damage | tree_hazard | sewage | other",
            },
            subcategory: {
              type: Type.STRING,
              description: "Specific detail, e.g. 'large pothole', 'burst pipe', 'broken bulb'",
            },
            severity: {
              type: Type.STRING,
              description: "Must be one of: low | medium | high | critical",
            },
            severity_reason: {
              type: Type.STRING,
              description: "One sentence explaining why this severity was assigned",
            },
            confidence_score: {
              type: Type.NUMBER,
              description: "Confidence score between 0.0 and 1.0",
            },
            description: {
              type: Type.STRING,
              description: "2-3 sentence professional description of the issue visible in the image",
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of 3 tags related to the issue",
            },
          },
          required: ["category", "subcategory", "severity", "severity_reason", "confidence_score", "description", "tags"],
        },
        routing: {
          type: Type.OBJECT,
          description: "Department routing and priority routing decisions",
          properties: {
            department: {
              type: Type.STRING,
              description: "e.g. Public Works | Water Authority | Electricity Board | Sanitation | Traffic",
            },
            priority_score: {
              type: Type.INTEGER,
              description: "Priority score between 1 and 100",
            },
            estimated_resolution_days: {
              type: Type.INTEGER,
              description: "Estimated number of days to resolve this issue",
            },
            escalate_immediately: {
              type: Type.BOOLEAN,
              description: "Whether this issue should trigger immediate escalation alert",
            },
            escalation_reason: {
              type: Type.STRING,
              description: "Reason for escalation, should be null if escalate_immediately is false",
            },
          },
          required: ["department", "priority_score", "estimated_resolution_days", "escalate_immediately"],
        },
        duplicate_check: {
          type: Type.OBJECT,
          description: "Cross-checks against nearby reported issues",
          properties: {
            is_likely_duplicate: {
              type: Type.BOOLEAN,
              description: "Whether this issue is likely already reported in the nearby issues",
            },
            duplicate_confidence: {
              type: Type.NUMBER,
              description: "Duplicate confidence between 0.0 and 1.0",
            },
            matching_issue_id: {
              type: Type.STRING,
              description: "Matching issue ID from the nearby issues list if a duplicate, else null",
            },
            duplicate_reason: {
              type: Type.STRING,
              description: "Reason/justification for duplication decision, else null",
            },
          },
          required: ["is_likely_duplicate", "duplicate_confidence"],
        },
        community: {
          type: Type.OBJECT,
          description: "Details for public feed visibility",
          properties: {
            public_title: {
              type: Type.STRING,
              description: "Short catchy title for the public feed, max 8 words",
            },
            public_summary: {
              type: Type.STRING,
              description: "1 sentence summary safe for public display",
            },
            suggested_hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Suggested hashtags for social feed sharing",
            },
            impact_radius_meters: {
              type: Type.INTEGER,
              description: "Estimated radius in meters impacted by this issue",
            },
          },
          required: ["public_title", "public_summary", "suggested_hashtags", "impact_radius_meters"],
        },
        gamification: {
          type: Type.OBJECT,
          description: "Citizen loyalty rewards and report quality scoring",
          properties: {
            reporter_points_awarded: {
              type: Type.INTEGER,
              description: "Points awarded between 10 and 50",
            },
            points_reason: {
              type: Type.STRING,
              description: "Reasoning for the points value",
            },
            badge_unlocked: {
              type: Type.STRING,
              description: "Badge name unlocked (e.g. 'Eagle Eye', 'Road Warrior'), or null if none",
            },
            quality_score: {
              type: Type.STRING,
              description: "Must be one of: poor | fair | good | excellent",
            },
          },
          required: ["reporter_points_awarded", "points_reason", "quality_score"],
        },
        ai_insight: {
          type: Type.STRING,
          description: "1 sentence predictive or contextual insight, e.g. 'This area has reported 3 drainage issues in 60 days — likely a systemic pipe failure.'",
        },
      },
      required: ["issue", "routing", "duplicate_check", "community", "gamification", "ai_insight"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response received from Gemini API.");
    }

    const jsonResult = JSON.parse(resultText);
    return res.json(jsonResult);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during Gemini Civic analysis.",
    });
  }
});

// Setup Vite Dev Server / Static Asset Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CivicAI server running on http://localhost:${PORT}`);
  });
}

startServer();
