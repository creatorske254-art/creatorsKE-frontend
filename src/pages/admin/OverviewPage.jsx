import { useState, useEffect } from "react";
import { usePageMeta } from '@/lib/usePageMeta';

// Pulls in the Tabler Icons webfont for every <i className="ti ti-*"> below.
function useTablerIcons() {
  useEffect(() => {
    if (document.getElementById("tabler-icons-cdn")) return;
    const link = document.createElement("link");
    link.id = "tabler-icons-cdn";
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css";
    document.head.appendChild(link);
  }, []);
}

// Design tokens (mirrors dashboards.html CSS vars)
const C = {
  white: "#FFFFFF",
  pageBg: "#F2F1F8",
  black: "#0D0D0D",
  purple50: "#F0EEFF",
  purple100: "#DDD9FD",
  purple200: "#BAB3FA",
  purple300: "#9187F7",
  purple400: "#6B5FF4",
  purple500: "#5445E8",
  purple600: "#3D2FD6",
  purple700: "#2C1FB8",
  grey50: "#F5F5F5",
  grey100: "#EBEBEB",
  grey200: "#D6D6D6",
  grey300: "#B8B8B8",
  grey400: "#919191",
  grey500: "#6E6E6E",
  grey600: "#4A4A4A",
  grey700: "#333333",
  successBg: "#E6F9F1",
  successText: "#006B3D",
  success: "#00B96B",
  warningBg: "#FEF6E7",
  warningText: "#7A4A00",
  warning: "#F5A623",
  errorBg: "#FFF0F0",
  errorText: "#8B0000",
  error: "#FF4B4B",
  infoBg: "#EEF5FF",
  infoText: "#1A3F80",
  info: "#4393F5",
};

const display = "'Gill Sans MT','Gill Sans',Calibri,sans-serif";
const body = "'Inter',sans-serif";

// Seed data
const HEALTH_METRICS = [
  { label: "Active creators", value: "1,284", delta: "+34 this week", up: true },
  { label: "Registered brands", value: "392", delta: "+12 this week", up: true },
  { label: "Live rate cards", value: "947", delta: "+21 this week", up: true },
  { label: "Enquiries (7 days)", value: "218", delta: "−4 vs prior week", up: false },
  { label: "Bookings in progress", value: "63", delta: "+8 this week", up: true },
  { label: "Completed (month)", value: "141", delta: "+29 vs last month", up: true },
  { label: "Transaction volume", value: "KES 2.4M", delta: "+18% vs last month", up: true },
  { label: "Platform fees collected", value: "KES 240K", delta: "+18% vs last month", up: true },
];

const OPEN_DISPUTES = [
  { id: "D-091", creator: "Mwangi Osei", brand: "Nala Foods", package: "IG Story Series", raised: "2 days ago", status: "evidence_open" },
  { id: "D-088", creator: "Amara Muriithi", brand: "Kasha", package: "Full Campaign Bundle", raised: "4 days ago", status: "under_review" },
  { id: "D-085", creator: "Zara Kipchoge", brand: "Equity Bank", package: "YouTube Integration", raised: "5 days ago", status: "under_review" },
];

const FLAGGED_ACCOUNTS = [
  { name: "FastGrow Agency", type: "brand", reason: "Free email domain (gmail.com)", flagged: "1 day ago", initials: "FA", color: C.error },
  { name: "BrandBoost Ltd", type: "brand", reason: "Duplicate company name detected", flagged: "3 days ago", initials: "BB", color: C.warning },
];

const ABANDONED_DRAFTS = [48, 34, 29, 51, 38, 44, 57, 42, 36, 61, 53, 40, 29, 35];
const DRAFT_LABELS = ["Jun 15", "", "", "", "", "", "", "", "", "", "", "", "", "Jun 28"];
const ENQUIRY_BARS = [31, 44, 38, 52, 48, 37, 61, 55, 42, 58, 63, 47, 51, 44];

const ESCROW_QUEUE = [
  { id: "B-204", creator: "Lena Wachira", brand: "Jumia Kenya", amount: "KES 18,500", overdue: "2 days", initials: "LW" },
  { id: "B-198", creator: "Kofi Mensah", brand: "Zuri Skincare", amount: "KES 32,000", overdue: "5 days", initials: "KM" },
];

const RECENT_REVIEWS = [
  { id: "R-41", reviewer: "Nala Foods", creator: "Mwangi Osei", stars: 2, flagged: true, reason: "Contains personal insult", excerpt: "Absolutely useless, this person is a complete…" },
  { id: "R-39", reviewer: "Kasha", creator: "Amara Muriithi", stars: 5, flagged: false, reason: null, excerpt: "Delivered ahead of schedule, high quality content…" },
];

// Tiny helpers
function Stars({ n }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={12} height={12} viewBox="0 0 16 16" fill={i <= n ? C.warning : C.grey200}>
          <path d="M8 1l1.9 3.8 4.2.6-3 2.9.7 4.2L8 10.4l-3.8 2 .7-4.2-3-2.9 4.2-.6z"/>
        </svg>
      ))}
    </span>
  );
}

function Tag({ children, color = C.grey600, bg = C.grey50, border = C.grey200 }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase",
      padding: "3px 8px", borderRadius: 99,
      background: bg, color, border: `0.5px solid ${border}`,
    }}>{children}</span>
  );
}

function SectionHead({ title, action, actionLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <h2 style={{ fontFamily: display, fontSize: 15, fontWeight: 600, color: C.black }}>{title}</h2>
      {action && (
        <button onClick={action} style={{ fontSize: 12, fontWeight: 500, color: C.grey500, background: "none", border: `0.5px solid ${C.grey200}`, borderRadius: 7, padding: "5px 12px", cursor: "pointer" }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: C.white, border: `0.5px solid ${C.grey100}`, borderRadius: 12, ...style }}>
      {children}
    </div>
  );
}

// Mini bar chart
function MiniBarChart({ data, labels, accentIndex, color = C.purple300, activeColor = C.purple500, height = 64 }) {
  const [hovered, setHovered] = useState(null);
  const max = Math.max(...data);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height }}>
        {data.map((v, i) => {
          const pct = Math.round((v / max) * 100);
          const isActive = i === (accentIndex ?? data.length - 1);
          const isHov = hovered === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", cursor: "default", position: "relative" }}
            >
              {isHov && (
                <div style={{ position: "absolute", bottom: "calc(100% + 4px)", left: "50%", transform: "translateX(-50%)", background: C.black, color: "white", fontSize: 10, padding: "3px 6px", borderRadius: 4, whiteSpace: "nowrap", zIndex: 10 }}>
                  {v}
                </div>
              )}
              <div style={{ width: "100%", height: `${pct}%`, borderRadius: "2px 2px 0 0", background: isHov ? activeColor : isActive ? activeColor : color, transition: "background 0.12s" }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        {labels.map((l, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 9, color: C.grey300 }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

// Alert banner
function Alert({ type = "warning", icon, children }) {
  const styles = {
    warning: { bg: C.warningBg, text: C.warningText, border: "rgba(245,166,35,0.25)" },
    info: { bg: C.infoBg, text: C.infoText, border: "rgba(67,147,245,0.2)" },
    error: { bg: C.errorBg, text: C.errorText, border: "rgba(255,75,75,0.2)" },
  }[type];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 10, background: styles.bg, border: `0.5px solid ${styles.border}`, color: styles.text, fontSize: 12.5, lineHeight: 1.55, marginBottom: 12 }}>
      <span style={{ fontSize: 15, marginTop: 1 }}><i className={`ti ${icon}`} /></span>
      <span>{children}</span>
    </div>
  );
}

// Initials avatar
function Initials({ letters, color = C.purple500, size = 34 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 9, background: color + "18", border: `1.5px solid ${color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: display, fontWeight: 700, fontSize: size * 0.38, color, flexShrink: 0 }}>
      {letters}
    </div>
  );
}

// Status pill
function StatusPill({ status }) {
  const map = {
    evidence_open: { label: "Evidence open", bg: C.errorBg, color: C.errorText, border: "rgba(255,75,75,0.2)" },
    under_review:  { label: "Under review",  bg: C.warningBg, color: C.warningText, border: "rgba(245,166,35,0.2)" },
    resolved:      { label: "Resolved",      bg: C.successBg, color: C.successText, border: "rgba(0,185,107,0.2)" },
  };
  const s = map[status] ?? map.under_review;
  return <Tag color={s.color} bg={s.bg} border={s.border}>{s.label}</Tag>;
}

// Page
export default function OverviewPage() {
  usePageMeta('Admin Overview', 'Platform health, open items, and activity across all Creatorske users.');
  useTablerIcons();
  const [period, setPeriod] = useState("7d");

  return (
    <div style={{ padding: 28, background: C.pageBg, minHeight: "100vh", fontFamily: body }}>

      {/* Page heading */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: display, fontSize: 22, fontWeight: 600, color: C.black, letterSpacing: "-0.01em", marginBottom: 4 }}>
          Platform Overview
        </h1>
        <p style={{ fontSize: 13, color: C.grey500, lineHeight: 1.6 }}>
          Platform health, open items requiring attention, and activity across all users.
        </p>
      </div>

      {/* Attention alerts */}
      <Alert type="error" icon="ti-flag-3">
        <strong>3 open disputes</strong>, 2 are currently under admin review. One has the evidence window open (closes in ~22 hours).
      </Alert>
      <Alert type="warning" icon="ti-alert-triangle">
        <strong>2 flagged brand accounts</strong> pending verification review. Access to enquiry sending is suspended until resolved.
      </Alert>

      {/* Health metric grid */}
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 14, marginBottom: 28 }}>
        {HEALTH_METRICS.map((m) => (
          <Card key={m.label}>
            <div style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: C.grey400, marginBottom: 8 }}>{m.label}</div>
              <div style={{ fontFamily: display, fontSize: 28, fontWeight: 600, color: C.black, lineHeight: 1, marginBottom: 6 }}>{m.value}</div>
              <div style={{ fontSize: 11, color: m.up ? C.successText : C.errorText, display: "flex", alignItems: "center", gap: 4 }}>
                <span><i className={`ti ${m.up ? "ti-trending-up" : "ti-trending-down"}`} /></span> {m.delta}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20, marginBottom: 28 }}>

        {/* Abandoned drafts */}
        <Card>
          <div style={{ padding: "18px 20px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: display, fontSize: 15, fontWeight: 600, color: C.black, marginBottom: 3 }}>Abandoned onboarding drafts</div>
                <div style={{ fontSize: 12, color: C.grey400 }}>Last 14 days · re-engagement emails auto-sent at 48 h</div>
              </div>
              <div style={{ fontFamily: display, fontSize: 28, fontWeight: 600, color: C.black, lineHeight: 1 }}>
                {ABANDONED_DRAFTS[ABANDONED_DRAFTS.length - 1]}
                <span style={{ fontFamily: body, fontSize: 11, color: C.grey400, fontWeight: 400, marginLeft: 4 }}>today</span>
              </div>
            </div>
            <MiniBarChart data={ABANDONED_DRAFTS} labels={DRAFT_LABELS} height={72} color={C.grey100} activeColor={C.grey700} />
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.warningText, background: C.warningBg, border: `0.5px solid rgba(245,166,35,0.2)`, borderRadius: 8, padding: "8px 12px" }}>
              <i className="ti ti-alert-triangle" /> Open rate on re-engagement emails is 21%, below the 30% target. Consider reviewing copy.
            </div>
          </div>
        </Card>

        {/* Enquiry volume */}
        <Card>
          <div style={{ padding: "18px 20px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: display, fontSize: 15, fontWeight: 600, color: C.black, marginBottom: 3 }}>Enquiry volume</div>
                <div style={{ fontSize: 12, color: C.grey400 }}>Last 14 days · all statuses</div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {["7d", "30d", "90d"].map(p => (
                  <button key={p} onClick={() => setPeriod(p)} style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 7, border: period === p ? `0.5px solid ${C.grey300}` : `0.5px solid ${C.grey100}`, background: period === p ? C.white : "transparent", color: period === p ? C.black : C.grey400, cursor: "pointer" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <MiniBarChart data={ENQUIRY_BARS} labels={DRAFT_LABELS} height={72} color={C.purple100} activeColor={C.purple500} />
          </div>
        </Card>
      </div>

      {/* Bottom three-col */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 20, marginBottom: 28 }}>

        {/* Open disputes */}
        <Card>
          <div style={{ padding: "16px 20px", borderBottom: `0.5px solid ${C.grey100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: display, fontSize: 15, fontWeight: 600, color: C.black }}>Open disputes</h2>
            <Tag>{OPEN_DISPUTES.length} open</Tag>
          </div>
          <div style={{ padding: "4px 0" }}>
            {OPEN_DISPUTES.map((d, i) => (
              <div key={d.id} style={{ padding: "14px 20px", borderBottom: i < OPEN_DISPUTES.length - 1 ? `0.5px solid ${C.grey100}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.black }}>{d.creator}</div>
                  <StatusPill status={d.status} />
                </div>
                <div style={{ fontSize: 12, color: C.grey500, marginBottom: 4 }}>{d.brand} · {d.package}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: C.grey300 }}>Raised {d.raised}</span>
                  <button style={{ fontSize: 11, fontWeight: 600, color: C.purple600, background: "none", border: "none", cursor: "pointer", padding: 0, display: "inline-flex", alignItems: "center", gap: 3 }}>Review <i className="ti ti-arrow-right" style={{ fontSize: 12 }} /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Flagged accounts */}
        <Card>
          <div style={{ padding: "16px 20px", borderBottom: `0.5px solid ${C.grey100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: display, fontSize: 15, fontWeight: 600, color: C.black }}>Flagged accounts</h2>
            <Tag color={C.errorText} bg={C.errorBg} border="rgba(255,75,75,0.2)">{FLAGGED_ACCOUNTS.length} pending</Tag>
          </div>
          <div style={{ padding: "4px 0" }}>
            {FLAGGED_ACCOUNTS.map((a, i) => (
              <div key={a.name} style={{ padding: "14px 20px", borderBottom: i < FLAGGED_ACCOUNTS.length - 1 ? `0.5px solid ${C.grey100}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Initials letters={a.initials} color={a.color} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.black }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: C.grey400 }}>Brand · flagged {a.flagged}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.grey500, marginBottom: 10 }}>{a.reason}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ flex: 1, fontSize: 11, fontWeight: 600, color: C.white, background: C.black, border: "none", borderRadius: 7, padding: "6px 0", cursor: "pointer" }}>Suspend</button>
                  <button style={{ flex: 1, fontSize: 11, fontWeight: 500, color: C.grey600, background: "none", border: `0.5px solid ${C.grey200}`, borderRadius: 7, padding: "6px 0", cursor: "pointer" }}>Restore</button>
                </div>
              </div>
            ))}
            {FLAGGED_ACCOUNTS.length === 0 && (
              <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: C.grey400 }}>No flagged accounts.</div>
            )}
          </div>
        </Card>

        {/* Escrow queue + flagged reviews stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Escrow timeout queue */}
          <Card>
            <div style={{ padding: "16px 20px", borderBottom: `0.5px solid ${C.grey100}` }}>
              <h2 style={{ fontFamily: display, fontSize: 15, fontWeight: 600, color: C.black }}>Escrow timeout queue</h2>
            </div>
            <div style={{ padding: "4px 0" }}>
              {ESCROW_QUEUE.map((e, i) => (
                <div key={e.id} style={{ padding: "13px 20px", borderBottom: i < ESCROW_QUEUE.length - 1 ? `0.5px solid ${C.grey100}` : "none", display: "flex", alignItems: "center", gap: 10 }}>
                  <Initials letters={e.initials} color={C.grey600} size={30} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.black }}>{e.creator}</div>
                    <div style={{ fontSize: 11, color: C.grey400 }}>{e.brand} · {e.amount}</div>
                  </div>
                  <Tag color={C.errorText} bg={C.errorBg} border="rgba(255,75,75,0.2)">+{e.overdue}</Tag>
                </div>
              ))}
            </div>
          </Card>

          {/* Flagged reviews */}
          <Card style={{ flex: 1 }}>
            <div style={{ padding: "16px 20px", borderBottom: `0.5px solid ${C.grey100}` }}>
              <h2 style={{ fontFamily: display, fontSize: 15, fontWeight: 600, color: C.black }}>Flagged reviews</h2>
            </div>
            <div style={{ padding: "4px 0" }}>
              {RECENT_REVIEWS.filter(r => r.flagged).map((r, i, arr) => (
                <div key={r.id} style={{ padding: "13px 20px", borderBottom: i < arr.length - 1 ? `0.5px solid ${C.grey100}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.black }}>{r.creator}</div>
                    <Stars n={r.stars} />
                  </div>
                  <div style={{ fontSize: 12, color: C.grey500, marginBottom: 6 }}>"{r.excerpt}"</div>
                  <div style={{ fontSize: 11, color: C.errorText, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}><i className="ti ti-flag-3" style={{ fontSize: 12 }} /> {r.reason}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ fontSize: 11, fontWeight: 600, color: C.errorText, background: C.errorBg, border: `0.5px solid rgba(255,75,75,0.2)`, borderRadius: 7, padding: "5px 10px", cursor: "pointer" }}>Remove</button>
                    <button style={{ fontSize: 11, fontWeight: 500, color: C.grey500, background: "none", border: `0.5px solid ${C.grey200}`, borderRadius: 7, padding: "5px 10px", cursor: "pointer" }}>Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>

      {/* Re-engagement email queue */}
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `0.5px solid ${C.grey100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontFamily: display, fontSize: 15, fontWeight: 600, color: C.black, marginBottom: 2 }}>Re-engagement email queue</h2>
            <div style={{ fontSize: 12, color: C.grey400 }}>Creators who abandoned their onboarding draft for 48+ hours. Emails sent automatically.</div>
          </div>
          <button style={{ fontSize: 12, fontWeight: 500, color: C.grey500, background: "none", border: `0.5px solid ${C.grey200}`, borderRadius: 7, padding: "6px 14px", cursor: "pointer" }}>
            Review email copy
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Creator", "Email", "Draft abandoned", "Email sent", "Opened", "Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.grey400, padding: "10px 16px", borderBottom: `0.5px solid ${C.grey200}`, background: C.grey50, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Faith Otieno",    email: "faith@example.com",  abandoned: "3 days ago",  sent: "1 day ago",  opened: true,  status: "no_action" },
                { name: "Daniel Kariuki",  email: "daniel@example.com", abandoned: "4 days ago",  sent: "2 days ago", opened: false, status: "no_action" },
                { name: "Sila Mwamba",     email: "sila@example.com",   abandoned: "6 days ago",  sent: "4 days ago", opened: true,  status: "resumed" },
                { name: "Brenda Achieng", email: "brenda@example.com", abandoned: "7 days ago",  sent: "5 days ago", opened: false, status: "no_action" },
                { name: "James Ngugi",    email: "james@example.com",  abandoned: "8 days ago",  sent: "6 days ago", opened: true,  status: "published" },
              ].map((row, i, arr) => (
                <tr key={row.email} style={{ borderBottom: i < arr.length - 1 ? `0.5px solid ${C.grey100}` : "none" }}>
                  <td style={{ padding: "13px 16px", fontWeight: 500, color: C.black }}>{row.name}</td>
                  <td style={{ padding: "13px 16px", color: C.grey500, fontFamily: "'SF Mono','Fira Code',monospace", fontSize: 12 }}>{row.email}</td>
                  <td style={{ padding: "13px 16px", color: C.grey500 }}>{row.abandoned}</td>
                  <td style={{ padding: "13px 16px", color: C.grey500 }}>{row.sent}</td>
                  <td style={{ padding: "13px 16px" }}>
                    {row.opened
                      ? <Tag color={C.successText} bg={C.successBg} border="rgba(0,185,107,0.2)">Yes</Tag>
                      : <Tag color={C.grey600} bg={C.grey50} border={C.grey200}>No</Tag>}
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    {row.status === "resumed"   && <Tag color={C.infoText}    bg={C.infoBg}    border="rgba(67,147,245,0.2)">Resumed draft</Tag>}
                    {row.status === "published" && <Tag color={C.successText} bg={C.successBg} border="rgba(0,185,107,0.2)">Published</Tag>}
                    {row.status === "no_action" && <Tag>No action yet</Tag>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}