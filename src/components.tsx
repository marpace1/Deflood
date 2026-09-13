import { useState } from "react";
import {
  Waves,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Plus,
  ShieldCheck,
  Check,
  Info,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { locations, actions, type Risk, type Report } from "./data";
export const riskLabel: Record<Risk, string> = {
  Normal: "Low risk",
  Watch: "Yellow alert",
  Warning: "Orange warning",
  Emergency: "Red emergency",
};
export function RiskBadge({ risk }: { risk: Risk }) {
  return (
    <span className={`badge ${risk.toLowerCase()}`}>
      <span className="dot" />
      {riskLabel[risk]}
    </span>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  action,
  onClick,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {action && (
        <button className="text-button" onClick={onClick}>
          {action}
          <ArrowUpRight size={16} />
        </button>
      )}
    </div>
  );
}
export function ReportList({ reports }: { reports: Report[] }) {
  return (
    <div className="report-list">
      {reports.length ? (
        reports.map((r) => (
          <article key={r.id} className="report-row">
            <div
              className={`report-icon ${r.severity === "High" ? "warn" : ""}`}
            >
              {r.type === "Rising water" ? (
                <Waves size={18} />
              ) : (
                <MapPin size={18} />
              )}
            </div>
            <div>
              <div className="report-title">
                <h3>
                  {r.type === "Other" ? "Waterlogging near school" : r.type}
                </h3>
                <span>Unverified</span>
              </div>
              <p>{r.description}</p>
              <small>
                {locations.find((l) => l.id === r.location)?.name} · {r.time} ·
                Community report
              </small>
              {r.photo && (
                <img
                  className="report-photo"
                  src={r.photo}
                  alt="Community-submitted incident"
                />
              )}
            </div>
          </article>
        ))
      ) : (
        <div className="empty">
          <CheckCircle2 size={24} />
          <p>
            No local reports yet. You can help keep your community informed.
          </p>
        </div>
      )}
    </div>
  );
}
export function ReportForm({
  location,
  onSubmit,
}: {
  location: string;
  onSubmit: (r: Report) => void;
}) {
  const [loc, setLoc] = useState(location),
    [type, setType] = useState("Rising water"),
    [severity, setSeverity] = useState("Low"),
    [description, setDescription] = useState(""),
    [photo, setPhoto] = useState<string>(),
    [error, setError] = useState(""),
    [done, setDone] = useState(false);
  if (done)
    return (
      <div className="confirmation">
        <CheckCircle2 size={44} />
        <h2>Your community report is added.</h2>
        <p>
          It is now visible in local reports and on the demo map. Road or bridge
          hazards also update the route planner.
        </p>
        <p className="muted">
          This report is unverified and stored for this session only. It has not
          been sent to authorities.
        </p>
        <button
          className="primary"
          onClick={() => {
            setDone(false);
            setDescription("");
            setPhoto(undefined);
          }}
        >
          Add another report <Plus size={17} />
        </button>
      </div>
    );
  return (
    <form
      className="report-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!description.trim()) {
          setError("Please briefly describe what you can see.");
          return;
        }
        onSubmit({
          id: Date.now(),
          location: loc,
          type,
          severity,
          description: description.trim(),
          photo,
          time: "Just now",
        });
        setDone(true);
      }}
    >
      <div className="info-strip">
        <Info size={19} />
        <span>
          Only report from a safe place. Never approach floodwater to take a
          photo.
        </span>
      </div>
      <div className="form-grid">
        <label>
          Location or village
          <select value={loc} onChange={(e) => setLoc(e.target.value)}>
            {locations.map((l) => (
              <option value={l.id} key={l.id}>
                {l.name}, Assam
              </option>
            ))}
          </select>
        </label>
        <label>
          What is happening?
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {[
              "Rising water",
              "Flooded road",
              "Blocked bridge",
              "Water entering homes",
              "River or stream overflow",
              "Other",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        How serious does it look?
        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option>Low</option>
          <option>Moderate</option>
          <option>High</option>
        </select>
      </label>
      <label>
        Describe what you see
        <textarea
          required
          maxLength={500}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="For example: water is covering the road near the school entrance."
        />
      </label>
      <label className="upload">
        <Upload size={22} />
        <strong>
          Add a photo <span>(optional)</span>
        </strong>
        <small>JPG, PNG or WebP · up to 5 MB</small>
        <input
          aria-label="Upload incident photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (
              f.size > 5 * 1024 * 1024 ||
              !["image/jpeg", "image/png", "image/webp"].includes(f.type)
            ) {
              setError("Choose a JPG, PNG or WebP image under 5 MB.");
              e.target.value = "";
              return;
            }
            setError("");
            const reader = new FileReader();
            reader.onload = () => setPhoto(reader.result as string);
            reader.readAsDataURL(f);
          }}
        />
        {photo && <img src={photo} alt="Your incident photo preview" />}
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="form-footer">
        <small>Demo only. No report is sent to emergency services.</small>
        <button className="primary" type="submit">
          Submit report <ArrowRight size={17} />
        </button>
      </div>
    </form>
  );
}
export function SafetyGuide({ risk }: { risk: Risk }) {
  const sections = [
    {
      label: "Be ready",
      title: "Before flooding",
      color: "normal",
      items: [
        "Keep important documents and medicines ready.",
        "Charge your phone and keep drinking water and basic supplies.",
        "Know your nearest safer, higher location. Check local updates.",
      ],
    },
    {
      label: "Yellow · Watch",
      title: "During heavy rainfall",
      color: "watch",
      items: [
        "Stay updated and avoid travel near rivers, streams and low-lying roads.",
        "Do not ignore rising water. Keep children away from fast-moving water.",
        "Prepare to move if local authorities advise it.",
      ],
    },
    {
      label: "Orange & red · Take action",
      title: "When flooding develops",
      color: "emergency",
      items: [
        "Follow official evacuation instructions. Move to safer ground when advised.",
        "Never walk or drive through moving floodwater.",
        "Stay away from damaged bridges and electrical hazards.",
        "Help children, elderly people and people with disabilities if safe.",
      ],
    },
    {
      label: "Return carefully",
      title: "After flooding",
      color: "neutral",
      items: [
        "Avoid contaminated water. Do not touch fallen electrical wires.",
        "Return only when authorities say it is safe.",
        "Report damaged roads and dangerous areas.",
      ],
    },
  ];
  return (
    <>
      <div className="info-strip">
        <ShieldCheck size={22} />
        <span>
          <strong>Local authorities’ instructions always come first.</strong>{" "}
          This guide supports awareness; it does not replace official emergency
          advice.
        </span>
      </div>
      <div className="safety-grid">
        {sections.map((s, i) => (
          <section className={`safety-section ${s.color}`} key={s.title}>
            <div className="safety-number">0{i + 1}</div>
            <span className="eyebrow">{s.label}</span>
            <h2>{s.title}</h2>
            {s.items.map((t) => (
              <p key={t}>
                <Check size={17} />
                {t}
              </p>
            ))}
          </section>
        ))}
      </div>
      <div className="info-strip">
        <Info size={20} />
        <span>
          Your selected area: <strong>{riskLabel[risk]}</strong>.{" "}
          {actions[risk]}
        </span>
      </div>
    </>
  );
}
