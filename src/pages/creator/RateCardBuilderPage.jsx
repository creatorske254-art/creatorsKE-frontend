import React, { useState } from "react";
import { usePageMeta } from '@/lib/usePageMeta';
import {
  IconArrowLeft, IconArrowRight, IconUpload, IconMapPin, IconBrandInstagram, IconBrandYoutube, IconBrandTiktok,
  IconBrandX, IconMicrophone, IconMessageCircle, IconLanguage, IconShieldCheck, IconDeviceMobile,
  IconBuilding, IconInfoCircle, IconCheck, IconRocket, IconLink, IconCopy, IconGripVertical, IconTrash,
  IconEye, IconPencil, IconPlus, IconChevronDown, IconLayoutDashboard
} from "@tabler/icons-react";

/* design tokens (scoped)
   These are intentionally kept as local custom-property *names* (--txt-primary,
   --bg-info, --r-md, --f-head, etc.) because ~800 lines of CSS below and
   inline styles throughout this file already reference them. Rather than
   touch every rule, each one is aliased straight into the shared system in
   index.css, so color, typography, and radius now come from one source of
   truth, and any future change to index.css's tokens flows through here
   automatically.
   Note: no --bg-* is applied to the .rcb wrapper itself, the content area
   already owns that background (matches DashboardPage / EnquiriesPage).
   Also note: payment-provider brand marks (M-Pesa green, Airtel red,
   WhatsApp green) intentionally stay hardcoded, those represent
   third-party brand identities, not our own admin chrome, so they're
   outside this system on purpose.
*/
const Tokens = () => (
  <style>{`
  .rcb{
    --f-head: var(--font-display);
    --f-body: var(--font-body);
    --f-mono: var(--font-mono);

    --pur-50:  var(--purple-50);
    --pur-100: var(--purple-100);
    --pur-200: var(--purple-200);
    --pur-400: var(--purple-400);
    --pur-600: var(--purple-600);
    --pur-800: var(--purple-800);
    --pur-900: var(--purple-900);

    --red-400:   var(--status-error);
    --green-400: var(--status-success);

    --bg-primary:   var(--white);
    --bg-secondary: var(--page-bg);
    --bg-tertiary:  var(--grey-100);
    --bg-info:    var(--status-info-bg);
    --bg-success: var(--status-success-bg);
    --bg-warning: var(--status-warning-bg);
    --bg-danger:  var(--status-error-bg);

    --txt-primary:   var(--black);
    --txt-secondary: var(--grey-600);
    --txt-tertiary:  var(--grey-400);
    --txt-info:    var(--status-info-text);
    --txt-success: var(--status-success-text);
    --txt-warning: var(--status-warning-text);
    --txt-danger:  var(--status-error-text);

    --bdr-tertiary: var(--grey-100);
    --bdr-secondary: var(--grey-200);
    --bdr-primary:  var(--grey-300);
    --bdr-info:    color-mix(in srgb, var(--status-info) 35%, transparent);
    --bdr-success: color-mix(in srgb, var(--status-success) 35%, transparent);
    --bdr-warning: color-mix(in srgb, var(--status-warning) 35%, transparent);
    --bdr-danger:  color-mix(in srgb, var(--status-error) 35%, transparent);

    --r-md: var(--radius-md);
    --r-lg: var(--radius-lg);
    --r-xl: var(--radius-xl);

    --accent: var(--purple-600);
    --accent-light: var(--purple-50);
    --accent-border: var(--purple-200);
    --accent-txt: var(--purple-800);

    font-family:var(--f-body);color:var(--txt-primary);line-height:1.6;font-size:var(--text-body-size);
  }
  .rcb *{box-sizing:border-box}
  .rcb .bs{flex:1;display:flex;flex-direction:column;width:100%;min-height:100%}
  .rcb .btop{background:var(--bg-primary);border-bottom:0.5px solid var(--bdr-tertiary);padding:var(--space-16) var(--space-28);border-radius:var(--r-xl) var(--r-xl) 0 0}
  .rcb .btop-inner{max-width:1080px;margin:0 auto}
  .rcb .bptitle{font-family:var(--f-head);font-size:22px;font-weight:600;color:var(--txt-primary);margin-bottom:2px;letter-spacing:-.01em}
  .rcb .bpsub{font-size:13px;color:var(--txt-secondary)}
  .rcb .bbody{flex:1;padding:var(--space-28) 0;width:100%;display:flex;flex-direction:column;gap:var(--space-16)}
  .rcb .bfooter{background:var(--bg-primary);border-top:0.5px solid var(--bdr-tertiary);padding:var(--space-12) var(--space-28);position:sticky;bottom:0;z-index:100;border-radius:0 0 var(--r-xl) var(--r-xl)}
  .rcb .bfooter-inner{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:var(--space-8)}
  .rcb .bsplit{display:grid;grid-template-columns:1fr 280px;gap:var(--space-24);align-items:start}
  .rcb .bento{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-16);align-items:start}
  .rcb .bento>.span2{grid-column:1 / -1}
  @media(max-width:860px){.rcb .bsplit{grid-template-columns:1fr}.rcb .rcp-preview-col{display:none}.rcb .g3,.rcb .g4{grid-template-columns:1fr 1fr}}
  @media(max-width:600px){.rcb .bbody{padding:var(--space-16) 0}.rcb .btop{padding:14px}.rcb .bfooter{padding:var(--space-10) var(--space-12)}.rcb .g2,.rcb .g3,.rcb .g4,.rcb .bento{grid-template-columns:1fr}}

  .rcb .stepper{display:flex;align-items:flex-start;flex-wrap:wrap}
  .rcb .st-item{display:flex;align-items:center}
  .rcb .st-col{display:flex;flex-direction:column;align-items:center}
  .rcb .st-circle{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0;transition:all .2s;font-family:var(--f-head)}
  .rcb .st-circle.done{background:var(--txt-primary);color:var(--bg-primary)}
  .rcb .st-circle.active{background:var(--accent);color:#fff;box-shadow:0 0 0 3px var(--accent-light)}
  .rcb .st-circle.pending{background:var(--bg-primary);color:var(--txt-tertiary);border:0.5px solid var(--bdr-secondary)}
  .rcb .st-line{width:40px;height:0.5px;background:var(--bdr-secondary);margin:0 4px;margin-top:13px}
  .rcb .st-line.done{background:var(--txt-primary)}
  .rcb .st-label{font-size:10px;font-weight:500;margin-top:5px;text-align:center;white-space:nowrap;letter-spacing:.02em}
  .rcb .st-label.done{color:var(--txt-primary)}.rcb .st-label.active{color:var(--accent)}.rcb .st-label.pending{color:var(--txt-tertiary)}

  .rcb .btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;border:none;cursor:pointer;font-family:var(--f-body);font-weight:500;transition:all .12s;white-space:nowrap;line-height:1}
  .rcb .btn-primary{background:var(--txt-primary);color:var(--bg-primary);border-radius:var(--r-md);font-size:13px;padding:9px 18px}
  .rcb .btn-primary:hover{opacity:.88;transform:translateY(-1px)}
  .rcb .btn-secondary{background:var(--bg-primary);color:var(--txt-primary);border-radius:var(--r-md);font-size:13px;padding:8.5px 18px;border:0.5px solid var(--bdr-secondary)}
  .rcb .btn-secondary:hover{border-color:var(--bdr-primary);background:var(--bg-secondary)}
  .rcb .btn-accent{background:var(--accent);color:#fff;border-radius:var(--r-md);font-size:13px;padding:9px 18px}
  .rcb .btn-accent:hover{opacity:.9;transform:translateY(-1px)}
  .rcb .btn-ghost{background:transparent;color:var(--txt-secondary);border-radius:var(--r-md);font-size:13px;padding:8.5px 18px;border:0.5px solid var(--bdr-secondary)}
  .rcb .btn-ghost:hover{color:var(--txt-primary);border-color:var(--bdr-primary);background:var(--bg-secondary)}
  .rcb .btn-sm{padding:5px 12px;font-size:12px}
  .rcb .btn-xs{padding:3px 9px;font-size:11px}
  .rcb .btn-full{width:100%;justify-content:center}
  .rcb .btn:disabled{pointer-events:none;opacity:.6}

  .rcb .field{display:flex;flex-direction:column;gap:5px}
  .rcb .label{font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--txt-secondary)}
  .rcb .label.req::after{content:' *';color:var(--red-400)}
  .rcb .hint{font-size:12px;color:var(--txt-tertiary);line-height:1.5}
  .rcb .inp{width:100%;font-family:var(--f-body);font-size:13.5px;color:var(--txt-primary);background:var(--bg-secondary);border:0.5px solid var(--bdr-tertiary);outline:none;transition:border-color .12s,background-color .12s,box-shadow .12s;padding:8.5px 12px;border-radius:var(--r-md)}
  .rcb .inp::placeholder{color:var(--txt-tertiary)}
  .rcb .inp:hover{border-color:var(--bdr-secondary)}
  .rcb .inp:focus{border-color:var(--bdr-primary);background:var(--bg-primary);box-shadow:0 0 0 3px var(--accent-light)}
  .rcb .inp-wrap{position:relative}
  .rcb .inp-icon-l{padding-left:34px!important}
  .rcb .inp-icon-r{padding-right:34px!important}
  .rcb .inp-icon{position:absolute;top:50%;transform:translateY(-50%);color:var(--txt-tertiary);font-size:14px;pointer-events:none;display:flex}
  .rcb .inp-icon.l{left:10px}.rcb .inp-icon.r{right:10px}
  .rcb .inp-pre{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:12px;font-weight:500;color:var(--txt-tertiary);pointer-events:none;white-space:nowrap}
  .rcb .sel-wrap{position:relative}
  .rcb .sel-wrap .chev{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:var(--txt-tertiary);pointer-events:none;display:flex}
  .rcb select.inp{appearance:none;padding-right:30px;cursor:pointer}
  .rcb .ta{resize:vertical;min-height:80px;line-height:1.65;font-family:var(--f-body)}
  .rcb .toggle{width:40px;height:21px;border-radius:999px;background:var(--bdr-secondary);position:relative;cursor:pointer;transition:background .18s;flex-shrink:0;border:none}
  .rcb .toggle.on{background:var(--accent)}
  .rcb .toggle::after{content:'';position:absolute;top:2.5px;left:2.5px;width:16px;height:16px;border-radius:50%;background:white;transition:transform .18s}
  .rcb .toggle.on::after{transform:translateX(19px)}

  .rcb .g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .rcb .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
  .rcb .hr{height:0.5px;background:var(--bdr-tertiary);margin:4px 0}

  .rcb .tag{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:500;padding:3px 8px;border-radius:var(--r-md);line-height:1}
  .rcb .tag-accent{background:var(--accent-light);color:var(--accent-txt);border:0.5px solid var(--accent-border)}
  .rcb .tag-success{background:var(--bg-success);color:var(--txt-success);border:0.5px solid var(--bdr-success)}
  .rcb .tag-default{background:var(--bg-secondary);color:var(--txt-secondary);border:0.5px solid var(--bdr-tertiary)}
  .rcb .sdot{width:5px;height:5px;border-radius:50%;flex-shrink:0}

  .rcb .alert{display:flex;align-items:flex-start;gap:9px;padding:10px 13px;border-radius:var(--r-lg);font-size:12.5px;line-height:1.45}
  .rcb .alert svg{flex-shrink:0;margin-top:1px}
  .rcb .alert-body{flex:1}
  .rcb .alert-title{font-weight:500;margin-bottom:1px;font-size:12.5px}
  .rcb .alert-info{background:var(--bg-info);color:var(--txt-info);border:0.5px solid var(--bdr-info)}

  .rcb .card{background:var(--bg-primary);border:0.5px solid var(--bdr-tertiary);border-radius:var(--r-xl);transition:border-color .12s}
  .rcb .card-p{padding:20px}
  .rcb .card-dash{background:var(--bg-primary);border:0.5px dashed var(--bdr-secondary);border-radius:var(--r-xl);cursor:pointer;transition:all .15s}
  .rcb .card-dash:hover{border-color:var(--accent);background:var(--accent-light)}

  .rcb .plat-btn{display:flex;align-items:center;gap:6px;padding:7px 13px;border:0.5px solid var(--bdr-secondary);border-radius:var(--r-md);background:var(--bg-primary);cursor:pointer;font-family:var(--f-body);font-size:12.5px;font-weight:500;color:var(--txt-secondary);transition:all .12s}
  .rcb .plat-btn:hover{border-color:var(--bdr-primary);color:var(--txt-primary)}
  .rcb .plat-btn.on{border-color:var(--accent);background:var(--accent-light);color:var(--accent-txt)}

  .rcb .av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-family:var(--f-head);flex-shrink:0;letter-spacing:.04em}
  .rcb .av-md{width:40px;height:40px;font-size:13px}
  .rcb .av-xl{width:76px;height:76px;font-size:24px}
  .rcb .av-accent{background:var(--accent-light);color:var(--accent-txt);border:0.5px solid var(--accent-border)}

  .rcb .rcp{background:var(--bg-primary);border:0.5px solid var(--bdr-tertiary);border-radius:var(--r-xl);overflow:hidden;width:100%}
  .rcb .rcp-top{padding:16px 16px 12px;border-bottom:0.5px solid var(--bdr-tertiary)}
  .rcb .rcp-name{font-family:var(--f-head);font-size:16px;font-weight:600;color:var(--txt-primary);margin:8px 0 2px;letter-spacing:-.01em;line-height:1.2}
  .rcb .rcp-handle{font-size:11px;color:var(--txt-tertiary)}
  .rcb .rcp-plats{display:flex;gap:4px;margin-top:8px}
  .rcb .rcp-plat{width:22px;height:22px;border-radius:var(--r-md);border:0.5px solid var(--bdr-tertiary);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--txt-secondary)}
  .rcb .rcp-stats{display:flex;border-bottom:0.5px solid var(--bdr-tertiary)}
  .rcb .rcp-stat{flex:1;padding:9px 12px;text-align:center;border-right:0.5px solid var(--bdr-tertiary)}
  .rcb .rcp-stat:last-child{border-right:none}
  .rcb .rcp-stat-n{font-family:var(--f-head);font-size:15px;font-weight:600;color:var(--txt-primary);line-height:1}
  .rcb .rcp-stat-l{font-size:8px;text-transform:uppercase;letter-spacing:.07em;color:var(--txt-tertiary);margin-top:2px}
  .rcb .rcp-bio{padding:10px 13px;font-size:11px;color:var(--txt-secondary);border-bottom:0.5px solid var(--bdr-tertiary);line-height:1.6}
  .rcb .rcp-pkgs{padding:11px}
  .rcb .rcp-pkg-label{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.09em;color:var(--txt-tertiary);margin-bottom:8px}
  .rcb .rcp-pkg-list{display:flex;flex-direction:column;gap:5px}
  .rcb .rcp-pkg{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border:0.5px solid var(--bdr-tertiary);border-radius:var(--r-md)}
  .rcb .rcp-pkg.feat{border-color:var(--accent-border);background:var(--accent-light)}
  .rcb .rcp-pkg-name{font-size:11.5px;font-weight:500;color:var(--txt-primary)}
  .rcb .rcp-pkg-price{font-size:11.5px;font-weight:600;color:var(--accent)}
  .rcb .rcp-footer{padding:10px 11px;border-top:0.5px solid var(--bdr-tertiary);display:flex;gap:6px}
  .rcb .rcp-preview-col{position:sticky;top:12px}

  .rcb .pkg-card{background:var(--bg-primary);border:0.5px solid var(--bdr-tertiary);border-radius:var(--r-xl);padding:18px;position:relative}
  .rcb .pkg-card.feat-card{border-color:var(--accent-border);background:var(--accent-light)}
  .rcb .pkg-drag-handle{cursor:grab;color:var(--txt-tertiary);display:flex}

  .rcb .pay-method{background:var(--bg-primary);border:0.5px solid var(--bdr-tertiary);border-radius:var(--r-xl);padding:18px;transition:all .18s}
  .rcb .pay-method.active-method{border-color:var(--accent-border);background:var(--accent-light)}
  .rcb .pay-method-header{display:flex;align-items:center;gap:11px;margin-bottom:14px}
  .rcb .pay-icon{width:36px;height:36px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}

  .rcb .share-box{background:var(--bg-secondary);border:0.5px solid var(--bdr-tertiary);border-radius:var(--r-md);padding:10px 13px;display:flex;align-items:center;gap:8px}
  .rcb .share-url{flex:1;font-size:12.5px;color:var(--txt-secondary);font-family:var(--f-mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

  .rcb .check-row{display:flex;align-items:center;gap:10px}
  .rcb .check-row-dot{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .rcb .check-row-dot.ok{background:var(--bg-success);color:var(--txt-success)}

  .rcb .icon-btn{width:32px;height:32px;border-radius:var(--r-md);background:transparent;border:0.5px solid var(--bdr-tertiary);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .12s;color:var(--txt-secondary)}
  .rcb .icon-btn:hover{background:var(--bg-secondary);border-color:var(--bdr-secondary);color:var(--txt-primary)}
  .rcb .icon-btn-sm{width:26px;height:26px}

  .rcb .confetti-piece{position:fixed;width:7px;height:7px;animation:rcbConfettiFall linear forwards;z-index:9999;pointer-events:none}
  @keyframes rcbConfettiFall{0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
  `}</style>
);

/* helpers */
const STEPS = ["Profile setup", "Packages", "Payment", "Edit card", "Publish"];

function compact(value) {
  const n = parseInt(String(value).replace(/,/g, ""), 10);
  if (!Number.isFinite(n)) return value || "";
  return n >= 1000 ? Math.round(n / 1000) + "K" : String(n);
}

function initials(name) {
  const parts = name.trim().split(/\s+/);
  const i = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  return i.toUpperCase() || "?";
}

const PLATFORM_ICON = {
  instagram: IconBrandInstagram,
  tiktok: IconBrandTiktok,
  youtube: IconBrandYoutube,
  twitter: IconBrandX,
  podcast: IconMicrophone,
};

/* stepper */
function Stepper({ current }) {
  return (
    <div className="stepper">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "active" : "pending";
        return (
          <div className="st-item" key={label}>
            <div className="st-col">
              <div className={`st-circle ${state}`}>
                {state === "done" ? <IconCheck size={11} /> : n}
              </div>
              <div className={`st-label ${state}`}>{label}</div>
            </div>
            {i < STEPS.length - 1 && <div className={`st-line ${state === "done" ? "done" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
}

/* live preview card */
function RateCardPreview({ profile, platforms, packages, headline, pitch, leadTime, availability }) {
  const activePlats = Object.entries(platforms).filter(([, on]) => on).map(([k]) => k);
  return (
    <div className="rcp">
      <div className="rcp-top">
        <div className="av av-md av-accent">{initials(profile.name)}</div>
        <div className="rcp-name">{headline || profile.name}</div>
        <div className="rcp-handle">@{profile.handle || "handle"} &middot; {profile.location}</div>
        {pitch && <div style={{ fontSize: 10.5, color: "var(--txt-tertiary)", marginTop: 5, lineHeight: 1.4 }}>{pitch}</div>}
        {(leadTime || availability) && (
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {availability && (
              <span className="tag tag-success" style={{ fontSize: 10 }}>
                <span className="sdot" style={{ background: "var(--green-400)" }} />{availability}
              </span>
            )}
            {leadTime && <span className="tag tag-default" style={{ fontSize: 10 }}>{leadTime}</span>}
          </div>
        )}
        <div className="rcp-plats">
          {activePlats.map((p) => {
            const Icon = PLATFORM_ICON[p];
            return <div className="rcp-plat" key={p}><Icon size={12} /></div>;
          })}
        </div>
      </div>
      <div className="rcp-stats">
        <div className="rcp-stat"><div className="rcp-stat-n">{compact(profile.followers)}</div><div className="rcp-stat-l">Followers</div></div>
        <div className="rcp-stat"><div className="rcp-stat-n">{profile.engagement}%</div><div className="rcp-stat-l">Engagement</div></div>
        <div className="rcp-stat"><div className="rcp-stat-n">{compact(profile.reach)}</div><div className="rcp-stat-l">Avg reach</div></div>
      </div>
      <div className="rcp-bio">{profile.bio}</div>
      <div className="rcp-pkgs">
        <div className="rcp-pkg-label">Packages</div>
        <div className="rcp-pkg-list">
          {packages.length === 0 ? (
            <div style={{ fontSize: 11, color: "var(--txt-tertiary)", textAlign: "center", padding: "10px 0" }}>No packages yet&hellip;</div>
          ) : (
            packages.map((p) => (
              <div className={`rcp-pkg${p.feat ? " feat" : ""}`} key={p.id}>
                <div className="rcp-pkg-name">{p.name}</div>
                <div className="rcp-pkg-price">KES {compact(p.price)}</div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="rcp-footer">
        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}><IconMessageCircle size={12} />Enquire</button>
        <button className="btn btn-accent btn-sm" style={{ flex: 1 }}>Book now</button>
      </div>
    </div>
  );
}

/* confetti */
function launchConfetti() {
  const cols = ["#534AB7", "#5DCAA5", "#EF9F27", "#E24B4A", "#D4537E", "#378ADD"];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.style.cssText = `left:${Math.random() * 100}vw;background:${cols[i % cols.length]};border-radius:${Math.random() > 0.5 ? "50%" : "2px"};animation-duration:${1.2 + Math.random() * 1.4}s;animation-delay:${Math.random() * 0.5}s;width:${5 + Math.random() * 5}px;height:${5 + Math.random() * 5}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 3000);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════ */
export default function RateCardBuilderPage() {
  usePageMeta('Rate Card Builder', 'Build and publish your rate card on Creatorske.');
  const [step, setStep] = useState(1);

  // profile (step 1)
  const [profile, setProfile] = useState({
    name: "Amara Osei",
    handle: "amaracreates",
    bio: "Lifestyle & travel creator based in Nairobi, partnering with brands that align with authentic storytelling.",
    location: "Nairobi, Kenya",
    followers: "240,000",
    engagement: "4.8",
    reach: "18,000",
    niche: "Lifestyle",
    languages: "English, Swahili",
  });
  const [platforms, setPlatforms] = useState({ instagram: true, tiktok: true, youtube: false, twitter: false, podcast: false });
  const [uploaded, setUploaded] = useState(false);
  const togglePlatform = (key) => setPlatforms((p) => ({ ...p, [key]: !p[key] }));
  const simulateUpload = () => { setUploaded(true); setTimeout(() => setUploaded(false), 2000); };

  // packages (step 2)
  const [packages, setPackages] = useState([
    { id: 1, name: "Reel + Caption", price: "22,000", desc: "1 × 60s reel, caption & hashtags", feat: true },
    { id: 2, name: "Story Post", price: "8,000", desc: "3 story slides with swipe-up link", feat: false },
    { id: 3, name: "Brand Partnership", price: "55,000", desc: "Dedicated reel + 2 stories + usage rights", feat: false },
  ]);
  const addPackage = () => {
    if (packages.length >= 5) return;
    setPackages((p) => [...p, { id: Date.now(), name: "New package", price: "0", desc: "Describe what's included", feat: false }]);
  };
  const removePackage = (id) => setPackages((p) => p.filter((pkg) => pkg.id !== id));
  const updatePackage = (id, field, value) => setPackages((p) => p.map((pkg) => (pkg.id === id ? { ...pkg, [field]: value } : pkg)));

  // payment (step 3)
  const [mpesaPhone, setMpesaPhone] = useState("712 345 678");
  const [mpesaBusiness, setMpesaBusiness] = useState("Amara Osei");
  const [airtelConnected, setAirtelConnected] = useState(false);
  const [airtelLoading, setAirtelLoading] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [whatsappReminder, setWhatsappReminder] = useState(true);
  const connectAirtel = () => {
    setAirtelLoading(true);
    setTimeout(() => { setAirtelLoading(false); setAirtelConnected(true); }, 1200);
  };

  // edit card (step 4)
  const [headline, setHeadline] = useState("Amara Osei · Lifestyle & Travel Creator");
  const [pitch, setPitch] = useState("East Africa's go-to creator for authentic brand stories.");
  const [leadTime, setLeadTime] = useState("3–5 business days");
  const [availability, setAvailability] = useState("Open for collabs");
  const [usageNote, setUsageNote] = useState("Usage rights for digital channels included for 6 months from delivery date.");
  const [revisionPolicy, setRevisionPolicy] = useState("1 round of revisions included");
  const [showPricing, setShowPricing] = useState(true);

  // publish (step 5)
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const slug = `creatorske.com/${profile.handle.toLowerCase().replace(/\s/g, "")}`;
  const doPublish = () => {
    setPublishing(true);
    setTimeout(() => { setPublishing(false); setPublished(true); launchConfetti(); }, 1600);
  };
  const copyLink = () => {
    navigator.clipboard?.writeText("https://" + slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const next = () => setStep((s) => Math.min(5, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const previewProps = { profile, platforms, packages, headline: undefined, pitch: undefined, leadTime: undefined, availability: undefined };

  return (
    <div className="rcb" style={{ minHeight: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
      <Tokens />
      <div className="bs">
        {/* header / stepper */}
        <div className="btop">
          <div className="btop-inner">
            <div className="bptitle">
              {["Set up your profile", "Your packages", "Payment setup", "Edit rate card", "Preview & publish"][step - 1]}
            </div>
            <div className="bpsub">
              {[
                "This appears on your public rate card, make it count.",
                "Define what you offer. Add up to 5 packages. Brands will compare and pick.",
                "Choose how you want to receive payments from brands and clients.",
                "Fine-tune your card before it goes live. Changes sync to your preview instantly.",
                "Review everything and go live. You can always edit after publishing.",
              ][step - 1]}
            </div>
            <div style={{ height: 16 }} />
            <Stepper current={step} />
          </div>
        </div>

        {/* body */}
        <div className="bbody">
          {/* STEP 1: PROFILE */}
          {step === 1 && (
            <div className="bsplit">
              <div className="bento">
                <div className="card card-p">
                  <p className="label" style={{ marginBottom: 12 }}>Profile photo</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div className="av av-xl av-accent">{initials(profile.name)}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      <button className="btn btn-secondary btn-sm" onClick={simulateUpload}>
                        {uploaded ? <><IconCheck size={12} />Photo uploaded</> : <><IconUpload size={12} />IconUpload photo</>}
                      </button>
                      <p className="hint">JPG, PNG or GIF &middot; max 2 MB &middot; 400&times;400 px</p>
                    </div>
                  </div>
                </div>

                <div className="card card-p">
                  <p className="label">Your platforms</p>
                  <p className="hint" style={{ margin: "4px 0 12px" }}>Select all platforms you are active on</p>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {[
                      ["instagram", "Instagram", IconBrandInstagram],
                      ["tiktok", "TikTok", IconBrandTiktok],
                      ["youtube", "YouTube", IconBrandYoutube],
                      ["twitter", "Twitter / X", IconBrandX],
                      ["podcast", "Podcast", IconMicrophone],
                    ].map(([key, label, Icon]) => (
                      <button key={key} className={`plat-btn${platforms[key] ? " on" : ""}`} onClick={() => togglePlatform(key)}>
                        <Icon size={14} />{label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card card-p span2">
                  <p className="label" style={{ marginBottom: 14 }}>Basic info</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="g2">
                      <div className="field">
                        <label className="label req">Display name</label>
                        <input className="inp" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                      </div>
                      <div className="field">
                        <label className="label req">Handle</label>
                        <div className="inp-wrap">
                          <span className="inp-pre">@</span>
                          <input className="inp" style={{ paddingLeft: 20 }} value={profile.handle} onChange={(e) => setProfile({ ...profile, handle: e.target.value })} />
                        </div>
                      </div>
                    </div>
                    <div className="field">
                      <label className="label req">Bio / tagline</label>
                      <textarea className="inp ta" rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                      <p className="hint">140 characters max</p>
                    </div>
                    <div className="field">
                      <label className="label">Location</label>
                      <div className="inp-wrap">
                        <span className="inp-icon l"><IconMapPin size={14} /></span>
                        <input className="inp inp-icon-l" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card card-p span2">
                  <p className="label">Audience stats</p>
                  <p className="hint" style={{ margin: "4px 0 14px" }}>Shown on your rate card to build trust with brands</p>
                  <div className="g3">
                    <div className="field">
                      <label className="label">Total followers</label>
                      <input className="inp" value={profile.followers} onChange={(e) => setProfile({ ...profile, followers: e.target.value })} />
                    </div>
                    <div className="field">
                      <label className="label">Avg engagement</label>
                      <div className="inp-wrap">
                        <input className="inp inp-icon-r" value={profile.engagement} onChange={(e) => setProfile({ ...profile, engagement: e.target.value })} />
                        <span className="inp-icon r" style={{ fontSize: 12, fontWeight: 600 }}>%</span>
                      </div>
                    </div>
                    <div className="field">
                      <label className="label">Monthly reach</label>
                      <input className="inp" value={profile.reach} onChange={(e) => setProfile({ ...profile, reach: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="card card-p span2">
                  <p className="label" style={{ marginBottom: 12 }}>Niche &amp; content</p>
                  <div className="g2">
                    <div className="field">
                      <label className="label req">Primary niche</label>
                      <div className="sel-wrap">
                        <select className="inp" value={profile.niche} onChange={(e) => setProfile({ ...profile, niche: e.target.value })}>
                          {["Lifestyle", "Travel", "Fashion & Beauty", "Tech", "Food & Beverage", "Fitness & Health", "Finance", "Gaming", "Education"].map((o) => <option key={o}>{o}</option>)}
                        </select>
                        <span className="chev"><IconChevronDown size={13} /></span>
                      </div>
                    </div>
                    <div className="field">
                      <label className="label">Content languages</label>
                      <div className="inp-wrap">
                        <span className="inp-icon l"><IconLanguage size={14} /></span>
                        <input className="inp inp-icon-l" value={profile.languages} onChange={(e) => setProfile({ ...profile, languages: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rcp-preview-col">
                <p className="label" style={{ marginBottom: 10 }}>Live preview</p>
                <RateCardPreview profile={profile} platforms={platforms} packages={packages} />
                <p className="hint" style={{ marginTop: 7, textAlign: "center" }}>Updates as you type</p>
              </div>
            </div>
          )}

          {/* STEP 2: PACKAGES */}
          {step === 2 && (
            <div className="bsplit">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {packages.map((pkg) => (
                    <div className={`pkg-card${pkg.feat ? " feat-card" : ""}`} key={pkg.id}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span className="pkg-drag-handle"><IconGripVertical size={14} /></span>
                        <div style={{ flex: 1, fontFamily: "var(--f-head)", fontSize: 14, fontWeight: 600 }}>{pkg.name}</div>
                        {pkg.feat && <span className="tag tag-accent">Featured</span>}
                        <button className="icon-btn icon-btn-sm" onClick={() => removePackage(pkg.id)}>
                          <IconTrash size={12} color="var(--red-400)" />
                        </button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div className="g2">
                          <div className="field">
                            <label className="label req">Package name</label>
                            <input className="inp" value={pkg.name} onChange={(e) => updatePackage(pkg.id, "name", e.target.value)} />
                          </div>
                          <div className="field">
                            <label className="label req">Price (KES)</label>
                            <div className="inp-wrap">
                              <span className="inp-pre">KES</span>
                              <input className="inp" style={{ paddingLeft: 40 }} value={pkg.price} onChange={(e) => updatePackage(pkg.id, "price", e.target.value)} />
                            </div>
                          </div>
                        </div>
                        <div className="field">
                          <label className="label">Description</label>
                          <input className="inp" value={pkg.desc} onChange={(e) => updatePackage(pkg.id, "desc", e.target.value)} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button className={`toggle${pkg.feat ? " on" : ""}`} onClick={() => updatePackage(pkg.id, "feat", !pkg.feat)} />
                          <span style={{ fontSize: 12.5, color: "var(--txt-secondary)" }}>Mark as featured (highlighted on card)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bento">
                  <div className="card-dash card-p" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 58 }} onClick={addPackage}>
                    <IconPlus size={16} color="var(--txt-tertiary)" />
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--txt-secondary)" }}>Add another package</span>
                  </div>
                  <div className="alert alert-info">
                    <IconInfoCircle size={16} />
                    <div className="alert-body"><div className="alert-title">Pro tip</div>Brands respond best to 2–4 clear packages. Keep names short and prices specific.</div>
                  </div>
                </div>
              </div>

              <div className="rcp-preview-col">
                <p className="label" style={{ marginBottom: 10 }}>Live preview</p>
                <RateCardPreview profile={profile} platforms={platforms} packages={packages} />
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 3 && (
            <div style={{ maxWidth: 700, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="alert alert-info">
                <IconShieldCheck size={16} />
                <div className="alert-body"><div className="alert-title">Secure &amp; encrypted</div>All payment details are stored securely. Creatorske never stores full card credentials.</div>
              </div>

              <div className="pay-method active-method">
                <div className="pay-method-header">
                  <div className="pay-icon" style={{ background: "#00a651" }}><IconDeviceMobile size={17} color="#fff" /></div>
                  <div style={{ flex: 1 }}><div style={{ fontFamily: "var(--f-head)", fontSize: 14, fontWeight: 600 }}>M-Pesa</div><p className="hint">Safaricom mobile money</p></div>
                  <span className="tag tag-success"><span className="sdot" style={{ background: "var(--green-400)" }} />Connected</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  <div className="field">
                    <label className="label req">M-Pesa phone number</label>
                    <div className="inp-wrap"><span className="inp-pre">+254</span><input className="inp" style={{ paddingLeft: 44 }} value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} /></div>
                  </div>
                  <div className="field">
                    <label className="label">Business name on M-Pesa</label>
                    <input className="inp" value={mpesaBusiness} onChange={(e) => setMpesaBusiness(e.target.value)} />
                    <p className="hint">Displayed to clients when they pay</p>
                  </div>
                </div>
              </div>

              <div className={`pay-method${airtelConnected ? " active-method" : ""}`}>
                <div className="pay-method-header">
                  <div className="pay-icon" style={{ background: "#e40000" }}><IconDeviceMobile size={17} color="#fff" /></div>
                  <div style={{ flex: 1 }}><div style={{ fontFamily: "var(--f-head)", fontSize: 14, fontWeight: 600 }}>Airtel Money</div><p className="hint">Airtel mobile money</p></div>
                  {airtelConnected ? (
                    <span className="tag tag-success"><span className="sdot" style={{ background: "var(--green-400)" }} />Connected</span>
                  ) : (
                    <button className="btn btn-ghost btn-sm" disabled={airtelLoading} onClick={connectAirtel}>{airtelLoading ? "Connecting…" : "Connect"}</button>
                  )}
                </div>
                <div className="field">
                  <label className="label">Airtel phone number</label>
                  <div className="inp-wrap"><span className="inp-pre">+254</span><input className="inp" style={{ paddingLeft: 44 }} placeholder="7XX XXX XXX" /></div>
                </div>
              </div>

              <div className="pay-method">
                <div className="pay-method-header">
                  <div className="pay-icon" style={{ background: "var(--bg-secondary)" }}><IconBuilding size={17} color="var(--txt-secondary)" /></div>
                  <div style={{ flex: 1 }}><div style={{ fontFamily: "var(--f-head)", fontSize: 14, fontWeight: 600 }}>Bank transfer</div><p className="hint">Local &amp; international wire</p></div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setBankOpen((o) => !o)}>{bankOpen ? "Hide" : "Add details"}</button>
                </div>
                {bankOpen && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                    <div className="g2">
                      <div className="field">
                        <label className="label">Bank name</label>
                        <div className="sel-wrap">
                          <select className="inp" defaultValue="">
                            <option value="" disabled>Select bank</option>
                            {["Equity Bank", "KCB Bank", "Co-operative Bank", "NCBA", "Stanbic Bank", "Other"].map((b) => <option key={b}>{b}</option>)}
                          </select>
                          <span className="chev"><IconChevronDown size={13} /></span>
                        </div>
                      </div>
                      <div className="field"><label className="label">Account number</label><input className="inp" placeholder="e.g. 0123456789" /></div>
                    </div>
                    <div className="field"><label className="label">Account name</label><input className="inp" placeholder="Full name as on the account" /></div>
                  </div>
                )}
              </div>

              <div className="card card-p">
                <p className="label" style={{ marginBottom: 14 }}>Invoice preferences</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div><div style={{ fontSize: 13.5, fontWeight: 500 }}>Auto-send invoice on booking</div><p className="hint">Automatically email invoice when a client books</p></div>
                    <button className={`toggle${autoInvoice ? " on" : ""}`} onClick={() => setAutoInvoice((v) => !v)} />
                  </div>
                  <div className="hr" />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div><div style={{ fontSize: 13.5, fontWeight: 500 }}>Require 50% deposit</div><p className="hint">Client pays half upfront before work begins</p></div>
                    <button className={`toggle${requireDeposit ? " on" : ""}`} onClick={() => setRequireDeposit((v) => !v)} />
                  </div>
                  <div className="hr" />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div><div style={{ fontSize: 13.5, fontWeight: 500 }}>WhatsApp payment reminder</div><p className="hint">Send a WhatsApp nudge 24 hrs before due date</p></div>
                    <button className={`toggle${whatsappReminder ? " on" : ""}`} onClick={() => setWhatsappReminder((v) => !v)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: EDIT CARD */}
          {step === 4 && (
            <div className="bsplit">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="card card-p">
                  <p className="label" style={{ marginBottom: 14 }}>Card header</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="field">
                      <label className="label">Headline</label>
                      <input className="inp" value={headline} onChange={(e) => setHeadline(e.target.value)} />
                      <p className="hint">Appears at the top of your published card</p>
                    </div>
                    <div className="field">
                      <label className="label">Short pitch</label>
                      <textarea className="inp ta" rows={2} value={pitch} onChange={(e) => setPitch(e.target.value)} />
                    </div>
                    <div className="g2">
                      <div className="field">
                        <label className="label">Booking lead time</label>
                        <div className="sel-wrap">
                          <select className="inp" value={leadTime} onChange={(e) => setLeadTime(e.target.value)}>
                            {["3–5 business days", "1 week", "2 weeks", "1 month"].map((o) => <option key={o}>{o}</option>)}
                          </select>
                          <span className="chev"><IconChevronDown size={13} /></span>
                        </div>
                      </div>
                      <div className="field">
                        <label className="label">Availability</label>
                        <div className="sel-wrap">
                          <select className="inp" value={availability} onChange={(e) => setAvailability(e.target.value)}>
                            {["Open for collabs", "Limited slots", "Fully booked"].map((o) => <option key={o}>{o}</option>)}
                          </select>
                          <span className="chev"><IconChevronDown size={13} /></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card card-p">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <p className="label">Package order &amp; visibility</p>
                    <button className="btn btn-ghost btn-xs" onClick={() => setStep(2)}><IconPencil size={11} />Edit packages</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {packages.map((pkg) => (
                      <div key={pkg.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: pkg.feat ? "var(--accent-light)" : "var(--bg-secondary)", border: `0.5px solid ${pkg.feat ? "var(--accent-border)" : "var(--bdr-tertiary)"}`, borderRadius: "var(--r-md)" }}>
                        <span style={{ color: "var(--txt-tertiary)", display: "flex", cursor: "grab" }}><IconGripVertical size={14} /></span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{pkg.name}</div>
                          <div style={{ fontSize: 11.5, color: "var(--txt-tertiary)" }}>KES {pkg.price}{pkg.feat ? " · Featured" : ""}</div>
                        </div>
                        {pkg.feat && <span className="tag tag-accent">Featured</span>}
                        <button className="icon-btn icon-btn-sm"><IconEye size={13} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card card-p">
                  <p className="label" style={{ marginBottom: 14 }}>Contact &amp; social links</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                    <div className="field">
                      <label className="label">WhatsApp business number</label>
                      <div className="inp-wrap"><span className="inp-icon l"><IconMessageCircle size={14} color="#25D366" /></span><input className="inp inp-icon-l" defaultValue="+254 712 345 678" /></div>
                    </div>
                    <div className="field">
                      <label className="label">Instagram</label>
                      <div className="inp-wrap"><span className="inp-icon l"><IconBrandInstagram size={14} /></span><input className="inp inp-icon-l" defaultValue="instagram.com/amaracreates" /></div>
                    </div>
                    <div className="field">
                      <label className="label">TikTok</label>
                      <div className="inp-wrap"><span className="inp-icon l"><IconBrandTiktok size={14} /></span><input className="inp inp-icon-l" defaultValue="tiktok.com/@amaracreates" /></div>
                    </div>
                    <div className="g2">
                      <div className="field">
                        <label className="label">YouTube</label>
                        <div className="inp-wrap"><span className="inp-icon l"><IconBrandYoutube size={14} /></span><input className="inp inp-icon-l" placeholder="youtube.com/…" /></div>
                      </div>
                      <div className="field">
                        <label className="label">Twitter / X</label>
                        <div className="inp-wrap"><span className="inp-icon l"><IconBrandX size={14} /></span><input className="inp inp-icon-l" placeholder="x.com/…" /></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card card-p">
                  <p className="label" style={{ marginBottom: 14 }}>Terms &amp; conditions</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                    <div className="field">
                      <label className="label">Custom usage rights note</label>
                      <textarea className="inp ta" rows={2} value={usageNote} onChange={(e) => setUsageNote(e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="label">Revision policy</label>
                      <div className="sel-wrap">
                        <select className="inp" value={revisionPolicy} onChange={(e) => setRevisionPolicy(e.target.value)}>
                          {["1 round of revisions included", "2 rounds included", "No revisions", "Unlimited revisions"].map((o) => <option key={o}>{o}</option>)}
                        </select>
                        <span className="chev"><IconChevronDown size={13} /></span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div><div style={{ fontSize: 13.5, fontWeight: 500 }}>Show KES pricing on card</div><p className="hint">Uncheck to show &ldquo;Price on request&rdquo; instead</p></div>
                      <button className={`toggle${showPricing ? " on" : ""}`} onClick={() => setShowPricing((v) => !v)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rcp-preview-col">
                <p className="label" style={{ marginBottom: 10 }}>Live preview</p>
                <div className="rcp">
                  <div className="rcp-top">
                    <div className="av av-md av-accent">{initials(profile.name)}</div>
                    <div className="rcp-name" style={{ fontSize: 13.5 }}>{headline}</div>
                    <div className="rcp-handle">@{profile.handle} &middot; {profile.location}</div>
                    <div style={{ fontSize: 10.5, color: "var(--txt-tertiary)", marginTop: 5, lineHeight: 1.4 }}>{pitch}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                      <span className="tag tag-success" style={{ fontSize: 10 }}><span className="sdot" style={{ background: "var(--green-400)" }} />{availability}</span>
                      <span className="tag tag-default" style={{ fontSize: 10 }}>{leadTime} lead time</span>
                    </div>
                  </div>
                  <div className="rcp-stats">
                    <div className="rcp-stat"><div className="rcp-stat-n">{compact(profile.followers)}</div><div className="rcp-stat-l">Followers</div></div>
                    <div className="rcp-stat"><div className="rcp-stat-n">{profile.engagement}%</div><div className="rcp-stat-l">Engagement</div></div>
                    <div className="rcp-stat"><div className="rcp-stat-n">{compact(profile.reach)}</div><div className="rcp-stat-l">Avg reach</div></div>
                  </div>
                  <div className="rcp-bio">{profile.bio}</div>
                  <div className="rcp-pkgs">
                    <div className="rcp-pkg-label">Packages</div>
                    <div className="rcp-pkg-list">
                      {packages.map((pkg) => (
                        <div className={`rcp-pkg${pkg.feat ? " feat" : ""}`} key={pkg.id}>
                          <div>
                            <div className="rcp-pkg-name">{pkg.name}</div>
                            <div style={{ fontSize: 9, color: "var(--txt-tertiary)", marginTop: 1 }}>{pkg.desc}</div>
                          </div>
                          <div className="rcp-pkg-price">{showPricing ? `KES ${compact(pkg.price)}` : "On request"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: "10px 12px", borderTop: "0.5px solid var(--bdr-tertiary)", display: "flex", gap: 5, alignItems: "center" }}>
                    <IconBrandInstagram size={14} color="var(--txt-secondary)" />
                    <IconBrandTiktok size={14} color="var(--txt-secondary)" />
                    <IconMessageCircle size={14} color="var(--txt-secondary)" />
                    <span style={{ fontSize: 10, color: "var(--txt-tertiary)", marginLeft: 4 }}>Usage rights &middot; {revisionPolicy.split(" ").slice(0, 2).join(" ")}</span>
                  </div>
                  <div className="rcp-footer">
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}><IconMessageCircle size={12} />Enquire</button>
                    <button className="btn btn-accent btn-sm" style={{ flex: 1 }}>Book now</button>
                  </div>
                </div>
                <p className="hint" style={{ marginTop: 7, textAlign: "center" }}>Updates as you type</p>
              </div>
            </div>
          )}

          {/* STEP 5: PUBLISH */}
          {step === 5 && (
            <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card card-p">
                <p className="label" style={{ marginBottom: 14 }}>Readiness check</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    "Profile setup complete",
                    `${packages.length} package${packages.length === 1 ? "" : "s"} added`,
                    "M-Pesa payment connected",
                    "Rate card edited & reviewed",
                  ].map((label, i) => (
                    <React.Fragment key={label}>
                      <div className="check-row">
                        <div className="check-row-dot ok"><IconCheck size={10} /></div>
                        <span style={{ fontSize: 13, flex: 1 }}>{label}</span>
                        <span className="tag tag-success"><span className="sdot" style={{ background: "var(--green-400)" }} />Done</span>
                      </div>
                      {i < 3 && <div className="hr" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="card card-p">
                <p className="label" style={{ marginBottom: 12 }}>Your public link</p>
                <div className="share-box">
                  <IconLink size={14} color="var(--txt-tertiary)" />
                  <span className="share-url">{slug}</span>
                  <button className="btn btn-ghost btn-xs" onClick={copyLink}>{copied ? <><IconCheck size={11} />Copied!</> : <><IconCopy size={11} />IconCopy</>}</button>
                </div>
                <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Check out my rate card: https://" + slug)}`, "_blank")}>
                    <IconMessageCircle size={12} />Share on WhatsApp
                  </button>
                </div>
              </div>

              {published ? (
                <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 32, textAlign: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--bg-success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconCheck size={24} color="var(--txt-success)" />
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--f-head)", fontSize: 20, fontWeight: 600, marginBottom: 4 }}>You're live!</div>
                    <p style={{ fontSize: 13, color: "var(--txt-secondary)" }}>Your rate card is published and ready to share with brands.</p>
                  </div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center" }}>
                    <button className="btn btn-secondary btn-sm" onClick={copyLink}><IconCopy size={12} />IconCopy link</button>
                    <button className="btn btn-ghost btn-sm"><IconLayoutDashboard size={12} />Go to dashboard</button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-accent btn-full" style={{ padding: 13 }} disabled={publishing} onClick={doPublish}>
                  <IconRocket size={15} />{publishing ? "Publishing…" : "Publish rate card"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="bfooter">
          <div className="bfooter-inner">
            {step > 1 ? (
              <button className="btn btn-ghost" onClick={back}><IconArrowLeft size={13} />Back</button>
            ) : <div />}
            <div style={{ display: "flex", gap: 7 }}>
              {step < 5 && <button className="btn btn-ghost">Save draft</button>}
              {step === 5 ? (
                <button className="btn btn-ghost">Save draft</button>
              ) : (
                <button className="btn btn-primary" onClick={next}>Save &amp; continue<IconArrowRight size={13} /></button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}