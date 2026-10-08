/**
 * Authored examples for the architectural product preview. No live telemetry.
 * Only the three illustrated weight-stack concepts have sample activity data.
 * Inventory entries deliberately leave all activity measurements unavailable.
 * Footprints describe approximate scene geometry, not manufacturer dimensions
 * or installation clearances. Dates and equipment records are fictional.
 */
export const MACHINE_SAMPLE_CONTEXT = Object.freeze({
  venue: "Northside demo",
  date: "7 October 2026",
  window: "Matched observed equipment hours",
  trendWindow: "Compared with matched hours in the previous week",
  sparklineWindow: "1–7 October 2026",
  sourceLabel: "Illustrative equipment data",
  activityDefinition:
    "Time away from rest as a share of observed equipment time.",
  coverageDefinition:
    "Share of the sample observation window with available data.",
  inventoryDefinition: "Example equipment record; no sensor activity is shown.",
});

const inventory = (entry) =>
  Object.freeze({
    measurement: "inventory",
    status: "Equipment record",
    label: "Sample inventory",
    activeMinutes: null,
    activityShare: null,
    coverage: null,
    trend: null,
    peakWindow: null,
    comparison: "Example equipment record",
    sparkline: null,
    sparklineLabel: null,
    ...entry,
  });

const activity = (entry) =>
  Object.freeze({
    measurement: "sample",
    status: "Sample observation",
    label: "Sample activity",
    coverage: 98.6,
    lastReview: "5 Oct 2026",
    comparison: "vs matched hours last week",
    sparklineLabel: "Recorded minutes · 1–7 Oct",
    ...entry,
  });

export const MACHINE_DATA = Object.freeze({
  "lat-pulldown": activity({
    id: "lat-pulldown",
    name: "Lat pulldown",
    assetId: "LD-01",
    zone: "strength",
    category: "Weight-stack strength",
    activeMinutes: 252,
    activityShare: 64,
    trend: "+8%",
    peakWindow: "17:00–19:00",
    insight:
      "Evening activity is building. Review the same window before changing the floor.",
    sparkline: [224, 233, 228, 237, 244, 247, 252],
    spec: [
      { label: "Approx. footprint", value: "1.3 × 1.7 m" },
      { label: "Review focus", value: "Cable travel & guide rods" },
    ],
    nextStep: "Review the evening pattern",
  }),
  "cable-station": activity({
    id: "cable-station",
    name: "Dual cable station",
    assetId: "CS-01",
    zone: "strength",
    category: "Weight-stack strength",
    activeMinutes: 270,
    activityShare: 68,
    trend: "+10%",
    peakWindow: "17:00–20:00",
    insight:
      "This station leads the strength group. Check placement before expanding it.",
    sparkline: [239, 245, 251, 247, 261, 266, 270],
    spec: [
      { label: "Approx. footprint", value: "2.0 × 1.0 m" },
      { label: "Review focus", value: "Pulley travel & attachments" },
    ],
    nextStep: "Review station placement",
  }),
  "chest-press": activity({
    id: "chest-press",
    name: "Chest press",
    assetId: "CP-01",
    zone: "strength",
    category: "Weight-stack strength",
    activeMinutes: 234,
    activityShare: 58,
    trend: "+6%",
    peakWindow: "16:00–19:00",
    insight:
      "Activity rises after 16:00. Pair the pattern with floor feedback before relocating it.",
    sparkline: [209, 217, 221, 216, 229, 231, 234],
    spec: [
      { label: "Approx. footprint", value: "1.4 × 1.7 m" },
      { label: "Review focus", value: "Arm travel & upholstery" },
    ],
    nextStep: "Compare quieter hours",
  }),
  "bench-01": inventory({
    id: "bench-01",
    name: "Adjustable bench",
    assetId: "BN-01",
    zone: "strength",
    category: "Free weights",
    lastReview: "5 Oct 2026",
    nextReview: "12 Oct 2026",
    reviewStatus: "Weekly check",
    insight:
      "Check the adjustment lock and working clearance during the next floor walk.",
    spec: [
      { label: "Approx. footprint", value: "0.8 × 1.7 m" },
      { label: "Review focus", value: "Adjustment lock & fixings" },
    ],
    nextStep: "Add a bench check",
  }),
  "bench-02": inventory({
    id: "bench-02",
    name: "Flat bench",
    assetId: "BN-02",
    zone: "recovery",
    category: "Free weights",
    lastReview: "5 Oct 2026",
    nextReview: "12 Oct 2026",
    reviewStatus: "Weekly check",
    insight:
      "Keep upholstery and fixing checks in the weekly review for this open-floor bench.",
    spec: [
      { label: "Approx. footprint", value: "0.8 × 1.7 m" },
      { label: "Review focus", value: "Upholstery & fixings" },
    ],
    nextStep: "Review bench condition",
  }),
  "dumbbell-rack": inventory({
    id: "dumbbell-rack",
    name: "Dumbbell rack",
    assetId: "DR-01",
    zone: "recovery",
    category: "Free-weight storage",
    lastReview: "6 Oct 2026",
    nextReview: "13 Oct 2026",
    reviewStatus: "Weekly check",
    insight:
      "Review rack order and the space in front of it before changing this area.",
    spec: [
      { label: "Approx. footprint", value: "2.8 × 0.6 m" },
      { label: "Review focus", value: "Rack stability & storage" },
    ],
    nextStep: "Review the rack layout",
  }),
  "treadmill-01": inventory({
    id: "treadmill-01",
    name: "Treadmill 01",
    assetId: "TM-01",
    zone: "cardio",
    category: "Cardio",
    lastReview: "2 Oct 2026",
    nextReview: "16 Oct 2026",
    reviewStatus: "Service review",
    warrantyReview: "Apr 2027",
    insight:
      "Keep belt and deck checks beside the service record when planning the next review.",
    spec: [
      { label: "Approx. footprint", value: "1.0 × 2.3 m" },
      { label: "Review focus", value: "Belt, deck & service notes" },
    ],
    nextStep: "Open the service review",
  }),
  "treadmill-02": inventory({
    id: "treadmill-02",
    name: "Treadmill 02",
    assetId: "TM-02",
    zone: "cardio",
    category: "Cardio",
    lastReview: "4 Oct 2026",
    nextReview: "18 Oct 2026",
    reviewStatus: "Service review",
    warrantyReview: "Jun 2027",
    insight:
      "Compare its service notes with the first treadmill before scheduling the next check.",
    spec: [
      { label: "Approx. footprint", value: "1.0 × 2.3 m" },
      { label: "Review focus", value: "Belt alignment & service notes" },
    ],
    nextStep: "Compare service records",
  }),
  "bike-01": inventory({
    id: "bike-01",
    name: "Stationary bike",
    assetId: "BK-01",
    zone: "cardio",
    category: "Cardio",
    lastReview: "4 Oct 2026",
    nextReview: "18 Oct 2026",
    reviewStatus: "Service review",
    warrantyReview: "Jun 2027",
    insight:
      "Check saddle adjustment and pedal condition during the next service review.",
    spec: [
      { label: "Approx. footprint", value: "0.7 × 1.4 m" },
      { label: "Review focus", value: "Saddle, pedals & fixings" },
    ],
    nextStep: "Plan the bike check",
  }),
  "mat-01": inventory({
    id: "mat-01",
    name: "Stretching station 01",
    assetId: "ST-01",
    zone: "recovery",
    category: "Mobility & open floor",
    lastReview: "7 Oct 2026",
    nextReview: "14 Oct 2026",
    reviewStatus: "Floor review",
    insight:
      "Keep the mat and roller grouped so the open floor remains easy to reset.",
    spec: [
      { label: "Mat footprint", value: "Approx. 0.9 × 1.8 m" },
      { label: "Review focus", value: "Mat condition & storage" },
    ],
    nextStep: "Review the station layout",
  }),
  "mat-02": inventory({
    id: "mat-02",
    name: "Stretching station 02",
    assetId: "ST-02",
    zone: "recovery",
    category: "Mobility & open floor",
    lastReview: "7 Oct 2026",
    nextReview: "14 Oct 2026",
    reviewStatus: "Floor review",
    insight:
      "Review mat condition and nearby storage before changing the open-floor layout.",
    spec: [
      { label: "Mat footprint", value: "Approx. 0.9 × 1.8 m" },
      { label: "Review focus", value: "Mat condition & layout" },
    ],
    nextStep: "Add a floor review",
  }),
  "kettlebell-rack": inventory({
    id: "kettlebell-rack",
    name: "Kettlebell set",
    assetId: "KB-01",
    zone: "recovery",
    category: "Free weights",
    lastReview: "6 Oct 2026",
    nextReview: "13 Oct 2026",
    reviewStatus: "Weekly check",
    insight:
      "Check handle condition and keep a clear return point for the set.",
    spec: [
      { label: "Approx. footprint", value: "0.4 × 1.4 m" },
      { label: "Review focus", value: "Handles & return area" },
    ],
    nextStep: "Review the return point",
  }),
});

export default MACHINE_DATA;
