import { useState } from "react";
import { usePageMeta } from '@/lib/usePageMeta';
import {
  IconX, IconCheck, IconStarFilled, IconStar,
  IconTrendingUp, IconTrendingDown, IconPaperclip,
  IconSearch, IconCircleCheck,
} from '@tabler/icons-react';

// ─── Design tokens (pulled directly from Creatorske Component Library v2) ───
// Fonts   : Archivo (display / h1–h4, bold) · Inter (body, everything else)
// Palette : achromatic grey ramp + purple-600 accent, semantic status colors
// Radii   : sm 4 · md 8 · lg 12 · xl 16 · 2xl 24 · pill 999
// Borders : 0.5px grey-100/200 hairlines, per component-library conventions
// ─────────────────────────────────────────────────────────────────────────────

const FONT_DISPLAY = "'Archivo', sans-serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";

const C = {
  black: "#000000",
  white: "#FFFFFF",
  grey50: "#F2F2F2",
  grey100: "#E5E5E5",
  grey200: "#CCCCCC",
  grey300: "#B3B3B3",
  grey400: "#999999",
  grey500: "#808080",
  grey600: "#666666",
  grey700: "#4D4D4D",
  purple50: "#EEEDFE",
  purple100: "#CECBF6",
  purple200: "#AFA9EC",
  purple400: "#7F77DD",
  purple600: "#534AB7",
  purple800: "#3C3489",
  success: "#10B981",
  successBg: "#DCFCE7",
  successText: "#047857",
  warning: "#F59E0B",
  warningBg: "#FEF3C7",
  warningText: "#B45309",
  error: "#EF4444",
  errorBg: "#FEE2E2",
  errorText: "#B91C1C",
  info: "#06B6D4",
  infoBg: "#CFFAFE",
  infoText: "#0E7490",
};

const R = { sm: 4, md: 8, lg: 12, xl: 16, xxl: 24, pill: 999 };

// Darkens a hex color by `percent` (negative = darker), used to build a
// two-tone cover gradient from a single avatarColor, matching the
// linear-gradient(135deg, light, dark) pattern used for card covers elsewhere.
function shade(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(Math.min(((num >> 16) & 0xFF) + amt, 255), 0);
  const g = Math.max(Math.min(((num >> 8) & 0xFF) + amt, 255), 0);
  const b = Math.max(Math.min((num & 0xFF) + amt, 255), 0);
  return "#" + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

const CAMPAIGNS = [
  {
    id: 1,
    creator: "Amara Osei",
    handle: "@amaracreates",
    initials: "AO",
    package: "Reel + Caption",
    platform: "Instagram",
    status: "In Review",
    deliveryDate: "28 Jun 2026",
    amount: "KES 22,000",
    unread: 2,
    avatarColor: "#534AB7",
  },
  {
    id: 2,
    creator: "Kofi Mensah",
    handle: "@koficontent",
    initials: "KM",
    package: "TikTok Bundle × 3",
    platform: "TikTok",
    status: "Booked",
    deliveryDate: "5 Jul 2026",
    amount: "KES 45,000",
    unread: 0,
    avatarColor: "#0E7490",
  },
  {
    id: 3,
    creator: "Zara Njoroge",
    handle: "@zaralifestyle",
    initials: "ZN",
    package: "YouTube Integration",
    platform: "YouTube",
    status: "Awaiting Approval",
    deliveryDate: "20 Jun 2026",
    amount: "KES 60,000",
    unread: 1,
    avatarColor: "#B45309",
  },
];

const SHORTLISTED = [
  {
    id: 4,
    creator: "Nia Kamau",
    handle: "@niakamau",
    initials: "NK",
    niche: "Food & Lifestyle",
    platform: "TikTok",
    followers: "180K",
    engagement: "6.1%",
    rating: 4.9,
    availability: "Open",
    avatarColor: "#047857",
  },
  {
    id: 5,
    creator: "Jabari Otieno",
    handle: "@jabarivibes",
    initials: "JO",
    niche: "Fashion",
    platform: "Instagram",
    followers: "92K",
    engagement: "5.3%",
    rating: 4.7,
    availability: "Limited",
    avatarColor: "#534AB7",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    "Booked":            { bg: C.purple50, color: C.purple800 },
    "In Review":         { bg: C.warningBg, color: C.warningText },
    "Awaiting Approval": { bg: C.infoBg, color: C.infoText },
    "Completed":         { bg: C.successBg, color: C.successText },
    "Cancelled":         { bg: C.errorBg, color: C.errorText },
  };
  const s = map[status] || map["Booked"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: R.pill,
      background: s.bg, color: s.color, lineHeight: 1, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function AvailBadge({ status }) {
  const map = {
    "Open":         { bg: C.successBg, color: C.successText },
    "Limited":      { bg: C.warningBg, color: C.warningText },
    "Fully Booked": { bg: C.errorBg, color: C.errorText },
  };
  const s = map[status] || map["Open"];
  return (
    <span style={{
      fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: R.pill,
      background: s.bg, color: s.color, lineHeight: 1,
    }}>
      {status}
    </span>
  );
}

function Avatar({ initials, color, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color + "1F", border: `0.5px solid ${color}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT_DISPLAY, fontSize: size * 0.32, fontWeight: 700, color,
      flexShrink: 0, overflow: "hidden",
    }}>
      {initials}
    </div>
  );
}

function TrendIcon({ up }) {
  return up ? <IconTrendingUp size={13} strokeWidth={2.5} /> : <IconTrendingDown size={13} strokeWidth={2.5} />;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, change, changeUp }) {
  return (
    <div style={{
      background: C.white, border: `0.5px solid ${C.grey100}`,
      borderRadius: R.lg, padding: 20, height: "100%",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
    }}>
      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: ".07em", textTransform: "uppercase", color: C.grey400, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 700, color: C.black, lineHeight: 1, marginBottom: 8 }}>
        {value}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
        <span style={{ color: C.grey500 }}>{sub}</span>
        {change && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 500, color: changeUp ? C.successText : C.errorText }}>
            <TrendIcon up={changeUp} />{change}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Campaign Row ─────────────────────────────────────────────────────────────
function CampaignRow({ c, onSelect }) {
  return (
    <tr onClick={() => onSelect(c)} style={{ cursor: "pointer" }}>
      <td style={{ padding: "13px 16px", borderBottom: `0.5px solid ${C.grey100}`, verticalAlign: "middle" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar initials={c.initials} color={c.avatarColor} size={32} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.black }}>{c.creator}</div>
            <div style={{ fontSize: 11.5, color: C.grey500 }}>{c.handle}</div>
          </div>
          {c.unread > 0 && (
            <span style={{
              background: C.error, color: C.white, fontSize: 9, fontWeight: 700,
              minWidth: 16, height: 16, borderRadius: R.pill, display: "flex",
              alignItems: "center", justifyContent: "center", padding: "0 4px", marginLeft: 2,
            }}>{c.unread}</span>
          )}
        </div>
      </td>
      <td style={{ padding: "13px 16px", borderBottom: `0.5px solid ${C.grey100}`, verticalAlign: "middle" }}>
        <div style={{ fontSize: 13, color: C.black }}>{c.package}</div>
        <div style={{ fontSize: 11.5, color: C.grey500 }}>{c.platform}</div>
      </td>
      <td style={{ padding: "13px 16px", borderBottom: `0.5px solid ${C.grey100}`, verticalAlign: "middle" }}>
        <StatusBadge status={c.status} />
      </td>
      <td style={{ padding: "13px 16px", borderBottom: `0.5px solid ${C.grey100}`, verticalAlign: "middle" }}>
        <div style={{ fontSize: 13, color: C.grey700 }}>{c.deliveryDate}</div>
      </td>
      <td style={{ padding: "13px 16px", borderBottom: `0.5px solid ${C.grey100}`, verticalAlign: "middle" }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, color: C.black }}>{c.amount}</div>
      </td>
      <td style={{ padding: "13px 16px", borderBottom: `0.5px solid ${C.grey100}`, verticalAlign: "middle" }}>
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(c); }}
          style={{
            background: C.white, border: `0.5px solid ${C.grey200}`,
            borderRadius: R.sm, padding: "6px 14px", fontSize: 12, fontWeight: 500,
            color: C.grey600, cursor: "pointer", fontFamily: FONT_BODY,
          }}
        >
          View
        </button>
      </td>
    </tr>
  );
}

// ─── Campaign Detail Drawer ────────────────────────────────────────────────────
function CampaignDrawer({ campaign, onClose }) {
  const [approveLoading, setApproveLoading] = useState(false);
  const [approved, setApproved] = useState(false);

  if (!campaign) return null;

  function handleApprove() {
    setApproveLoading(true);
    setTimeout(() => { setApproveLoading(false); setApproved(true); }, 1400);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.32)" }} />
      <div style={{
        position: "relative", width: "min(420px, 100vw)", background: C.white,
        borderLeft: `0.5px solid ${C.grey100}`, height: "100%",
        overflowY: "auto", padding: 28, display: "flex", flexDirection: "column", gap: 20,
        animation: "slideIn .18s ease both", fontFamily: FONT_BODY,
      }}>
        <style>{`@keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar initials={campaign.initials} color={campaign.avatarColor} size={44} />
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, color: C.black }}>{campaign.creator}</div>
              <div style={{ fontSize: 12, color: C.grey500 }}>{campaign.handle}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.grey500, lineHeight: 1, padding: 4, display: "flex" }}><IconX size={20} /></button>
        </div>

        <div style={{ height: "0.5px", background: C.grey100 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusBadge status={campaign.status} />
          <span style={{ fontSize: 12, color: C.grey500 }}>Due {campaign.deliveryDate}</span>
        </div>

        <div style={{ background: C.grey50, borderRadius: R.lg, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <Row label="Package" value={campaign.package} />
          <Row label="Platform" value={campaign.platform} />
          <Row label="Amount" value={campaign.amount} bold />
        </div>

        {campaign.status === "Awaiting Approval" && !approved && (
          <div style={{ background: C.infoBg, borderRadius: R.lg, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.infoText, marginBottom: 4 }}>Content delivered</div>
            <div style={{ fontSize: 12, color: C.infoText, marginBottom: 14, lineHeight: 1.55 }}>
              {campaign.creator} has marked this campaign as delivered. Review the content and approve to release escrow.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleApprove}
                disabled={approveLoading}
                style={{
                  flex: 1, background: C.black, color: C.white, border: "none",
                  borderRadius: R.md, padding: "10px 0", fontSize: 13, fontWeight: 500,
                  cursor: "pointer", opacity: approveLoading ? .7 : 1, fontFamily: FONT_BODY,
                }}
              >
                {approveLoading ? "Approving…" : "Approve delivery"}
              </button>
              <button style={{
                flex: 1, background: C.errorBg, color: C.errorText, border: "none",
                borderRadius: R.md, padding: "10px 0", fontSize: 13, fontWeight: 500, cursor: "pointer",
                fontFamily: FONT_BODY,
              }}>
                Raise dispute
              </button>
            </div>
          </div>
        )}

        {approved && (
          <div style={{ background: C.successBg, borderRadius: R.lg, padding: 14, fontSize: 13, color: C.successText, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
            <IconCheck size={15} /> Delivery approved, escrow released
          </div>
        )}

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: C.grey400, marginBottom: 10 }}>Messages</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <MessageBubble text="Hi! We'd love to feature your seasonal menu for the June campaign." sender="You" time="Jun 15" align="right" />
            <MessageBubble text="Sounds great, I'll start on the reel this week and send a draft for your review." sender={campaign.creator} time="Jun 15" align="left" />
            <MessageBubble text="Draft attached. Let me know if you'd like any changes!" sender={campaign.creator} time="Jun 18" align="left" attachment />
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <input placeholder="Reply…" style={{
              flex: 1, background: C.grey50, border: `0.5px solid ${C.grey100}`,
              borderRadius: R.md, padding: "9px 12px", fontSize: 13, color: C.black,
              fontFamily: FONT_BODY, outline: "none",
            }} />
            <button style={{
              background: C.black, color: C.white, border: "none",
              borderRadius: R.md, padding: "9px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: FONT_BODY,
            }}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: C.grey600 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: C.black, fontFamily: bold ? FONT_DISPLAY : undefined }}>{value}</span>
    </div>
  );
}

function MessageBubble({ text, sender, time, align, attachment }) {
  const isRight = align === "right";
  return (
    <div style={{ display: "flex", justifyContent: isRight ? "flex-end" : "flex-start" }}>
      <div style={{
        maxWidth: "80%", background: isRight ? C.black : C.grey50,
        color: isRight ? C.white : C.black,
        borderRadius: isRight ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
        padding: "9px 12px", fontSize: 12.5, lineHeight: 1.5,
      }}>
        {text}
        {attachment && (
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: isRight ? "rgba(255,255,255,.6)" : C.grey500 }}>
            <IconPaperclip size={12} />
            content-draft.mp4
          </div>
        )}
        <div style={{ fontSize: 10, color: isRight ? "rgba(255,255,255,.4)" : C.grey400, marginTop: 4, textAlign: "right" }}>{time}</div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BrandDashboardPage() {
  usePageMeta('Brand Dashboard', 'Track your campaigns, spend, and shortlisted creators on Creatorske.');
  const [tab, setTab] = useState("active");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [shortlistRemoved, setShortlistRemoved] = useState([]);

  const activeCampaigns = CAMPAIGNS;
  const displayedShortlist = SHORTLISTED.filter(c => !shortlistRemoved.includes(c.id));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ fontFamily: FONT_BODY, background: C.grey50, minHeight: "100%", color: C.black }}>
      <style>{`
        .bento{display:grid;grid-template-columns:repeat(12,1fr);gap:16px}
        .col-3{grid-column:span 3}
        .col-4{grid-column:span 4}
        .col-8{grid-column:span 8}
        .col-12{grid-column:span 12}
        @media (max-width:900px){.col-3,.col-4,.col-8{grid-column:span 6}}
        @media (max-width:600px){.col-3,.col-4,.col-6,.col-8{grid-column:span 12}}
      `}</style>

      <div style={{ padding: "32px 32px 48px", width: "100%", maxWidth: "none", margin: 0, boxSizing: "border-box" }}>

        {/* ── Hello message (replaces nav) ── */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, marginBottom: 28,
        }}>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, lineHeight: "36px", letterSpacing: "-0.02em", color: C.black }}>
              {greeting}, Nairobi Brew Co.
            </div>
            <div style={{ fontSize: 14, color: C.grey600, marginTop: 6 }}>
              Here's what's happening with your creator campaigns today.
            </div>
          </div>
          <button style={{
            background: C.black, color: C.white, border: "none",
            borderRadius: R.md, padding: "11px 20px", fontSize: 13.5, fontWeight: 500,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
            fontFamily: FONT_BODY, flexShrink: 0,
          }}>
            <IconSearch size={14} strokeWidth={2.5} />
            Find creators
          </button>
        </div>

        {/* ── Bento grid ── */}
        <div className="bento">

          {/* Stat cards */}
          <div className="col-3"><StatCard label="Active campaigns" value="3" sub="this month" change="+1" changeUp /></div>
          <div className="col-3"><StatCard label="Total spent" value="KES 127K" sub="all time" /></div>
          <div className="col-3"><StatCard label="Pending approval" value="1" sub="needs action" /></div>
          <div className="col-3"><StatCard label="Creators worked with" value="7" sub="all time" change="+2" changeUp /></div>

          {/* Delivery alert */}
          <div className="col-12" style={{
            background: C.successBg, borderRadius: R.lg, padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
          }}>
            <IconCircleCheck size={17} color={C.successText} strokeWidth={2} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 200, fontSize: 13.5, color: C.successText }}>
              <strong style={{ fontWeight: 600 }}>Zara Njoroge</strong> has marked your YouTube Integration as delivered. Review and approve to release payment.
            </div>
            <button
              onClick={() => setSelectedCampaign(CAMPAIGNS.find(c => c.id === 3))}
              style={{
                background: C.black, color: C.white, border: "none",
                borderRadius: R.sm, padding: "8px 16px", fontSize: 12.5, fontWeight: 500,
                cursor: "pointer", whiteSpace: "nowrap", fontFamily: FONT_BODY,
              }}
            >
              Review now
            </button>
          </div>

          {/* Active campaigns table */}
          <div className="col-12" style={{ background: C.white, border: `0.5px solid ${C.grey100}`, borderRadius: R.xl, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `0.5px solid ${C.grey100}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", background: C.grey50, borderRadius: R.lg, padding: 4, gap: 2 }}>
                {["active", "history"].map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      background: tab === t ? C.white : "transparent",
                      border: "none", borderRadius: R.md, padding: "8px 14px",
                      fontSize: 13, fontWeight: 500,
                      color: tab === t ? C.black : C.grey500,
                      boxShadow: tab === t ? "0 1px 2px rgba(0,0,0,.05)" : "none",
                      cursor: "pointer", fontFamily: FONT_BODY, textTransform: "capitalize",
                    }}
                  >
                    {t === "active" ? "Active campaigns" : "History"}
                  </button>
                ))}
              </div>
              <button style={{
                background: "transparent", border: `1px solid ${C.purple400}`,
                borderRadius: R.md, padding: "8px 16px", fontSize: 12.5, fontWeight: 500,
                color: C.purple600, cursor: "pointer", fontFamily: FONT_BODY,
              }}>
                + New campaign
              </button>
            </div>

            {tab === "active" ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      {["Creator", "Package", "Status", "Delivery date", "Amount", ""].map(h => (
                        <th key={h} style={{
                          padding: "10px 16px", textAlign: "left",
                          fontSize: 10, fontWeight: 600, letterSpacing: ".08em",
                          textTransform: "uppercase", color: C.grey400,
                          borderBottom: `0.5px solid ${C.grey200}`, background: C.grey50,
                          whiteSpace: "nowrap",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeCampaigns.map(c => (
                      <CampaignRow key={c.id} c={c} onSelect={setSelectedCampaign} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: 40, textAlign: "center", color: C.grey500, fontSize: 13 }}>
                No completed campaigns yet.
              </div>
            )}
          </div>

          {/* Shortlist heading */}
          <div className="col-12" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, color: C.black }}>Shortlisted creators</div>
              <div style={{ fontSize: 12.5, color: C.grey500, marginTop: 2 }}>Creators you've saved for comparison</div>
            </div>
          </div>

          {/* Shortlist cards */}
          {displayedShortlist.length === 0 ? (
            <div className="col-12" style={{
              background: C.white, border: `1.5px dashed ${C.grey200}`,
              borderRadius: R.lg, padding: 40, textAlign: "center",
            }}>
              <div style={{ fontSize: 13, color: C.grey500 }}>Your shortlist is empty.</div>
              <div style={{ fontSize: 12, color: C.grey400, marginTop: 4 }}>Browse the creator directory to find your next collaborator.</div>
            </div>
          ) : (
            displayedShortlist.map(c => (
              <div key={c.id} className="col-4" style={{
                background: C.white, border: `0.5px solid ${C.grey100}`,
                borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column",
              }}>
                {/* Cover gradient: niche tag + identity row, matching DirectoryPage's CreatorCard */}
                <div style={{ background: `linear-gradient(135deg, ${c.avatarColor}, ${shade(c.avatarColor, -35)})`, position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 12, minHeight: 130 }}>
                  <div style={{ position: "absolute", top: 10, right: 10, fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 999, background: "rgba(255,255,255,0.22)", color: "#fff" }}>
                    {c.niche}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, position: "relative", zIndex: 1 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, fontSize: 12, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
                      {c.initials}
                    </div>
                    <div>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.2, textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>{c.creator}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>{c.handle}</div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, flex: 1, background: C.white }}>
                  {/* nuance: platform tag + availability badge (Dashboard-specific, replaces the plain dot+label used elsewhere) */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: R.pill, background: C.grey50, color: C.grey700 }}>{c.platform}</span>
                    <AvailBadge status={c.availability} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: C.grey200, borderRadius: 8, overflow: "hidden" }}>
                    {[
                      { label: "Followers", value: c.followers },
                      { label: "Engagement", value: c.engagement },
                      { label: "Rating", value: c.rating },
                    ].map(s => (
                      <div key={s.label} style={{ background: C.grey50, padding: "7px 0", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 600, color: C.black }}>
                          {s.value}
                          {s.label === "Rating" && <IconStarFilled size={11} style={{ color: C.black }} />}
                        </div>
                        <div style={{ fontSize: 9, color: C.grey400, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 1 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{
                      flex: 1, background: C.black, color: C.white, border: "none",
                      borderRadius: R.md, padding: "9px 0", fontSize: 12.5, fontWeight: 500,
                      cursor: "pointer", fontFamily: FONT_BODY,
                    }}>Send enquiry</button>
                    <button
                      onClick={() => setShortlistRemoved(r => [...r, c.id])}
                      style={{
                        background: C.white, color: C.grey600,
                        border: `0.5px solid ${C.grey200}`, borderRadius: R.md,
                        padding: "9px 14px", fontSize: 12.5, fontWeight: 500,
                        cursor: "pointer", fontFamily: FONT_BODY,
                      }}
                    >Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Browse directory CTA tile */}
          <div className="col-4" style={{
            background: C.white, border: `1.5px dashed ${C.grey200}`, borderRadius: R.lg,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 10, padding: 18, cursor: "pointer", minHeight: 200, textAlign: "center",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%", background: C.purple50,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <IconSearch size={18} strokeWidth={2.5} style={{ color: C.purple600 }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: C.black }}>Browse full directory</div>
            <div style={{ fontSize: 12, color: C.grey500 }}>Discover more creators to shortlist</div>
          </div>

        </div>
      </div>

      {/* Campaign drawer */}
      {selectedCampaign && (
        <CampaignDrawer campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
      )}
    </div>
  );
}