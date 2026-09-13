export type Risk = "Normal" | "Watch" | "Warning" | "Emergency";
export type Scenario =
  | "Normal conditions"
  | "Heavy rainfall"
  | "Yellow alert"
  | "Orange warning"
  | "Red emergency"
  | "Flooded road report"
  | "Rising water in a village"
  | "Bridge closure";
export const scenarios: Scenario[] = [
  "Normal conditions",
  "Heavy rainfall",
  "Yellow alert",
  "Orange warning",
  "Red emergency",
  "Flooded road report",
  "Rising water in a village",
  "Bridge closure",
];
export const locations = [
  {
    id: "tapesia",
    name: "Tapesia",
    region: "Kamrup Metropolitan",
    kind: "Village",
    x: 440,
    y: 270,
  },
  {
    id: "sonapur",
    name: "Sonapur",
    region: "Kamrup Metropolitan",
    kind: "Small town",
    x: 650,
    y: 190,
  },
  {
    id: "guwahati",
    name: "Guwahati",
    region: "Kamrup Metropolitan",
    kind: "Major city",
    x: 135,
    y: 120,
  },
  {
    id: "morigaon",
    name: "Morigaon",
    region: "Morigaon",
    kind: "District headquarters",
    x: 725,
    y: 85,
  },
  {
    id: "baren",
    name: "Baren",
    region: "Kamrup Metropolitan",
    kind: "Remote village",
    x: 260,
    y: 370,
  },
];
export const shelters = [
  {
    id: "school",
    name: "Hillview School",
    type: "Demo relief shelter",
    x: 580,
    y: 370,
  },
  {
    id: "hall",
    name: "Community Hall",
    type: "Demo evacuation point",
    x: 300,
    y: 160,
  },
  {
    id: "hospital",
    name: "Upland Health Centre",
    type: "Demo hospital",
    x: 760,
    y: 320,
  },
];
export function riskFor(s: Scenario): Risk {
  return s === "Red emergency"
    ? "Emergency"
    : s === "Orange warning" || s === "Bridge closure"
      ? "Warning"
      : s === "Normal conditions"
        ? "Normal"
        : "Watch";
}
export const actions: Record<Risk, string> = {
  Normal:
    "Stay informed. Keep essentials ready and know your nearest higher ground.",
  Watch:
    "Avoid low-lying roads and waterways. Keep your phone charged and prepare to move if advised.",
  Warning:
    "Prepare to move to higher ground. Follow local instructions and avoid damaged bridges.",
  Emergency:
    "Follow official evacuation orders. Seek higher ground when advised. Never enter moving floodwater.",
};
export type Report = {
  id: number;
  location: string;
  type: string;
  severity: string;
  description: string;
  time: string;
  photo?: string;
};
export const initialReports: Report[] = [
  {
    id: 1,
    location: "tapesia",
    type: "Rising water",
    severity: "Low",
    description:
      "Stream level rising near the eastern footbridge. Road is still open.",
    time: "12 min ago",
  },
  {
    id: 2,
    location: "tapesia",
    type: "Other",
    severity: "Low",
    description:
      "Waterlogging near the school entrance. Please use the upper gate.",
    time: "28 min ago",
  },
  {
    id: 3,
    location: "baren",
    type: "Flooded road",
    severity: "High",
    description: "Water across the village access road. Do not cross.",
    time: "35 min ago",
  },
];
