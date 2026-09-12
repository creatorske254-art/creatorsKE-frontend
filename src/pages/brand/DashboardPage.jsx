import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageMeta } from '@/lib/usePageMeta';
import {
  IconX, IconCheck, IconStarFilled, IconStar,
  IconTrendingUp, IconTrendingDown,
  IconSearch, IconCircleCheck, IconHistory,
} from '@tabler/icons-react';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { useBrandDashboard, useCampaignActions } from '@/features/brand-dashboard/hooks/useBrandDashboard';
import { getInitials, formatCurrency, formatDate, formatCount } from '@/lib/utils';

// ─── Design tokens (pulled directly from Creatorske Component Library v2) ───
// Fonts   : Archivo (display / h1–h4, bold) · Inter (body, everything else)
// Palette : achromatic grey ramp + purple-600 accent, semantic status colors
// Radii   : sm 4 · md 8 · lg 12 · xl 16 · 2xl 24 · pill 999
// Borders : 0.5px grey-100/200 hairlines, per component-library conventions
// ─────────────────────────────────────────────────────────────────────────────

const FONT_DISPLAY = "var(--font-display)";
const FONT_BODY = "var(--font-body)";

// Aliases into the shared index.css tokens. These used to be copied hex
// values, which meant the whole page ignored dark mode and rendered as a
// bright island inside the dark shell.
const C = {
  black: "var(--black)",
  white: "var(--white)",
  grey50: "var(--grey-50)",
  grey100: "var(--grey-100)",
  grey200: "var(--grey-200)",
  grey300: "var(--grey-300)",
  grey400: "var(--grey-400)",
  grey500: "var(--grey-500)",
  grey600: "var(--grey-600)",
  grey700: "var(--grey-700)",
  purple50: "var(--purple-50)",
  purple100: "var(--purple-100)",
  purple200: "var(--purple-200)",
  purple400: "var(--purple-400)",
  purple600: "var(--purple-600)",
  purple800: "var(--purple-800)",
  success: "var(--status-success)",
  successBg: "var(--status-success-bg)",
  successText: "var(--status-success-text)",
  warning: "var(--status-warning)",
  warningBg: "var(--status-warning-bg)",
  warningText: "var(--status-warning-text)",
  error: "var(--status-error)",
  errorBg: "var(--status-error-bg)",
  errorText: "var(--status-error-text)",
  info: "var(--status-info)",
  infoBg: "var(--status-info-bg)",
  infoText: "var(--status-info-text)",
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

// Response schema for GET /brands/campaigns and GET /brands/shortlist is
// undocumented (see CLAUDE.md) - field names below are best-effort guesses
// with graceful fallbacks. Status vocabulary is shared with CampaignsPage.jsx
// (in_progress/delivered/disputed/completed/refunded) since both pages read
// the same underlying campaign resource.
const STATUS_META = {
  in_progress: { label: "In progress",        cls: "tag-purple"  },
  delivered:   { label: "Awaiting approval",  cls: "tag-info"    },
  disputed:    { label: "Disputed",           cls: "tag-error"   },
  completed:   { label: "Completed",          cls: "tag-success" },
  refunded:    { label: "Refunded",           cls: "tag-warning" },
};

function normalizeCampaign(c) {
  const creatorName = c.creatorName ?? c.creator ?? "Unknown creator";
  return {
    id: c.id,
    creator: creatorName,
    handle: c.creatorHandle ?? c.handle ?? "",
    initials: getInitials(creatorName),
    package: c.packageName ?? c.package ?? "-",
    platform: c.platform ?? "-",
    status: c.status ?? "in_progress",
    deliveryDate: formatDate(c.expectedDeliveryAt ?? c.deliveredAt),
    amount: formatCurrency(c.price ?? c.amount),
    rawAmount: Number(c.price ?? c.amount ?? 0),
    unread: c.unreadMessageCount ?? 0,
    avatarColor: "#534AB7",
  };
}

function normalizeShortlistEntry(s) {
  const creatorName = s.creatorName ?? s.name ?? s.creator ?? "Unknown creator";
  return {
    id: s.id ?? s.creatorId,
    creator: creatorName,
    handle: s.handle ?? s.creatorHandle ?? "",
    initials: getInitials(creatorName),
    niche: s.niche ?? s.category ?? "-",
    platform: s.platform ?? "-",
    followers: s.followers != null ? formatCount(s.followers) : "-",
    engagement: s.engagementRate != null ? `${s.engagementRate}%` : "-",
    rating: s.rating ?? "-",
    availability: s.availability ?? "Open",
    avatarColor: "#534AB7",
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.in_progress;
  return (
    <span className={`tag ${meta.cls}`} style={{ whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />
      {meta.label}
    </span>
  );
}

function AvailBadge({ status }) {
  const map = {
    "Open":         "tag-success",
    "Limited":      "tag-warning",
    "Fully Booked": "tag-error",
  };
  const cls = map[status] || map["Open"];
  return (
    <span className={`tag ${cls}`} style={{ fontSize: 10, padding: "3px 8px" }}>
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
  const navigate = useNavigate();
  // Same real mutation the full campaign page uses, so approving from the
  // drawer isn't a different (fake) code path to approving from the page.
  const { approve, isApproving } = useCampaignActions(campaign?.id);
  const [approved, setApproved] = useState(false);
  const [reply, setReply] = useState("");

  if (!campaign) return null;

  function handleApprove() {
    approve(undefined, { onSuccess: () => setApproved(true) });
  }

  function handleSendReply() {
    const trimmed = reply.trim();
    if (!trimmed) return;
    // The thread itself lives on the campaign page, which is wired to the real
    // messaging endpoint - send the brand there rather than faking a bubble here.
    onClose();
    navigate(`/brand/campaigns/${campaign.id}#messages`);
  }

  function handleRaiseDispute() {
    onClose();
    navigate(`/brand/campaigns/${campaign.id}`);
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

        {campaign.status === "delivered" && !approved && (
          <div style={{ background: C.infoBg, borderRadius: R.lg, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.infoText, marginBottom: 4 }}>Content delivered</div>
            <div style={{ fontSize: 12, color: C.infoText, marginBottom: 14, lineHeight: 1.55 }}>
              {campaign.creator} has marked this campaign as delivered. Review the content and approve to release escrow.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className={isApproving ? "btn-loading" : undefined}
                style={{
                  flex: 1, background: C.black, color: C.white, border: "none",
                  borderRadius: R.md, padding: "10px 0", fontSize: 13, fontWeight: 500,
                  cursor: "pointer", fontFamily: FONT_BODY,
                }}
              >
                Approve delivery
              </button>
              <button
                onClick={handleRaiseDispute}
                style={{
                  flex: 1, background: C.errorBg, color: C.errorText, border: "none",
                  borderRadius: R.md, padding: "10px 0", fontSize: 13, fontWeight: 500, cursor: "pointer",
                  fontFamily: FONT_BODY,
                }}
              >
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
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <input
              placeholder="Reply…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSendReply(); }}
              style={{
                flex: 1, background: C.grey50, border: `0.5px solid ${C.grey100}`,
                borderRadius: R.md, padding: "9px 12px", fontSize: 13, color: C.black,
                fontFamily: FONT_BODY, outline: "none",
              }}
            />
            <button
              onClick={handleSendReply}
              style={{
                background: C.black, color: C.white, border: "none",
                borderRadius: R.md, padding: "9px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer",
                fontFamily: FONT_BODY,
              }}
            >Send</button>
          </div>
          <button
            onClick={() => { onClose(); navigate(`/brand/campaigns/${campaign.id}#messages`); }}
            style={{
              marginTop: 10, background: "none", border: "none", padding: 0, cursor: "pointer",
              fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 500, color: C.purple600,
            }}
          >
            Open full conversation →
          </button>
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


// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BrandDashboardPage() {
  usePageMeta('Brand Dashboard', 'Track your campaigns, spend, and shortlisted creators on Creatorske.');
  const navigate = useNavigate();
  const [tab, setTab] = useState("active");
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const {
    campaigns: rawCampaigns,
    isLoadingCampaigns,
    isCampaignsError,
    refetchCampaigns,
    shortlist: rawShortlist,
    isLoadingShortlist,
    isShortlistError,
    removeFromShortlist,
  } = useBrandDashboard();

  const campaigns = useMemo(() => rawCampaigns.map(normalizeCampaign), [rawCampaigns]);
  const displayedShortlist = useMemo(() => rawShortlist.map(normalizeShortlistEntry), [rawShortlist]);

  const activeCampaigns = campaigns.filter((c) => c.status === "in_progress" || c.status === "delivered");
  const historyCampaigns = campaigns.filter((c) => c.status === "completed" || c.status === "refunded");
  const deliveredCampaign = campaigns.find((c) => c.status === "delivered");

  const stats = useMemo(() => {
    const pendingApproval = campaigns.filter((c) => c.status === "delivered").length;
    const totalSpent = campaigns
      .filter((c) => c.status === "completed")
      .reduce((sum, c) => sum + c.rawAmount, 0);
    const uniqueCreators = new Set(campaigns.map((c) => c.handle || c.creator)).size;
    return { active: activeCampaigns.length, totalSpent, pendingApproval, uniqueCreators };
  }, [campaigns, activeCampaigns.length]);

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
          <button
            onClick={() => navigate('/directory')}
            style={{
              background: C.black, color: C.white, border: "none",
              borderRadius: R.md, padding: "11px 20px", fontSize: 13.5, fontWeight: 500,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
              fontFamily: FONT_BODY, flexShrink: 0,
            }}
          >
            <IconSearch size={14} strokeWidth={2.5} />
            Find creators
          </button>
        </div>

        {/* ── Bento grid ── */}
        <div className="bento">

          {/* Stat cards */}
          <div className="col-3"><StatCard label="Active campaigns" value={isLoadingCampaigns ? <Skeleton width={30} height={28} /> : stats.active} sub="right now" /></div>
          <div className="col-3"><StatCard label="Total spent" value={isLoadingCampaigns ? <Skeleton width={70} height={28} /> : formatCurrency(stats.totalSpent)} sub="all time" /></div>
          <div className="col-3"><StatCard label="Pending approval" value={isLoadingCampaigns ? <Skeleton width={20} height={28} /> : stats.pendingApproval} sub="needs action" /></div>
          <div className="col-3"><StatCard label="Creators worked with" value={isLoadingCampaigns ? <Skeleton width={20} height={28} /> : stats.uniqueCreators} sub="all time" /></div>

          {/* Delivery alert */}
          {deliveredCampaign && (
            <div className="col-12" style={{
              background: C.successBg, borderRadius: R.lg, padding: "14px 20px",
              display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
            }}>
              <IconCircleCheck size={17} color={C.successText} strokeWidth={2} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 200, fontSize: 13.5, color: C.successText }}>
                <strong style={{ fontWeight: 600 }}>{deliveredCampaign.creator}</strong> has marked your {deliveredCampaign.package} as delivered. Review and approve to release payment.
              </div>
              <button
                onClick={() => setSelectedCampaign(deliveredCampaign)}
                style={{
                  background: C.black, color: C.white, border: "none",
                  borderRadius: R.sm, padding: "8px 16px", fontSize: 12.5, fontWeight: 500,
                  cursor: "pointer", whiteSpace: "nowrap", fontFamily: FONT_BODY,
                }}
              >
                Review now
              </button>
            </div>
          )}

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
              <button
                onClick={() => navigate('/directory')}
                style={{
                  background: "transparent", border: `1px solid ${C.purple400}`,
                  borderRadius: R.md, padding: "8px 16px", fontSize: 12.5, fontWeight: 500,
                  color: C.purple600, cursor: "pointer", fontFamily: FONT_BODY,
                }}
              >
                + New campaign
              </button>
            </div>

            {isCampaignsError ? (
              <ErrorState size="sm" onRetry={refetchCampaigns} />
            ) : isLoadingCampaigns ? (
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {[0, 1, 2].map((i) => <Skeleton key={i} width="100%" height={40} />)}
              </div>
            ) : tab === "active" ? (
              activeCampaigns.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon={<IconHistory size={18} />}
                  title="No active campaigns"
                  description="Book a creator from the directory to start your first campaign."
                />
              ) : (
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
              )
            ) : historyCampaigns.length === 0 ? (
              <EmptyState
                size="sm"
                icon={<IconHistory size={18} />}
                title="No completed campaigns yet"
                description="Campaigns move here once they're delivered and approved."
              />
            ) : (
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
                    {historyCampaigns.map(c => (
                      <CampaignRow key={c.id} c={c} onSelect={setSelectedCampaign} />
                    ))}
                  </tbody>
                </table>
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
          {isShortlistError ? (
            <div className="col-12"><ErrorState /></div>
          ) : isLoadingShortlist ? (
            <>
              {[0, 1, 2].map((i) => (
                <div key={i} className="col-4">
                  <Skeleton width="100%" height={230} style={{ borderRadius: 16 }} />
                </div>
              ))}
            </>
          ) : displayedShortlist.length === 0 ? (
            <div className="col-12" style={{
              background: C.white, border: `1.5px dashed ${C.grey200}`,
              borderRadius: R.lg, padding: 40, textAlign: "center",
            }}>
              <div style={{ fontSize: 13, color: C.grey500 }}>Your shortlist is empty.</div>
              <div style={{ fontSize: 12, color: C.grey400, marginTop: 4, marginBottom: 12 }}>Browse the creator directory to find your next collaborator.</div>
              <button
                onClick={() => navigate('/directory')}
                style={{
                  background: C.black, color: C.white, border: "none", borderRadius: R.md,
                  padding: "8px 16px", fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: FONT_BODY,
                }}
              >
                Browse directory
              </button>
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
                    <button
                      onClick={() => navigate(`/c/${c.handle.replace('@', '')}?enquire=1`)}
                      style={{
                        flex: 1, background: C.black, color: C.white, border: "none",
                        borderRadius: R.md, padding: "9px 0", fontSize: 12.5, fontWeight: 500,
                        cursor: "pointer", fontFamily: FONT_BODY,
                      }}
                    >Send enquiry</button>
                    <button
                      onClick={() => removeFromShortlist(c.id)}
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
          <div
            className="col-4"
            onClick={() => navigate('/directory')}
            style={{
              background: C.white, border: `1.5px dashed ${C.grey200}`, borderRadius: R.lg,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 10, padding: 18, cursor: "pointer", minHeight: 200, textAlign: "center",
            }}
          >
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