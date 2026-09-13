import { useState } from "react";
import { Layers, RotateCcw, MapPin, Plus, Minus } from "lucide-react";
import { locations, shelters, type Report, type Risk } from "./data";
import { type Edge } from "./routing";
export default function RiskMap({
  selected,
  onSelect,
  roads,
  risk,
  reports,
  route = [],
  areaRisks = {},
}: {
  selected: string;
  onSelect: (s: string) => void;
  roads: Edge[];
  risk: Risk;
  reports: Report[];
  route?: string[];
  areaRisks?: Record<string, Risk>;
}) {
  const [layers, setLayers] = useState({
    risk: true,
    reports: true,
    roads: true,
  });
  const [road, setRoad] = useState<Edge | null>(null);
  const [zoom, setZoom] = useState(1);
  const nodes = [...locations, ...shelters];
  const zoneColors = {
    Normal: "#76ac8b",
    Watch: "#c89927",
    Warning: "#e67b32",
    Emergency: "#d94955",
  };
  const colors = {
    Open: "#269b75",
    Caution: "#bc8a13",
    "Partially blocked": "#e88029",
    Dangerous: "#df5757",
    Unknown: "#939ca8",
  };
  return (
    <div className="map-wrap">
      <div className="map-toolbar">
        <span>
          <MapPin size={14} /> Assam · schematic demo map
        </span>
        <div>
          <button
            aria-label="Zoom in"
            onClick={() => setZoom(Math.min(1.5, zoom + 0.15))}
          >
            <Plus size={16} />
          </button>
          <button
            aria-label="Zoom out"
            onClick={() => setZoom(Math.max(0.8, zoom - 0.15))}
          >
            <Minus size={16} />
          </button>
          <button
            aria-label="Reset map"
            onClick={() => {
              setZoom(1);
              setRoad(null);
              setLayers({ risk: true, reports: true, roads: true });
            }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
      <svg
        viewBox="0 0 900 450"
        role="group"
        aria-label="Interactive fictional Assam map. Select villages or roads for details."
      >
        <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="#e4e9df"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="900" height="450" fill="#f1f3eb" />
        <rect width="900" height="450" fill="url(#grid)" />
        <g
          transform={`translate(${450 * (1 - zoom)} ${225 * (1 - zoom)}) scale(${zoom})`}
        >
          <path
            d="M0 60 Q150 10 240 75 T460 80 T690 38 T920 70"
            stroke="#b2d6df"
            strokeWidth="38"
            fill="none"
          />
          <path
            d="M510 55 Q480 140 535 210 T505 335 T490 470"
            stroke="#b2d6df"
            strokeWidth="16"
            fill="none"
          />
          <path
            d="M20 310 Q130 245 215 290 L330 440 L25 435Z M650 240 Q790 160 875 220 L900 440 L720 440Z"
            fill="#e0e9d8"
          />
          <text x="110" y="48" className="river-label">
            BRAHMAPUTRA
          </text>
          <text
            x="541"
            y="290"
            className="river-label"
            transform="rotate(65 541 290)"
          >
            DIGARU RIVER
          </text>
          <path
            d="M0 205 L210 225 L425 190 L695 250 L900 170 M80 450 L210 225 L240 0"
            stroke="white"
            strokeWidth="12"
            fill="none"
          />
          <path
            d="M0 205 L210 225 L425 190 L695 250 L900 170"
            stroke="#d8d4c2"
            strokeWidth="2"
            strokeDasharray="6 5"
            fill="none"
          />
          {layers.risk &&
            locations.map((l) => (
              <circle
                key={l.id}
                cx={l.x}
                cy={l.y}
                r={l.id === selected ? 63 : 33}
                fill={
                  zoneColors[
                    areaRisks[l.id] || (l.id === selected ? risk : "Normal")
                  ] + "35"
                }
                stroke={
                  zoneColors[
                    areaRisks[l.id] || (l.id === selected ? risk : "Normal")
                  ]
                }
                strokeDasharray="5 5"
              />
            ))}
          {roads.map((e) => {
            const a = nodes.find((n) => n.id === e.a)!;
            const b = nodes.find((n) => n.id === e.b)!;
            const inRoute = route.some(
              (n, i) =>
                (n === e.a && route[i + 1] === e.b) ||
                (n === e.b && route[i + 1] === e.a),
            );
            return (
              <g key={e.name}>
                <path
                  d={`M${a.x} ${a.y} L${b.x} ${b.y}`}
                  stroke={
                    inRoute
                      ? "#2563eb"
                      : layers.roads
                        ? colors[e.status]
                        : "#d0caba"
                  }
                  strokeWidth={inRoute ? 7 : 3}
                  strokeDasharray={e.status === "Dangerous" ? "7 5" : undefined}
                  fill="none"
                />
                {layers.roads && (
                  <g
                    tabIndex={0}
                    role="button"
                    aria-label={`${e.name}: ${e.status}`}
                    onClick={() => setRoad(e)}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault();
                        setRoad(e);
                      }
                    }}
                    className="map-point"
                  >
                    <circle
                      cx={(a.x + b.x) / 2}
                      cy={(a.y + b.y) / 2}
                      r="9"
                      fill="white"
                      stroke={colors[e.status]}
                      strokeWidth="2"
                    />
                    <text
                      x={(a.x + b.x) / 2}
                      y={(a.y + b.y) / 2 + 4}
                      textAnchor="middle"
                      fontSize="12"
                      fill={colors[e.status]}
                    >
                      {e.status === "Dangerous" ? "×" : "·"}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          {locations.map((l) => (
            <g
              key={l.id}
              tabIndex={0}
              role="button"
              aria-label={`Select ${l.name}`}
              onClick={() => onSelect(l.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(l.id);
                }
              }}
              className="map-point"
            >
              <circle
                cx={l.x}
                cy={l.y}
                r={selected === l.id ? 10 : 6}
                fill={selected === l.id ? "#2563eb" : "#fff"}
                stroke={selected === l.id ? "white" : "#5c7168"}
                strokeWidth="3"
              />
              <text
                x={l.x}
                y={l.y - 20}
                textAnchor="middle"
                className={
                  selected === l.id ? "selected-map-label" : "map-label"
                }
              >
                {l.name}
              </text>
              {layers.reports && reports.some((r) => r.location === l.id) && (
                <g>
                  <circle
                    cx={l.x + 18}
                    cy={l.y + 14}
                    r="9"
                    fill="#fff"
                    stroke="#d7a43f"
                  />
                  <text
                    x={l.x + 18}
                    y={l.y + 18}
                    textAnchor="middle"
                    fontSize="11"
                  >
                    !
                  </text>
                </g>
              )}
            </g>
          ))}
          {shelters.map((s) => (
            <g key={s.id}>
              <rect
                x={s.x - 9}
                y={s.y - 9}
                width="18"
                height="18"
                rx="3"
                fill="white"
                stroke="#269b75"
                strokeWidth="2"
              />
              <text
                x={s.x}
                y={s.y + 5}
                textAnchor="middle"
                fill="#269b75"
                fontSize="16"
              >
                +
              </text>
              <text
                x={s.x}
                y={s.y + 28}
                textAnchor="middle"
                className="map-label"
              >
                {s.name}
              </text>
            </g>
          ))}
          <text x="55" y="400" fill="#9ca98f" fontSize="13" letterSpacing="3">
            MEGHALAYA HILLS
          </text>
        </g>
      </svg>
      {road && (
        <div className="road-detail">
          <div>
            <strong>{road.name}</strong>
            <button
              onClick={() => setRoad(null)}
              aria-label="Close road detail"
            >
              ×
            </button>
          </div>
          <span style={{ color: colors[road.status] }}>{road.status}</span>
          <p>
            {road.status === "Dangerous"
              ? "Flooding or blockage reported. Do not cross."
              : "Fictional road condition; not verified for travel."}
          </p>
          <small>Demo community report · just updated</small>
        </div>
      )}
      <div className="map-bottom">
        <div className="layer-controls">
          <Layers size={15} />
          {(["risk", "reports", "roads"] as const).map((k) => (
            <label key={k}>
              <input
                type="checkbox"
                checked={layers[k]}
                onChange={() => setLayers({ ...layers, [k]: !layers[k] })}
              />
              {k === "roads"
                ? "Road risk"
                : k === "risk"
                  ? "Risk zones"
                  : "Reports"}
            </label>
          ))}
        </div>
        <span className="map-scale">0 ━━━ 2 km*</span>
      </div>
      <div className="map-legend">
        <span>
          <i className="dot normal" />
          Normal / open
        </span>
        <span>
          <i className="dot watch" />
          Watch / caution
        </span>
        <span>
          <i className="dot warning" />
          Warning / partial
        </span>
        <span>
          <i className="dot emergency" />
          Emergency / blocked
        </span>
        <span>
          <i className="dot unknown" />
          Unknown
        </span>
      </div>
    </div>
  );
}
