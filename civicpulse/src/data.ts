import { ReportTemplate } from "./types";

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "pothole_elmwood",
    name: "Elmwood Ave Pothole",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80",
    location: "1422 Elmwood Ave, Oak Creek",
    coordinates: "42.8833, -87.9042",
    description: "Massive pothole in the middle of the northbound lane. Already forced two cars to swerve onto the shoulder.",
    nearbyIssues: [
      {
        id: "ISS-409",
        title: "Cracked Asphalt near 1400 Elmwood",
        category: "road_damage",
        status: "resolved",
        distance_meters: 150,
        reported_days_ago: 12,
      },
      {
        id: "ISS-712",
        title: "Deep pothole near junction",
        category: "pothole",
        status: "pending",
        distance_meters: 45,
        reported_days_ago: 2,
      }
    ],
    reporterHistoryCount: 2,
  },
  {
    id: "water_broad",
    name: "Broad Street Water Leak",
    imageUrl: "https://images.unsplash.com/photo-1542013936693-8848e5740a7a?auto=format&fit=crop&w=600&q=80",
    location: "740 Broad Street, Downtown",
    coordinates: "39.9612, -82.9988",
    description: "Water is bubbling up from under the sidewalk tiles near the bus stop. Sidewalk is starting to flood.",
    nearbyIssues: [
      {
        id: "ISS-992",
        title: "Leaking Fire Hydrant on Broad Street",
        category: "water_leak",
        status: "pending",
        distance_meters: 25,
        reported_days_ago: 1,
      },
      {
        id: "ISS-201",
        title: "Low water pressure reported",
        category: "other",
        status: "resolved",
        distance_meters: 280,
        reported_days_ago: 8,
      }
    ],
    reporterHistoryCount: 1,
  },
  {
    id: "streetlight_skyline",
    name: "Skyline Blvd Dark Streetlight",
    imageUrl: "https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&w=600&q=80",
    location: "Skyline Blvd & Pine Crest Rd",
    coordinates: "37.7749, -122.4194",
    description: "Intersection is pitched in absolute darkness. The main streetlight is flickering and mostly off.",
    nearbyIssues: [
      {
        id: "ISS-811",
        title: "Streetlight outage near pine crest",
        category: "streetlight",
        status: "investigating",
        distance_meters: 120,
        reported_days_ago: 5,
      }
    ],
    reporterHistoryCount: 8,
  },
  {
    id: "garbage_alley",
    name: "Industrial Dumping",
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
    location: "Industrial Alleyway behind Block 4",
    coordinates: "47.6062, -122.3321",
    description: "Multiple piles of construction debris, old tires, and bags of trash dumped overnight.",
    nearbyIssues: [
      {
        id: "ISS-102",
        title: "Abandoned Furniture in main drive",
        category: "garbage",
        status: "resolved",
        distance_meters: 310,
        reported_days_ago: 14,
      }
    ],
    reporterHistoryCount: 0,
  },
  {
    id: "drainage_riverview",
    name: "Riverview Clogged Drain",
    imageUrl: "https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&w=600&q=80",
    location: "612 Riverview Terrace",
    coordinates: "45.5152, -122.6784",
    description: "Storm drain is completely clogged with leaves and plastic waste, causing water to pool 4 inches deep on the road corner.",
    nearbyIssues: [
      {
        id: "ISS-315",
        title: "Sewer backup on Riverview terrace",
        category: "sewage",
        status: "resolved",
        distance_meters: 80,
        reported_days_ago: 22,
      },
      {
        id: "ISS-322",
        title: "Flooded culvert",
        category: "drainage",
        status: "pending",
        distance_meters: 400,
        reported_days_ago: 1,
      }
    ],
    reporterHistoryCount: 4,
  }
];

export const MAP_CENTER_DEFAULT = { lat: 39.9612, lng: -82.9988 };
