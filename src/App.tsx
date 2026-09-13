import {
  RiskBadge,
  SectionHeading,
  ReportList,
  ReportForm,
  SafetyGuide,
  riskLabel,
} from "./components";
import { useState, useEffect } from "react";
import {
  Waves,
  LayoutDashboard,
  Map,
  Bell,
  Plus,
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  SlidersHorizontal,
  CloudRain,
  TrendingUp,
  Users,
  Navigation,
  Check,
  Clock,
  Info,
  X,
  Menu,
  Settings,
  TriangleAlert,
  House,
  Route,
} from "lucide-react";
import {
  locations,
  shelters,
  scenarios,
  riskFor,
  actions,
  initialReports,
  type Scenario,
  type Risk,
  type Report,
} from "./data";
import { roadsFor, findRoutes } from "./routing";
import RiskMap from "./RiskMap";
const nav = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Local Risk Map", icon: Map },
  { name: "Alerts", icon: Bell },
  { name: "Report Flooding", icon: Plus },
  { name: "Safety Guide", icon: ShieldCheck },
];
export default function App() {
  const [page, setPage] = useState("Overview"),
    [location, setLocation] = useState("tapesia"),
    [conditions, setConditions] = useState<Record<string, Scenario>>({}),
    [reports, setReports] = useState<Report[]>(initialReports),
    [demo, setDemo] = useState(false),
    [menu, setMenu] = useState(false),
    [notifications, setNotifications] = useState(false),
    [prefs, setPrefs] = useState(false),
    [inApp, setInApp] = useState(true),
    [sms, setSms] = useState(false),
    [emergency, setEmergency] = useState(true),
    [language, setLanguage] = useState("English"),
    [prefArea, setPrefArea] = useState("tapesia"),
    [saved, setSaved] = useState(false),
    [alertFilter, setAlertFilter] = useState("All levels"),
    [details, setDetails] = useState<string | null>(null),
    [events, setEvents] = useState<
      { id: number; location: string; risk: Risk; message: string }[]
    >([]),
    [destination, setDestination] = useState("school"),
    [search, setSearch] = useState(""),
    [routeChoice, setRouteChoice] = useState("recommended");
  useEffect(() => {
    if (!demo && !prefs) return;
    const previous = document.activeElement as HTMLElement;
    const background = document.querySelectorAll<HTMLElement>(
      ".sidebar,.main-shell",
    );
    background.forEach((el) => (el.inert = true));
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDemo(false);
        setPrefs(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".modal button,.modal input,.modal select,.modal textarea",
        ),
      ).filter((el) => !el.hasAttribute("disabled"));
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      background.forEach((el) => (el.inert = false));
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [demo, prefs]);
  const loc = locations.find((l) => l.id === location)!;
  const scenario = conditions[location] || "Normal conditions";
  const risk = riskFor(scenario);
  const localReports = reports.filter((r) => r.location === location);
  let roads = roadsFor("Normal conditions");
  for (const [area, condition] of Object.entries(conditions)) {
    const updated = roadsFor(condition, false, area);
    roads = roads.map((edge, i) =>
      updated[i].status === "Dangerous" || edge.status === "Dangerous"
        ? { ...edge, status: "Dangerous" }
        : updated[i].status === "Caution"
          ? { ...edge, status: "Caution" }
          : edge,
    );
  }
  for (const r of reports) {
    if (
      ["Flooded road", "Blocked bridge", "River or stream overflow"].includes(
        r.type,
      )
    ) {
      const adjacent = roads
        .filter((e) => e.a === r.location || e.b === r.location)
        .sort((a, b) => a.km - b.km);
      const affected =
        r.type === "Blocked bridge"
          ? adjacent.find((e) => e.name.toLowerCase().includes("bridge")) ||
            adjacent[0]
          : adjacent[0];
      roads = roads.map((e) =>
        e.name === affected?.name ? { ...e, status: "Dangerous" } : e,
      );
    }
  }
  const paths = findRoutes(roads, location, destination);
  const safest = [...paths].sort(
    (a, b) => a.caution - b.caution || a.km - b.km,
  )[0];
  const chosen = routeChoice === "safest" ? safest : paths[0];
  const activeEvents = events.filter((e) => e.location === location);
  const rainfall =
    scenario === "Normal conditions"
      ? 2.4
      : scenario === "Red emergency"
        ? 86
        : scenario === "Orange warning"
          ? 62
          : 32.6;
  const go = (p: string) => {
    setPage(p);
    setMenu(false);
    setDetails(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const addReport = (r: Report) => {
    setReports((prev) => [r, ...prev]);
  };
  function simulate(s: Scenario) {
    setConditions((prev) => ({ ...prev, [location]: s }));
    if (s === "Normal conditions") {
      setEvents((prev) => prev.filter((e) => e.location !== location));
      return;
    }
    const nextRisk = riskFor(s);
    setEvents((prev) => [
      {
        id: Date.now(),
        location,
        risk: nextRisk,
        message:
          s === "Flooded road report"
            ? "Flooding reported on the local access road. A safer alternative may be required."
            : s === "Bridge closure"
              ? "Digaru bridge is closed in this scenario. Do not attempt to cross."
              : actions[nextRisk],
      },
      ...prev,
    ]);
    if (s === "Flooded road report" || s === "Rising water in a village") {
      addReport({
        id: Date.now(),
        location,
        type: s === "Flooded road report" ? "Flooded road" : "Rising water",
        severity: s === "Flooded road report" ? "High" : "Moderate",
        description:
          s === "Flooded road report"
            ? "Water covers the lowland access road. Do not cross."
            : "Community members report rising stream water near the village.",
        time: "Just now",
      });
    }
  }
  const selectLocation = (id: string) => {
    setLocation(id);
    setSearch("");
  };
  const titles: Record<string, [string, string]> = {
    Overview: [
      "Your local flood outlook",
      "A little awareness today. A safer community tomorrow.",
    ],
    "Local Risk Map": [
      "Every village. On the map.",
      "Explore local conditions, community reports and roads near you.",
    ],
    Alerts: [
      "Local alerts",
      "Clear warnings. Practical next steps. All in one place.",
    ],
    "Report Flooding": [
      "Your report can make a difference",
      "Help your neighbours understand what is happening nearby.",
    ],
    "Safety Guide": [
      "Know what to do. Stay prepared.",
      "Simple steps for you, your family and your community.",
    ],
    "Evacuate Safely": [
      "Find a safer way forward",
      "Compare available demo routes to higher ground and nearby shelters.",
    ],
  };
  return (
    <div className="app-shell">
      <aside className={`sidebar ${menu ? "is-open" : ""}`}>
        <a
          className="brand"
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            go("Overview");
          }}
        >
          <span className="brand-icon">
            <Waves size={27} strokeWidth={2.4} />
          </span>
          deflood<span className="brand-dot">.</span>
        </a>
        <div className="sidebar-caption">LOCAL AWARENESS. EARLY ACTION.</div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {nav.map((n) => (
            <button
              key={n.name}
              className={`nav-item ${page === n.name ? "active" : ""}`}
              onClick={() => go(n.name)}
            >
              <n.icon size={19} />
              {n.name}
              {n.name === "Alerts" && activeEvents.length > 0 && (
                <span className="nav-count">{activeEvents.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <button
          className={`nav-item evacuation-nav ${page === "Evacuate Safely" ? "active" : ""}`}
          onClick={() => go("Evacuate Safely")}
        >
          <Navigation size={19} />
          Evacuate Safely
          <ArrowUpRight size={15} />
        </button>
        <div className="sidebar-bottom">
          <div className="community-note">
            <div className="community-symbol">
              <Users size={21} />
              <span>Built for every community</span>
            </div>
            <p>
              From city streets to village roads.
              <br />
              No place left unseen.
            </p>
          </div>
          <button className="demo-button" onClick={() => setDemo(true)}>
            <SlidersHorizontal size={17} />
            Demo controls<span>PROTOTYPE</span>
          </button>
          <div className="sidebar-footer">
            <span className="tiny-dot" />
            All information is demo data
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu icon-button"
              aria-label="Toggle navigation"
              onClick={() => setMenu(!menu)}
            >
              <Menu size={22} />
            </button>
            <span className="breadcrumb">
              Workspace <span>/</span> <strong>{page}</strong>
            </span>
          </div>
          <div className="header-actions">
            <span className="demo-tag">
              <span />
              DEMO MODE
            </span>
            <button
              className="icon-button notification-button"
              aria-label="Open notifications"
              onClick={() => setNotifications(!notifications)}
            >
              <Bell size={19} />
              {activeEvents.length > 0 && <i />}
            </button>
            <button
              className="avatar"
              aria-label="Notification preferences"
              onClick={() => setPrefs(true)}
            >
              JS
            </button>
          </div>
        </header>
        {notifications && (
          <div className="notification-panel">
            <SectionHeading title="Notifications" />
            <button
              className="close-button"
              aria-label="Close notifications"
              onClick={() => setNotifications(false)}
            >
              <X size={19} />
            </button>
            {inApp ? (
              activeEvents.length ? (
                activeEvents.slice(0, 4).map((e) => (
                  <button
                    className="notification-item"
                    key={e.id}
                    onClick={() => {
                      setNotifications(false);
                      go("Alerts");
                    }}
                  >
                    <RiskBadge risk={e.risk} />
                    <strong>{loc.name}, Assam</strong>
                    <p>{e.message}</p>
                  </button>
                ))
              ) : (
                <p>No active local notifications. You’re up to date.</p>
              )
            ) : (
              <p>
                In-app notifications are disabled. Alerts remain available on
                the Alerts page.
              </p>
            )}
            <button
              className="text-button"
              onClick={() => {
                setPrefs(true);
                setNotifications(false);
              }}
            >
              <Settings size={15} />
              Notification preferences
            </button>
          </div>
        )}
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow heading-eyebrow">
                <span className="small-line" />
                {page === "Overview"
                  ? "COMMUNITY FLOOD AWARENESS"
                  : "DEFLOOD / " + page.toUpperCase()}
              </div>
              <h1>{titles[page][0]}</h1>
              <p>{titles[page][1]}</p>
            </div>
            <button className="outline compact" onClick={() => setDemo(true)}>
              <SlidersHorizontal size={15} />
              Demo controls
            </button>
          </div>
          <div className="location-bar">
            <div className="location-control">
              <MapPin size={20} />
              <div>
                <span className="micro-label">YOUR AREA</span>
                <select
                  aria-label="Select your area"
                  value={location}
                  onChange={(e) => selectLocation(e.target.value)}
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}, Assam
                    </option>
                  ))}
                </select>
              </div>
              <span className="location-kind">{loc.kind}</span>
            </div>
            <span className="last-updated">
              <Clock size={14} />
              Demo snapshot ·{" "}
              {scenario === "Normal conditions" ? "10:42 AM" : "just updated"}
              <span className="snapshot-dot" />
            </span>
          </div>
          {risk !== "Normal" && (
            <section
              className={`alert-banner ${risk.toLowerCase()}`}
              role="alert"
            >
              <TriangleAlert size={23} />
              <div>
                <strong>
                  {riskLabel[risk]} for {loc.name}, Assam
                </strong>
                <p>{actions[risk]}</p>
              </div>
              <div className="banner-actions">
                <button
                  className="dark-button"
                  onClick={() => go("Evacuate Safely")}
                >
                  Find Safe Route <Navigation size={16} />
                </button>
                <button
                  className="text-button"
                  onClick={() => go("Safety Guide")}
                >
                  View safety instructions <ArrowRight size={15} />
                </button>
              </div>
            </section>
          )}
          {page === "Overview" && (
            <>
              <section className={`risk-status ${risk.toLowerCase()}`}>
                <div className="risk-copy">
                  <RiskBadge risk={risk} />
                  <h2>
                    {risk === "Normal" ? (
                      <>
                        A calmer outlook.
                        <br />A community prepared.
                      </>
                    ) : risk === "Emergency" ? (
                      <>
                        Take action.
                        <br />
                        Follow official instructions.
                      </>
                    ) : (
                      <>
                        Stay aware.
                        <br />
                        Be ready to act.
                      </>
                    )}
                  </h2>
                  <p>
                    {risk === "Normal"
                      ? `No active flood warning in ${loc.name}. Conditions in this demo area are currently stable.`
                      : actions[risk]}
                  </p>
                  <button
                    className="dark-button"
                    onClick={() => go("Local Risk Map")}
                  >
                    Explore local risk map <ArrowUpRight size={17} />
                  </button>
                </div>
                <div className="status-illustration" aria-hidden="true">
                  <div className="radar-ring outer" />
                  <div className="radar-ring middle" />
                  <div className="radar-ring inner" />
                  <div className="radar-cross horizontal" />
                  <div className="radar-cross vertical" />
                  <div className="radar-center">
                    <ShieldCheck size={47} strokeWidth={1.5} />
                  </div>
                  <div className="radar-tag">
                    <span className="dot" />
                    {risk === "Normal" ? "Conditions stable" : "Stay alert"}
                  </div>
                  <span className="radar-coordinate">
                    26.10° N &nbsp; 91.94° E · DEMO
                  </span>
                </div>
                <div className="risk-side-note">
                  <span>LOCAL OUTLOOK</span>
                  <strong>
                    {risk === "Normal"
                      ? "Stay informed,\nnot alarmed."
                      : "Early action\nstarts here."}
                  </strong>
                  <p>
                    {risk === "Normal"
                      ? "We’re keeping an eye on the things that matter to your area."
                      : "Check local instructions before making travel decisions."}
                  </p>
                  <span className="fictional-note">
                    Illustrative conditions only
                  </span>
                </div>
              </section>
              <section className="metrics" aria-label="Local conditions">
                {[
                  {
                    icon: CloudRain,
                    label: "Rainfall · last hour",
                    value: rainfall.toFixed(1),
                    unit: "mm",
                    note:
                      risk === "Normal"
                        ? "Light rainfall"
                        : "Heavy rainfall scenario",
                    trend:
                      risk === "Normal"
                        ? "Within demo range"
                        : "Simulated increase",
                  },
                  {
                    icon: Waves,
                    label: "Stream level",
                    value:
                      risk === "Normal"
                        ? "1.2"
                        : risk === "Emergency"
                          ? "4.8"
                          : "2.6",
                    unit: "m",
                    note: "Digaru stream · demo",
                    trend: risk === "Normal" ? "Stable" : "Rising",
                  },
                  {
                    icon: TrendingUp,
                    label: "Rain forecast · next 6h",
                    value: risk === "Normal" ? "12" : "78",
                    unit: "mm",
                    note: "Illustrative forecast",
                    trend:
                      risk === "Normal"
                        ? "Light rain expected"
                        : "Heavy rain expected",
                  },
                  {
                    icon: Users,
                    label: "Local community reports",
                    value: String(localReports.length).padStart(2, "0"),
                    unit: "",
                    note: "Reports from your area",
                    trend: "Community-powered",
                  },
                ].map((m, i) => (
                  <div className="metric" key={m.label}>
                    <div className="metric-label">
                      <m.icon size={17} />
                      {m.label}
                    </div>
                    <div className="metric-value">
                      {m.value}
                      <span>{m.unit}</span>
                    </div>
                    <p>{m.note}</p>
                    <small
                      className={i < 2 && risk === "Normal" ? "positive" : ""}
                    >
                      {i < 2 ? (
                        <span className="tiny-dot" />
                      ) : (
                        <span className="metric-dash">—</span>
                      )}
                      {m.trend}
                    </small>
                  </div>
                ))}
              </section>
              <div className="overview-grid">
                <section className="map-section">
                  <SectionHeading
                    title="A closer look at your area"
                    eyebrow="LOCAL RISK MAP"
                    action="Open map"
                    onClick={() => go("Local Risk Map")}
                  />
                  <RiskMap
                    selected={location}
                    onSelect={selectLocation}
                    roads={roads}
                    risk={risk}
                    reports={reports}
                    areaRisks={Object.fromEntries(
                      Object.entries(conditions).map(([id, s]) => [
                        id,
                        riskFor(s),
                      ]),
                    )}
                  />
                  <div className="map-caption">
                    <Info size={13} />
                    Illustrative geography and demo conditions. Not a navigation
                    map.
                  </div>
                </section>
                <section className="alerts-preview">
                  <SectionHeading
                    title="Local updates"
                    eyebrow="STAY INFORMED"
                    action="View all"
                    onClick={() => go("Alerts")}
                  />
                  {risk === "Normal" ? (
                    <div className="all-clear">
                      <span className="check-icon">
                        <Check size={20} />
                      </span>
                      <div>
                        <h3>No active warnings</h3>
                        <p>
                          Things look stable in {loc.name}.<br />
                          We’ll show demo alerts here when conditions change.
                        </p>
                        <small>
                          <span className="tiny-dot" />
                          Normal conditions
                        </small>
                      </div>
                    </div>
                  ) : (
                    <div className={`preview-alert ${risk.toLowerCase()}`}>
                      <RiskBadge risk={risk} />
                      <h3>{loc.name}: conditions are changing</h3>
                      <p>{actions[risk]}</p>
                      <button
                        className="text-button"
                        onClick={() => go("Alerts")}
                      >
                        View alert details <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                  <div className="preparedness">
                    <div className="preparedness-icon">
                      <ShieldCheck size={21} />
                    </div>
                    <p className="eyebrow">A SMALL STEP. A BIG DIFFERENCE.</p>
                    <h3>
                      Being ready starts
                      <br />
                      before the rain.
                    </h3>
                    <p>
                      Know what to pack, where to go,
                      <br />
                      and how to keep your family safe.
                    </p>
                    <button
                      className="text-button"
                      onClick={() => go("Safety Guide")}
                    >
                      Read the safety guide <ArrowUpRight size={17} />
                    </button>
                  </div>
                </section>
              </div>
              <div className="community-grid">
                <section>
                  <SectionHeading
                    eyebrow="ON THE GROUND"
                    title="From your community"
                    action="Report an incident"
                    onClick={() => go("Report Flooding")}
                  />
                  <ReportList reports={localReports.slice(0, 3)} />
                </section>
                <section className="evacuation-promo">
                  <Navigation size={25} />
                  <p className="eyebrow">PLAN AHEAD</p>
                  <h2>
                    A safer route.
                    <br />
                    When it matters most.
                  </h2>
                  <p>
                    Explore nearby demo shelters and routes that avoid reported
                    flood hazards.
                  </p>
                  <button
                    className="primary"
                    onClick={() => go("Evacuate Safely")}
                  >
                    Evacuate Safely <ArrowUpRight size={17} />
                  </button>
                  <small>Prototype routes. Always verify locally.</small>
                </section>
              </div>
            </>
          )}
          {page === "Local Risk Map" && (
            <>
              <div className="map-page-toolbar">
                <label className="search-field">
                  <MapPin size={18} />
                  <input
                    aria-label="Search locations"
                    placeholder="Search a village, town or city…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <button
                  className="primary"
                  onClick={() => go("Evacuate Safely")}
                >
                  <Navigation size={17} />
                  Evacuate Safely
                </button>
              </div>
              {search && (
                <div className="search-results">
                  {locations
                    .filter((l) =>
                      l.name.toLowerCase().includes(search.toLowerCase()),
                    )
                    .map((l) => (
                      <button onClick={() => selectLocation(l.id)} key={l.id}>
                        {l.name}
                        <span>
                          {l.kind} · {l.region}
                        </span>
                      </button>
                    ))}
                  {!locations.some((l) =>
                    l.name.toLowerCase().includes(search.toLowerCase()),
                  ) && (
                    <p>
                      No demo location found. Try Tapesia, Baren or Sonapur.
                    </p>
                  )}
                </div>
              )}
              <RiskMap
                selected={location}
                onSelect={selectLocation}
                roads={roads}
                risk={risk}
                reports={reports}
                areaRisks={Object.fromEntries(
                  Object.entries(conditions).map(([id, s]) => [id, riskFor(s)]),
                )}
              />
              <div className="map-detail-grid">
                <section>
                  <SectionHeading
                    title={`${loc.name}, Assam`}
                    eyebrow={loc.kind}
                  />
                  <RiskBadge risk={risk} />
                  <p>{actions[risk]}</p>
                  <p>
                    {rainfall} mm demo rainfall ·{" "}
                    {risk === "Normal" ? "1.2" : "2.6"} m demo stream level
                  </p>
                  <h3>Roads near your area</h3>
                  {roads
                    .filter((e) => e.a === location || e.b === location)
                    .map((e) => (
                      <div className="road-row" key={e.name}>
                        <span>{e.name}</span>
                        <strong>{e.status}</strong>
                      </div>
                    ))}
                </section>
                <section>
                  <SectionHeading title="Nearby community reports" />
                  <ReportList reports={localReports} />
                  <button
                    className="text-button"
                    onClick={() => go("Report Flooding")}
                  >
                    Add a report <Plus size={16} />
                  </button>
                </section>
              </div>
            </>
          )}
          {page === "Alerts" && (
            <>
              <div className="section-heading">
                <h2>Warnings for {loc.name}</h2>
                <div className="inline-actions">
                  <select
                    aria-label="Filter alerts by severity"
                    value={alertFilter}
                    onChange={(e) => setAlertFilter(e.target.value)}
                  >
                    {["All levels", "Watch", "Warning", "Emergency"].map(
                      (a) => (
                        <option key={a}>{a}</option>
                      ),
                    )}
                  </select>
                  <button className="outline" onClick={() => setPrefs(true)}>
                    <Settings size={16} />
                    Preferences
                  </button>
                </div>
              </div>
              <div className="alerts-list">
                {activeEvents
                  .filter(
                    (e) =>
                      alertFilter === "All levels" || e.risk === alertFilter,
                  )
                  .map((e, i) => (
                    <article
                      key={e.id}
                      className={`alert-card ${e.risk.toLowerCase()}`}
                    >
                      <RiskBadge risk={e.risk} />
                      <small>
                        {i === 0 ? "Latest simulation" : "Earlier simulation"} ·
                        Session only
                      </small>
                      <h2>
                        {riskLabel[e.risk]} — {loc.name}, Assam
                      </h2>
                      <p>{e.message}</p>
                      <div className="inline-actions">
                        <button
                          className="dark-button"
                          onClick={() => go("Evacuate Safely")}
                        >
                          Find Safe Route <Navigation size={16} />
                        </button>
                        <button
                          className="outline"
                          onClick={() => setDetails(String(e.id))}
                        >
                          View details <ArrowRight size={16} />
                        </button>
                      </div>
                      {details === String(e.id) && (
                        <div className="alert-expanded">
                          <h3>What should you do?</h3>
                          <p>{actions[e.risk]}</p>
                          <p>
                            This is a simulated communication category, not an
                            official warning threshold. Check local authority
                            announcements for verified instructions.
                          </p>
                          <button
                            className="text-button"
                            onClick={() => go("Safety Guide")}
                          >
                            View safety instructions <ArrowUpRight size={16} />
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                {!activeEvents.some(
                  (e) => alertFilter === "All levels" || e.risk === alertFilter,
                ) && (
                  <div className="empty large">
                    <ShieldCheck size={36} />
                    <h2>
                      {risk === "Normal"
                        ? "No active warnings. Stay prepared."
                        : "No alerts match this filter."}
                    </h2>
                    <p>Use Demo Controls to see how a local warning appears.</p>
                    <button className="outline" onClick={() => setDemo(true)}>
                      Explore a demo scenario <SlidersHorizontal size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="severity-key">
                {(["Normal", "Watch", "Warning", "Emergency"] as Risk[]).map(
                  (r) => (
                    <div key={r}>
                      <RiskBadge risk={r} />
                      <p>{actions[r]}</p>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
          {page === "Report Flooding" && (
            <div className="form-layout">
              <ReportForm
                key={location}
                location={location}
                onSubmit={addReport}
              />
              <aside className="form-aside">
                <Users size={30} />
                <h2>
                  Local knowledge.
                  <br />
                  Collective safety.
                </h2>
                <p>
                  You know your village best. A small update can help others
                  avoid a dangerous road or notice rising water.
                </p>
                <hr />
                <h3>What happens to your report?</h3>
                <p>1. Added to local demo reports.</p>
                <p>2. Shown on the prototype map.</p>
                <p>3. Road hazards inform demo routing.</p>
                <small>
                  Not monitored by emergency services. For immediate danger,
                  contact local authorities or rescue teams.
                </small>
              </aside>
            </div>
          )}
          {page === "Safety Guide" && <SafetyGuide risk={risk} />}
          {page === "Evacuate Safely" && (
            <>
              <div className="route-disclaimer">
                <TriangleAlert size={22} />
                <div>
                  <strong>
                    Prototype data — verify conditions with local authorities
                    before evacuating.
                  </strong>
                  <p>
                    Routes and shelters are fictional. No route is guaranteed
                    safe. Follow official announcements and rescue teams. Never
                    cross moving water, flooded bridges or blocked roads.
                  </p>
                </div>
              </div>
              <div className="route-selectors">
                <label>
                  Starting location
                  <select
                    value={location}
                    onChange={(e) => selectLocation(e.target.value)}
                  >
                    {locations.map((l) => (
                      <option value={l.id} key={l.id}>
                        {l.name} · {l.kind}
                      </option>
                    ))}
                  </select>
                </label>
                <ArrowRight size={20} />
                <label>
                  Destination
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  >
                    {shelters.map((s) => (
                      <option value={s.id} key={s.id}>
                        {s.name} · {s.type}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="route-layout">
                <RiskMap
                  selected={location}
                  onSelect={selectLocation}
                  roads={roads}
                  risk={risk}
                  reports={reports}
                  areaRisks={Object.fromEntries(
                    Object.entries(conditions).map(([id, s]) => [
                      id,
                      riskFor(s),
                    ]),
                  )}
                  route={chosen?.nodes}
                />
                <aside className="route-summary">
                  <p className="eyebrow">EVACUATION ROUTE PLANNER</p>
                  {chosen ? (
                    <>
                      <div className="route-tabs">
                        {["recommended", "shortest", "safest"].map((t) => (
                          <button
                            aria-pressed={routeChoice === t}
                            className={routeChoice === t ? "selected" : ""}
                            key={t}
                            onClick={() => setRouteChoice(t)}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <span
                        className={`badge ${chosen.caution ? "watch" : "normal"}`}
                      >
                        <Route size={14} />
                        {chosen.caution ? "Caution advised" : "Safe in demo"}
                      </span>
                      <h2>
                        {chosen.km.toFixed(1)} <span>km</span>
                        <span className="route-time">
                          ~{Math.ceil((chosen.km / 3) * 60)} min on foot
                        </span>
                      </h2>
                      <p>
                        {routeChoice === "safest"
                          ? "Fewest caution segments, then shortest distance."
                          : "Shortest available route after excluding dangerous, partially blocked and unknown roads."}
                      </p>
                      <small>
                        Difficulty:{" "}
                        {chosen.caution
                          ? "Caution — increasing water nearby"
                          : "Moderate — elevated terrain"}
                        . Time assumes 3 km/h and is illustrative, not a travel
                        guarantee.
                      </small>
                      <div className="route-steps">
                        {chosen.nodes.map((id, i) => (
                          <div key={id}>
                            <span>
                              {i === chosen.nodes.length - 1 ? (
                                <House size={14} />
                              ) : (
                                i + 1
                              )}
                            </span>
                            <div>
                              <strong>
                                {
                                  [...locations, ...shelters].find(
                                    (n) => n.id === id,
                                  )?.name
                                }
                              </strong>
                              {i < chosen.nodes.length - 1 && (
                                <small>
                                  {
                                    roads.find(
                                      (e) =>
                                        (e.a === id &&
                                          e.b === chosen.nodes[i + 1]) ||
                                        (e.b === id &&
                                          e.a === chosen.nodes[i + 1]),
                                    )?.name
                                  }
                                </small>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {paths.length > 1 && (
                        <small>
                          {paths.length} eligible alternatives found. Safest
                          option: {safest.km.toFixed(1)} km.
                        </small>
                      )}
                    </>
                  ) : (
                    <div className="no-route">
                      <TriangleAlert size={32} />
                      <h2>No available safe demo route</h2>
                      <p>
                        All connections from this area are blocked or unsafe. Do
                        not attempt to cross. Follow rescue teams and local
                        emergency instructions.
                      </p>
                    </div>
                  )}
                  <button
                    className="outline"
                    onClick={() => go("Safety Guide")}
                  >
                    Emergency safety instructions <ArrowUpRight size={16} />
                  </button>
                </aside>
              </div>
              <section className="road-conditions">
                <SectionHeading
                  title="Road & bridge conditions"
                  eyebrow="WHY ROUTES CHANGE"
                />
                {roads
                  .filter((e) => e.status !== "Open")
                  .map((e) => (
                    <div className="road-row" key={e.name}>
                      <div>
                        <strong>{e.name}</strong>
                        <p>
                          {e.status === "Dangerous"
                            ? "Excluded from all routes: flooding or blockage reported."
                            : "Water may be increasing. Caution included only in eligible routes."}{" "}
                          Demo community report · just updated.
                        </p>
                      </div>
                      <span
                        className={`badge ${e.status === "Dangerous" ? "emergency" : "watch"}`}
                      >
                        {e.status}
                      </span>
                    </div>
                  ))}
              </section>
            </>
          )}
          <footer className="main-footer">
            <span>
              <Waves size={17} />
              Local awareness. Early action.
            </span>
            <p>
              Hackathon prototype · Fictional data, not an official warning
              service.
            </p>
            <span>
              Made for every community <span className="footer-dot">●</span>
            </span>
          </footer>
        </main>
      </div>
      {demo && (
        <div className="modal-backdrop" onClick={() => setDemo(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Demo controls"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setDemo(false);
            }}
          >
            <button
              autoFocus
              className="close-button"
              aria-label="Close demo controls"
              onClick={() => setDemo(false)}
            >
              <X size={20} />
            </button>
            <p className="eyebrow">PRESENTATION MODE</p>
            <h2>See local awareness in action.</h2>
            <p>
              Change conditions for <strong>{loc.name}</strong>. All values,
              warnings and routes are simulated.
            </p>
            <div className="scenario-list">
              {scenarios.map((s, i) => (
                <button
                  key={s}
                  className={scenario === s ? "selected" : ""}
                  onClick={() => {
                    simulate(s);
                    setDemo(false);
                  }}
                >
                  <span
                    className={`scenario-number ${riskFor(s).toLowerCase()}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{s}</span>
                  {scenario === s ? (
                    <Check size={18} />
                  ) : (
                    <ArrowRight size={17} />
                  )}
                </button>
              ))}
            </div>
            <button
              className="outline full"
              onClick={() => {
                setConditions({});
                setEvents([]);
                setReports(initialReports);
                setDemo(false);
              }}
            >
              Reset all demo conditions and reports
            </button>
            <small>
              Severe flooding isolates Tapesia. A blocked lowland road triggers
              an alternative via the ridge road.
            </small>
          </section>
        </div>
      )}
      {prefs && (
        <div className="modal-backdrop" onClick={() => setPrefs(false)}>
          <section
            className="modal preferences"
            role="dialog"
            aria-modal="true"
            aria-label="Notification preferences"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setPrefs(false);
            }}
          >
            <button
              autoFocus
              className="close-button"
              aria-label="Close preferences"
              onClick={() => setPrefs(false)}
            >
              <X size={20} />
            </button>
            <p className="eyebrow">STAY CONNECTED</p>
            <h2>Notification preferences</h2>
            <p>
              Preferences are saved for this browser session. No real
              notifications or SMS are sent.
            </p>
            <label className="switch-row">
              <span>
                <strong>In-app alerts</strong>
                <small>Show simulations in the notification inbox</small>
              </span>
              <input
                type="checkbox"
                checked={inApp}
                onChange={(e) => {
                  setInApp(e.target.checked);
                  setSaved(false);
                }}
              />
            </label>
            <label className="switch-row">
              <span>
                <strong>Demo SMS</strong>
                <small>SMS integration planned · no messages sent</small>
              </span>
              <input
                type="checkbox"
                checked={sms}
                onChange={(e) => {
                  setSms(e.target.checked);
                  setSaved(false);
                }}
              />
            </label>
            <label className="switch-row">
              <span>
                <strong>Emergency notifications</strong>
                <small>Demo preference only; no external delivery</small>
              </span>
              <input
                type="checkbox"
                checked={emergency}
                onChange={(e) => {
                  setEmergency(e.target.checked);
                  setSaved(false);
                }}
              />
            </label>
            <label>
              Preferred language
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setSaved(false);
                }}
              >
                {["English", "Assamese", "Hindi", "Bengali"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
              <small>
                Delivery-language preference only. Prototype interface is in
                English.
              </small>
            </label>
            <label>
              Selected village or area
              <select
                value={prefArea}
                onChange={(e) => {
                  setPrefArea(e.target.value);
                  setSaved(false);
                }}
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}, Assam
                  </option>
                ))}
              </select>
            </label>
            <button className="primary full" onClick={() => setSaved(true)}>
              {saved ? (
                <>
                  <Check size={17} />
                  Preferences saved for this session
                </>
              ) : (
                <>
                  Save preferences <ArrowRight size={17} />
                </>
              )}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
