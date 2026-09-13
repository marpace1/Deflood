export type RoadStatus =
  "Open" | "Caution" | "Partially blocked" | "Dangerous" | "Unknown";
export type Edge = {
  a: string;
  b: string;
  km: number;
  name: string;
  status: RoadStatus;
};
export const baseEdges: Edge[] = [
  {
    a: "tapesia",
    b: "school",
    km: 1.2,
    name: "Lowland school road",
    status: "Open",
  },
  {
    a: "tapesia",
    b: "hall",
    km: 1.8,
    name: "Tapesia ridge road",
    status: "Open",
  },
  { a: "hall", b: "school", km: 2.1, name: "Upper hill road", status: "Open" },
  {
    a: "tapesia",
    b: "sonapur",
    km: 2.3,
    name: "Digaru bridge",
    status: "Open",
  },
  {
    a: "sonapur",
    b: "hospital",
    km: 1.4,
    name: "Hospital approach",
    status: "Open",
  },
  {
    a: "hospital",
    b: "school",
    km: 2.2,
    name: "Eastern ridge road",
    status: "Open",
  },
  {
    a: "guwahati",
    b: "hall",
    km: 4.6,
    name: "Western access road",
    status: "Open",
  },
  {
    a: "morigaon",
    b: "sonapur",
    km: 3.4,
    name: "District connector",
    status: "Open",
  },
  {
    a: "baren",
    b: "tapesia",
    km: 1.7,
    name: "Village access road",
    status: "Dangerous",
  },
  { a: "baren", b: "hall", km: 2.8, name: "Baren upland road", status: "Open" },
];
export function roadsFor(
  s: string,
  reportedBlocked = false,
  area = "tapesia",
): Edge[] {
  const adjacent = baseEdges
    .filter((e) => e.a === area || e.b === area)
    .sort((a, b) => a.km - b.km);
  const shortcut = adjacent[0]?.name;
  const bridge = adjacent.find((e) =>
    e.name.toLowerCase().includes("bridge"),
  )?.name;
  return baseEdges.map((e) => ({
    ...e,
    status:
      s === "Red emergency" && (e.a === area || e.b === area)
        ? "Dangerous"
        : e.name === shortcut &&
            (reportedBlocked ||
              [
                "Flooded road report",
                "Orange warning",
                "Bridge closure",
              ].includes(s))
          ? "Dangerous"
          : e.name === bridge && s === "Bridge closure"
            ? "Dangerous"
            : e.name === shortcut &&
                s !== "Normal conditions" &&
                e.status !== "Dangerous"
              ? "Caution"
              : e.status,
  }));
}
export function findRoutes(edges: Edge[], start: string, end: string) {
  const paths: { nodes: string[]; km: number; caution: number }[] = [];
  function visit(node: string, nodes: string[], km: number, caution: number) {
    if (node === end) {
      paths.push({ nodes, km, caution });
      return;
    }
    for (const e of edges) {
      if (!["Open", "Caution"].includes(e.status)) continue;
      const next = e.a === node ? e.b : e.b === node ? e.a : null;
      if (next && !nodes.includes(next))
        visit(
          next,
          [...nodes, next],
          km + e.km,
          caution + Number(e.status === "Caution"),
        );
    }
  }
  visit(start, [start], 0, 0);
  return paths.sort((a, b) => a.km - b.km);
}
