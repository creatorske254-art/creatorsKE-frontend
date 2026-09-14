import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { usePageMeta } from '@/lib/usePageMeta';
import { useRateCard, useRateCards } from '@/features/rate-card/hooks/useRateCard';
import { useImageUpload } from '@/lib/useImageUpload';
import { useProfile } from '@/features/auth/hooks/useProfile';
import { usePayoutMethods } from '@/features/payments/hooks/usePayoutMethods';
import {
  IconArrowLeft, IconArrowRight, IconUpload, IconMapPin, IconBrandInstagram, IconBrandYoutube, IconBrandTiktok,
  IconBrandX, IconMicrophone, IconMessageCircle, IconLanguage, IconShieldCheck, IconDeviceMobile,
  IconBuilding, IconInfoCircle, IconCheck, IconRocket, IconLink, IconCopy, IconGripVertical, IconTrash,
  IconEye, IconEyeOff, IconPencil, IconPlus, IconLayoutDashboard,
  IconUser, IconUsers, IconPackage, IconAlignLeft, IconBuildingStore, IconHash, IconHeading, IconWorld
} from "@tabler/icons-react";
import Select from '@/components/ui/Select';
import SmartImage from '@/components/ui/SmartImage';
import { useQueryClient } from '@tanstack/react-query';
import { rateCardService } from '@/features/rate-card/services/rate-card.service';

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
  .rcb .btop{background:var(--bg-primary);border-bottom:0.5px solid var(--bdr-tertiary);padding:var(--space-16) var(--space-32);border-radius:var(--r-xl) var(--r-xl) 0 0}
  .rcb .btop-inner{max-width:1080px;margin:0 auto}
  .rcb .bbody{flex:1;padding:var(--space-32) 0;width:100%;display:flex;flex-direction:column;gap:var(--space-16)}
  .rcb .bfooter{background:var(--bg-primary);border-top:0.5px solid var(--bdr-tertiary);padding:var(--space-12) var(--space-32);position:sticky;bottom:0;z-index:100;border-radius:0 0 var(--r-xl) var(--r-xl)}
  .rcb .bfooter-inner{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:var(--space-8)}
  .rcb .bsplit{display:grid;grid-template-columns:1fr 280px;gap:var(--space-24);align-items:start}
  .rcb .bento{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-16);align-items:start}
  .rcb .bento>.span2{grid-column:1 / -1}
  @media(max-width:860px){.rcb .bsplit{grid-template-columns:1fr}.rcb .rcp-preview-col{display:none}.rcb .g3,.rcb .g4{grid-template-columns:1fr 1fr}}
  @media(max-width:600px){.rcb .bbody{padding:var(--space-16) 0}.rcb .btop{padding:var(--space-16)}.rcb .bfooter{padding:var(--space-12) var(--space-12)}.rcb .g2,.rcb .g3,.rcb .g4,.rcb .bento{grid-template-columns:1fr}}

  .rcb .stepper{display:flex;align-items:flex-start;flex-wrap:wrap}
  .rcb .st-item{display:flex;align-items:center}
  .rcb .st-col{display:flex;flex-direction:column;align-items:center}
  .rcb .st-circle{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0;transition:all .2s;font-family:var(--f-head)}
  .rcb .st-circle.done{background:var(--txt-primary);color:var(--bg-primary)}
  .rcb .st-circle.active{background:var(--accent);color:#fff;box-shadow:0 0 0 3px var(--accent-light)}
  .rcb .st-circle.pending{background:var(--bg-primary);color:var(--txt-tertiary);border:0.5px solid var(--bdr-secondary)}
  .rcb .st-line{width:40px;height:0.5px;background:var(--bdr-secondary);margin:0 var(--space-4);margin-top:var(--space-12)}
  .rcb .st-line.done{background:var(--txt-primary)}
  .rcb .st-label{font-size:10px;font-weight:500;margin-top:var(--space-4);text-align:center;white-space:nowrap;letter-spacing:.02em}
  .rcb .st-label.done{color:var(--txt-primary)}.rcb .st-label.active{color:var(--accent)}.rcb .st-label.pending{color:var(--txt-tertiary)}

  .rcb .btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--space-4);border:none;cursor:pointer;font-family:var(--f-body);font-weight:500;transition:all .12s;white-space:nowrap;line-height:1}
  .rcb .btn-primary{background:var(--txt-primary);color:var(--bg-primary);border-radius:var(--r-md);font-size:13px;padding:var(--space-8) var(--space-20)}
  .rcb .btn-primary:hover{opacity:.88;transform:translateY(-1px)}
  .rcb .btn-secondary{background:var(--bg-primary);color:var(--txt-primary);border-radius:var(--r-md);font-size:13px;padding:var(--space-8) var(--space-20);border:0.5px solid var(--bdr-secondary)}
  .rcb .btn-secondary:hover{border-color:var(--bdr-primary);background:var(--bg-secondary)}
  .rcb .btn-accent{background:var(--accent);color:#fff;border-radius:var(--r-md);font-size:13px;padding:var(--space-8) var(--space-20)}
  .rcb .btn-accent:hover{opacity:.9;transform:translateY(-1px)}
  .rcb .btn-ghost{background:transparent;color:var(--txt-secondary);border-radius:var(--r-md);font-size:13px;padding:var(--space-8) var(--space-20);border:0.5px solid var(--bdr-secondary)}
  .rcb .btn-ghost:hover{color:var(--txt-primary);border-color:var(--bdr-primary);background:var(--bg-secondary)}
  .rcb .btn-sm{padding:var(--space-4) var(--space-12);font-size:12px}
  .rcb .btn-xs{padding:var(--space-4) var(--space-8);font-size:11px}
  .rcb .btn-full{width:100%;justify-content:center}
  .rcb .btn:disabled{pointer-events:none;opacity:.6}

  .rcb .field{display:flex;flex-direction:column;gap:var(--space-4)}
    .rcb .hint{font-size:12px;color:var(--txt-tertiary);line-height:1.5}
  .rcb .inp{width:100%;font-family:var(--f-body);font-size:13.5px;color:var(--txt-primary);background:var(--bg-secondary);border:0.5px solid var(--bdr-tertiary);outline:none;transition:border-color .12s,background-color .12s,box-shadow .12s;padding:var(--space-8) var(--space-12);border-radius:var(--r-md)}
  .rcb .inp::placeholder{color:var(--txt-tertiary)}
  .rcb .inp:hover{border-color:var(--bdr-secondary)}
  .rcb .inp:focus{border-color:var(--bdr-primary);background:var(--bg-primary);box-shadow:0 0 0 3px var(--accent-light)}
  .rcb .inp-wrap{position:relative}
  .rcb .inp-icon-l{padding-left:var(--space-32)!important}
  .rcb .inp-icon-r{padding-right:var(--space-32)!important}
  .rcb .inp-icon{position:absolute;top:50%;transform:translateY(-50%);color:var(--txt-tertiary);pointer-events:none;display:flex}
  .rcb .inp-icon.l{left:10px}.rcb .inp-icon.r{right:10px}
  .rcb .inp-pre{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:12px;font-weight:500;color:var(--txt-tertiary);pointer-events:none;white-space:nowrap}
  .rcb .sel-wrap{position:relative}
  .rcb .sel-wrap .chev{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:var(--txt-tertiary);pointer-events:none;display:flex}
  .rcb select.inp{appearance:none;padding-right:var(--space-32);cursor:pointer}
  .rcb .ta{resize:vertical;min-height:80px;line-height:1.65;font-family:var(--f-body)}
  .rcb .toggle{width:40px;height:21px;border-radius:999px;background:var(--bdr-secondary);position:relative;cursor:pointer;transition:background .18s;flex-shrink:0;border:none}
  .rcb .toggle.on{background:var(--accent)}
  .rcb .toggle::after{content:'';position:absolute;top:2.5px;left:2.5px;width:16px;height:16px;border-radius:50%;background:white;transition:transform .18s}
  .rcb .toggle.on::after{transform:translateX(19px)}

  .rcb .g2{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-12)}
  .rcb .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-12)}
  .rcb .hr{height:0.5px;background:var(--bdr-tertiary);margin:var(--space-4) 0}

  .rcb .tag{display:inline-flex;align-items:center;gap:var(--space-4);font-size:11px;font-weight:500;padding:var(--space-4) var(--space-8);border-radius:var(--r-md);line-height:1}
  .rcb .tag-accent{background:var(--accent-light);color:var(--accent-txt);border:0.5px solid var(--accent-border)}
  .rcb .tag-success{background:var(--bg-success);color:var(--txt-success);border:0.5px solid var(--bdr-success)}
  .rcb .tag-default{background:var(--bg-secondary);color:var(--txt-secondary);border:0.5px solid var(--bdr-tertiary)}
  .rcb .sdot{width:5px;height:5px;border-radius:50%;flex-shrink:0}

  .rcb .alert{display:flex;align-items:flex-start;gap:var(--space-8);padding:var(--space-12) var(--space-12);border-radius:var(--r-lg);font-size:12.5px;line-height:1.45}
  .rcb .alert svg{flex-shrink:0;margin-top:var(--space-2)}
  .rcb .alert-body{flex:1}
  .rcb .alert-title{font-weight:500;margin-bottom:var(--space-2);font-size:12.5px}
  .rcb .alert-info{background:var(--bg-info);color:var(--txt-info);border:0.5px solid var(--bdr-info)}

  .rcb .card{background:var(--bg-primary);border:0.5px solid var(--bdr-tertiary);border-radius:var(--r-xl);transition:border-color .12s}
  .rcb .card-p{padding:var(--space-20)}
  .rcb .card-dash{background:var(--bg-primary);border:0.5px dashed var(--bdr-secondary);border-radius:var(--r-xl);cursor:pointer;transition:all .15s}
  .rcb .card-dash:hover{border-color:var(--accent);background:var(--accent-light)}

  .rcb .plat-btn{display:flex;align-items:center;gap:var(--space-8);padding:var(--space-8) var(--space-12);border:0.5px solid var(--bdr-secondary);border-radius:var(--r-md);background:var(--bg-primary);cursor:pointer;font-family:var(--f-body);font-size:12.5px;font-weight:500;color:var(--txt-secondary);transition:all .12s}
  .rcb .plat-btn:hover{border-color:var(--bdr-primary);color:var(--txt-primary)}
  .rcb .plat-btn.on{border-color:var(--accent);background:var(--accent-light);color:var(--accent-txt)}

  .rcb .av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-family:var(--f-head);flex-shrink:0;letter-spacing:.04em}
  .rcb .av-md{width:40px;height:40px;font-size:13px}
  .rcb .av-xl{width:76px;height:76px;font-size:24px}
  .rcb .av-accent{background:var(--accent-light);color:var(--accent-txt);border:0.5px solid var(--accent-border)}

  .rcb .rcp{background:var(--bg-primary);border:0.5px solid var(--bdr-tertiary);border-radius:var(--r-xl);overflow:hidden;width:100%}
  .rcb .rcp-top{padding:var(--space-16) var(--space-16) var(--space-12);border-bottom:0.5px solid var(--bdr-tertiary)}
  .rcb .rcp-name{font-family:var(--f-head);font-size:16px;font-weight:600;color:var(--txt-primary);margin:var(--space-8) 0 var(--space-2);letter-spacing:-.01em;line-height:1.2}
  .rcb .rcp-handle{font-size:11px;color:var(--txt-tertiary)}
  .rcb .rcp-plats{display:flex;gap:var(--space-4);margin-top:var(--space-8)}
  .rcb .rcp-plat{width:22px;height:22px;border-radius:var(--r-md);border:0.5px solid var(--bdr-tertiary);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--txt-secondary)}
  .rcb .rcp-stats{display:flex;border-bottom:0.5px solid var(--bdr-tertiary)}
  .rcb .rcp-stat{flex:1;padding:var(--space-8) var(--space-12);text-align:center;border-right:0.5px solid var(--bdr-tertiary)}
  .rcb .rcp-stat:last-child{border-right:none}
  .rcb .rcp-stat-n{font-family:var(--f-head);font-size:15px;font-weight:600;color:var(--txt-primary);line-height:1}
  .rcb .rcp-stat-l{font-size:8px;text-transform:uppercase;letter-spacing:.07em;color:var(--txt-tertiary);margin-top:var(--space-2)}
  .rcb .rcp-bio{padding:var(--space-12) var(--space-12);font-size:11px;color:var(--txt-secondary);border-bottom:0.5px solid var(--bdr-tertiary);line-height:1.6}
  .rcb .rcp-pkgs{padding:var(--space-12)}
  .rcb .rcp-pkg-label{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.09em;color:var(--txt-tertiary);margin-bottom:var(--space-8)}
  .rcb .rcp-pkg-list{display:flex;flex-direction:column;gap:var(--space-4)}
  .rcb .rcp-pkg{display:flex;align-items:center;justify-content:space-between;padding:var(--space-8) var(--space-12);border:0.5px solid var(--bdr-tertiary);border-radius:var(--r-md)}
  .rcb .rcp-pkg.feat{border-color:var(--accent-border);background:var(--accent-light)}
  .rcb .rcp-pkg-name{font-size:11.5px;font-weight:500;color:var(--txt-primary)}
  .rcb .rcp-pkg-price{font-size:11.5px;font-weight:600;color:var(--accent)}
  .rcb .rcp-footer{padding:var(--space-12) var(--space-12);border-top:0.5px solid var(--bdr-tertiary);display:flex;gap:var(--space-8)}
  .rcb .rcp-preview-col{position:sticky;top:12px}

  .rcb .pkg-card{background:var(--bg-primary);border:0.5px solid var(--bdr-tertiary);border-radius:var(--r-xl);padding:var(--space-20);position:relative}
  .rcb .pkg-card.feat-card{border-color:var(--accent-border);background:var(--accent-light)}
  .rcb .pkg-drag-handle{cursor:grab;color:var(--txt-tertiary);display:flex}

  .rcb .pay-method{background:var(--bg-primary);border:0.5px solid var(--bdr-tertiary);border-radius:var(--r-xl);padding:var(--space-20);transition:all .18s}
  .rcb .pay-method.active-method{border-color:var(--accent-border);background:var(--accent-light)}
  .rcb .pay-method-header{display:flex;align-items:center;gap:var(--space-12);margin-bottom:var(--space-16)}
  .rcb .pay-icon{width:36px;height:36px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}

  .rcb .share-box{background:var(--bg-secondary);border:0.5px solid var(--bdr-tertiary);border-radius:var(--r-md);padding:var(--space-12) var(--space-12);display:flex;align-items:center;gap:var(--space-8)}
  .rcb .share-url{flex:1;font-size:12.5px;color:var(--txt-secondary);font-family:var(--f-mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

  .rcb .check-row{display:flex;align-items:center;gap:var(--space-12)}
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
                {state === "done" ? <IconCheck className="icon-xs" /> : n}
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

/* The preview card's CTAs mirror what brands will see; clicking them in the
   builder gets a clear answer instead of silently doing nothing. */
const previewOnly = () =>
  toast.info("This is a preview. Brands will use these buttons on your published rate card.");

/* live preview card */
function RateCardPreview({ profile, platforms, packages, headline, pitch, leadTime, availability }) {
  const activePlats = Object.entries(platforms).filter(([, on]) => on).map(([k]) => k);
  return (
    <div className="rcp">
      <div className="rcp-top">
        <SmartImage src={profile.photoUrl} className="av av-md" style={{ objectFit: "cover" }} fallback={<div className="av av-md av-accent">{initials(profile.name)}</div>} />
        <div className="rcp-name">{headline || profile.name}</div>
        <div className="rcp-handle">@{profile.handle || "handle"} &middot; {profile.location}</div>
        {pitch && <div style={{ fontSize: 10.5, color: "var(--txt-tertiary)", marginTop: 'var(--space-4)', lineHeight: 1.4 }}>{pitch}</div>}
        {(leadTime || availability) && (
          <div style={{ display: "flex", gap: 'var(--space-8)', marginTop: 'var(--space-12)', flexWrap: "wrap" }}>
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
            const Icon = PLATFORM_ICON[String(p).toLowerCase()] ?? IconWorld;
            return <div className="rcp-plat" key={p}><Icon className="icon-xs" aria-hidden="true" /></div>;
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
            <div style={{ fontSize: 11, color: "var(--txt-tertiary)", textAlign: "center", padding: "var(--space-12) 0" }}>No packages yet&hellip;</div>
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
        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={previewOnly}><IconMessageCircle className="icon-xs" />Enquire</button>
        <button className="btn btn-accent btn-sm" style={{ flex: 1 }} onClick={previewOnly}>Book now</button>
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
  const navigate = useNavigate();
  const { id: cardId } = useParams();
  const { rateCard, isLoading: cardLoading } = useRateCard(cardId);
  const { create: createRateCard, isCreating } = useRateCards();
  const [step, setStep] = useState(1);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const queryClient = useQueryClient();
  const hydrated = useRef(false);

  // profile (step 1) - starts from the account profile for a brand-new card,
  // or from the saved rate card's own profile block when editing.
  const { profile: account } = useProfile();
  const [profile, setProfile] = useState({
    name: "", handle: "", bio: "", location: "", followers: "", engagement: "", reach: "", niche: "Lifestyle", languages: "",
    whatsapp: "", instagram: "", tiktok: "", youtube: "", twitter: "",
  });
  const { url: photoUrl, setUrl: setPhotoUrl, uploading: photoUploading, onChange: handlePhotoChange } = useImageUpload({
    successMessage: "Profile photo updated.",
    onUploaded: ({ url, id }) => setProfile((p) => ({ ...p, photoUrl: url, photoUploadId: id })),
  });
  const seededFromAccount = useRef(false);
  useEffect(() => {
    if (cardId || !account || seededFromAccount.current) return;
    seededFromAccount.current = true;
    const c = account.creator ?? {};
    const socials = c.socials ?? {};
    setProfile((p) => ({
      ...p,
      name: account.name ?? `${account.firstName ?? ''} ${account.lastName ?? ''}`.trim(),
      handle: account.handle ?? '',
      bio: c.bio ?? '', location: c.location ?? '', niche: c.niche ?? p.niche, languages: c.languages ?? '',
      followers: c.followers != null ? Number(c.followers).toLocaleString('en-KE') : '',
      engagement: c.eng != null ? String(c.eng) : '',
      reach: c.followers != null ? Math.round(c.followers * 0.4).toLocaleString('en-KE') : '',
      whatsapp: account.phone ?? '', instagram: socials.instagram ?? '', tiktok: socials.tiktok ?? '', youtube: socials.youtube ?? '', twitter: socials.twitter ?? '',
    }));
    if (account.avatar) setPhotoUrl(account.avatar);
  }, [cardId, account]);
  const [platforms, setPlatforms] = useState({ instagram: true, tiktok: true, youtube: false, twitter: false, podcast: false });
  const togglePlatform = (key) => setPlatforms((p) => ({ ...p, [key]: !p[key] }));


  // packages (step 2)
  const [packages, setPackages] = useState([]);
  const addPackage = () => {
    if (packages.length >= 5) return;
    setPackages((p) => [...p, { id: Date.now(), name: "New package", price: "0", desc: "Describe what's included", feat: false }]);
  };
  const removePackage = (id) => setPackages((p) => p.filter((pkg) => pkg.id !== id));
  const updatePackage = (id, field, value) => setPackages((p) => p.map((pkg) => (pkg.id === id ? { ...pkg, [field]: value } : pkg)));

  // payment (step 3) - payout methods live on the account (/payments/methods);
  // invoice preferences are saved with the rate card.
  const { methods: payoutMethods, addMethod: addPayoutMethod, isAdding: addingPayout, removeMethod: removePayoutMethod } = usePayoutMethods();
  const methodOf = (type) => payoutMethods.find((m) => m.type === type);
  const [bankName, setBankName] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaBusiness, setMpesaBusiness] = useState("");
  const [airtelPhone, setAirtelPhone] = useState("");
  const [bankOpen, setBankOpen] = useState(false);
  const [bankAccount, setBankAccount] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [whatsappReminder, setWhatsappReminder] = useState(true);
  const connectMpesa = () => addPayoutMethod({ type: 'mpesa', name: 'M-Pesa', detail: `+254 ${mpesaPhone.trim()}`, fields: { phone: `+254 ${mpesaPhone.trim()}`, business: mpesaBusiness.trim() } });
  const connectAirtel = () => addPayoutMethod({ type: 'airtel', name: 'Airtel Money', detail: `+254 ${airtelPhone.trim()}`, fields: { phone: `+254 ${airtelPhone.trim()}` } });
  const connectBank = () => addPayoutMethod({ type: 'bank', name: bankName, detail: `···· ···· ${bankAccount.trim().slice(-4)}`, fields: { bank: bankName, account: bankAccount.trim(), holder: bankHolder.trim() } }, { onSuccess: () => setBankOpen(false) });

  // edit card (step 4)
  const [headline, setHeadline] = useState("");
  const [pitch, setPitch] = useState("");
  const [leadTime, setLeadTime] = useState("3-5 business days");
  const [availability, setAvailability] = useState("Open for collabs");
  const [usageNote, setUsageNote] = useState("Usage rights for digital channels included for 6 months from delivery date.");
  const [revisionPolicy, setRevisionPolicy] = useState("1 round of revisions included");
  const [showPricing, setShowPricing] = useState(true);

  // Hydrate the wizard from a real rate card on edit (GET /rate-cards/:id has
  // no documented response schema, so every field below falls back to the
  // wizard's own default rather than assuming a shape and crashing).
  useEffect(() => {
    if (!cardId || !rateCard || hydrated.current) return;
    hydrated.current = true;
    if (rateCard.profile) setProfile((p) => ({ ...p, ...rateCard.profile }));
    if (rateCard.profile?.photoUrl) setPhotoUrl(rateCard.profile.photoUrl);
    if (Array.isArray(rateCard.platforms)) {
      // Public/list shapes send platforms as an array of ids or names; the wizard keeps an on/off map.
      const on = new Set(rateCard.platforms.map((x) => String(x?.id ?? x?.name ?? x).toLowerCase().replace(/\s*\/\s*x$/, '').replace('twitter/x', 'twitter')));
      setPlatforms((p) => Object.fromEntries(Object.keys(p).map((k) => [k, on.has(k)])));
    } else if (rateCard.platforms && typeof rateCard.platforms === 'object') setPlatforms((p) => ({ ...p, ...rateCard.platforms }));
    if (Array.isArray(rateCard.packages) && rateCard.packages.length > 0) setPackages(rateCard.packages);
    if (rateCard.headline) setHeadline(rateCard.headline);
    if (rateCard.pitch) setPitch(rateCard.pitch);
    if (rateCard.leadTime) setLeadTime(rateCard.leadTime);
    if (rateCard.availability) setAvailability(rateCard.availability);
    if (rateCard.usageNote) setUsageNote(rateCard.usageNote);
    if (rateCard.revisionPolicy) setRevisionPolicy(rateCard.revisionPolicy);
    if (rateCard.showPricing != null) setShowPricing(rateCard.showPricing);
    if (rateCard.payment) {
      if (rateCard.payment.autoInvoice != null) setAutoInvoice(!!rateCard.payment.autoInvoice);
      if (rateCard.payment.requireDeposit != null) setRequireDeposit(!!rateCard.payment.requireDeposit);
      if (rateCard.payment.whatsappReminder != null) setWhatsappReminder(!!rateCard.payment.whatsappReminder);
    }
    if (rateCard.published) setPublished(true);
  }, [cardId, rateCard]);

  // Best-effort payload shape - POST /rate-cards' request body is documented
  // for creation but the wizard's fields (payment/edit-card steps) aren't
  // covered by any documented contract, so this bundles everything the
  // builder collects rather than guessing which subset the backend expects.
  const buildPayload = () => ({
    profile,
    platforms,
    ...(packages.length ? { packages } : {}),
    payment: { autoInvoice, requireDeposit, whatsappReminder },
    headline,
    pitch,
    leadTime,
    availability,
    usageNote,
    revisionPolicy,
    showPricing,
  });

  // publish (step 5)
  const [published, setPublished] = useState(false);
  const [copied, setCopied] = useState(false);
  const slug = `creatorske.com/${profile.handle.toLowerCase().replace(/\s/g, "")}`;

  // Ensures a rate card exists (creating one on first save if the wizard was
  // opened at /creator/rate-card with no :id yet), then navigates to its
  // edit URL so subsequent saves target the created card.
  const ensureCardId = async () => {
    if (cardId) return cardId;
    const created = await createRateCard(buildPayload());
    const newId = created?.id;
    if (newId) navigate(`/creator/rate-card/${newId}/edit`, { replace: true });
    return newId;
  };

  const doPublish = async () => {
    setPublishing(true);
    try {
      const id = await ensureCardId();
      if (!id) return;
      const updated = await rateCardService.publishRateCard(id);
      queryClient.setQueryData(['rate-card', id], updated);
      queryClient.invalidateQueries({ queryKey: ['rate-cards'] });
      setPublished(true);
      launchConfetti();
      toast.success('Rate card published!');
    } catch (err) {
      toast.error(err?.message || 'Could not publish. Please try again.');
    } finally {
      setPublishing(false);
    }
  };
  const copyLink = () => {
    navigator.clipboard?.writeText("https://" + slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      const id = await ensureCardId();
      if (id) {
        const updated = await rateCardService.saveDraft(id, buildPayload());
        queryClient.setQueryData(['rate-card', id], updated);
      }
      toast.success("Draft saved.");
    } catch (err) {
      toast.error(err?.message || "Could not save your draft. Please try again.");
    } finally {
      setSavingDraft(false);
    }
  };

  const next = () => setStep((s) => Math.min(5, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));


  if (cardId && cardLoading) {
    return (
      <div className="rcb" style={{ minHeight: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Tokens />
        <p className="hint">Loading your rate card…</p>
      </div>
    );
  }

  return (
    <div className="rcb" style={{ minHeight: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
      <Tokens />
      <div className="bs">
        {/* header / stepper */}
        <div className="btop">
          <div className="btop-inner">
            <div className="page-title">
              {["Set up your profile", "Your packages", "Payment setup", "Edit rate card", "Preview & publish"][step - 1]}
            </div>
            <div className="page-subtitle">
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
                  <p className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Profile photo</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 'var(--space-16)' }}>
                    <SmartImage src={photoUrl} alt="Profile photo" className="av av-xl" style={{ objectFit: "cover", border: "0.5px solid var(--bdr-tertiary)" }} fallback={<div className="av av-xl av-accent">{initials(profile.name)}</div>} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-8)' }}>
                      <label className={`btn btn-secondary btn-sm${photoUploading ? " btn-loading" : ""}`} style={{ cursor: "pointer" }}>
                        <IconUpload className="icon-xs" />{photoUrl ? "Change photo" : "Upload photo"}
                        <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handlePhotoChange} disabled={photoUploading} style={{ display: "none" }} />
                      </label>
                      <p className="hint">JPG, PNG or GIF &middot; max 2 MB &middot; 400&times;400 px</p>
                    </div>
                  </div>
                </div>

                <div className="card card-p">
                  <p className="section-title">Your platforms</p>
                  <p className="hint" style={{ margin: "var(--space-4) 0 var(--space-12)" }}>Select all platforms you are active on</p>
                  <div style={{ display: "flex", gap: 'var(--space-8)', flexWrap: "wrap" }}>
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
                  <p className="section-title" style={{ marginBottom: 'var(--space-16)' }}>Basic info</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-12)' }}>
                    <div className="g2">
                      <div className="field">
                        <label className="field-label field-required">Display name</label>
                        <div className="inp-wrap"><span className="inp-icon l"><IconUser className="icon-sm" /></span><input className="inp inp-icon-l" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
                      </div>
                      <div className="field">
                        <label className="field-label field-required">Handle</label>
                        <div className="inp-wrap">
                          <span className="inp-pre">@</span>
                          <input className="inp" style={{ paddingLeft: 'var(--space-20)' }} value={profile.handle} onChange={(e) => setProfile({ ...profile, handle: e.target.value })} />
                        </div>
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label field-required">Bio / tagline</label>
                      <textarea className="inp ta" rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                      <p className="hint">140 characters max</p>
                    </div>
                    <div className="field">
                      <label className="field-label">Location</label>
                      <div className="inp-wrap">
                        <span className="inp-icon l"><IconMapPin className="icon-sm" /></span>
                        <input className="inp inp-icon-l" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card card-p span2">
                  <p className="section-title">Audience stats</p>
                  <p className="hint" style={{ margin: "var(--space-4) 0 var(--space-16)" }}>Shown on your rate card to build trust with brands</p>
                  <div className="g3">
                    <div className="field">
                      <label className="field-label">Total followers</label>
                      <div className="inp-wrap"><span className="inp-icon l"><IconUsers className="icon-sm" /></span><input className="inp inp-icon-l" value={profile.followers} onChange={(e) => setProfile({ ...profile, followers: e.target.value })} /></div>
                    </div>
                    <div className="field">
                      <label className="field-label">Avg engagement</label>
                      <div className="inp-wrap">
                        <input className="inp inp-icon-r" value={profile.engagement} onChange={(e) => setProfile({ ...profile, engagement: e.target.value })} />
                        <span className="inp-icon r" style={{ fontSize: 12, fontWeight: 600 }}>%</span>
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">Monthly reach</label>
                      <div className="inp-wrap"><span className="inp-icon l"><IconEye className="icon-sm" /></span><input className="inp inp-icon-l" value={profile.reach} onChange={(e) => setProfile({ ...profile, reach: e.target.value })} /></div>
                    </div>
                  </div>
                </div>

                <div className="card card-p span2">
                  <p className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Niche &amp; content</p>
                  <div className="g2">
                    <div className="field">
                      <label className="field-label field-required">Primary niche</label>
                      <Select className="inp" aria-label="Primary niche" value={profile.niche} onChange={(v) => setProfile({ ...profile, niche: v })} options={["Lifestyle", "Travel", "Fashion & Beauty", "Tech", "Food & Beverage", "Fitness & Health", "Finance", "Gaming", "Education"].map((o) => ({ value: o, label: o }))} />
                    </div>
                    <div className="field">
                      <label className="field-label">Content languages</label>
                      <div className="inp-wrap">
                        <span className="inp-icon l"><IconLanguage className="icon-sm" /></span>
                        <input className="inp inp-icon-l" value={profile.languages} onChange={(e) => setProfile({ ...profile, languages: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rcp-preview-col">
                <p className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Live preview</p>
                <RateCardPreview profile={profile} platforms={platforms} packages={packages} />
                <p className="hint" style={{ marginTop: 'var(--space-8)', textAlign: "center" }}>Updates as you type</p>
              </div>
            </div>
          )}

          {/* STEP 2: PACKAGES */}
          {step === 2 && (
            <div className="bsplit">
              <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-12)' }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-12)' }}>
                  {packages.map((pkg) => (
                    <div className={`pkg-card${pkg.feat ? " feat-card" : ""}`} key={pkg.id}>
                      <div style={{ display: "flex", alignItems: "center", gap: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
                        <span className="pkg-drag-handle"><IconGripVertical className="icon-sm" /></span>
                        <div className="section-title" style={{ flex: 1 }}>{pkg.name}</div>
                        {pkg.feat && <span className="tag tag-accent">Featured</span>}
                        <button className="icon-btn icon-btn-sm" onClick={() => removePackage(pkg.id)}>
                          <IconTrash className="icon-xs" color="var(--red-400)" />
                        </button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-12)' }}>
                        <div className="g2">
                          <div className="field">
                            <label className="field-label field-required">Package name</label>
                            <div className="inp-wrap"><span className="inp-icon l"><IconPackage className="icon-sm" /></span><input className="inp inp-icon-l" value={pkg.name} onChange={(e) => updatePackage(pkg.id, "name", e.target.value)} /></div>
                          </div>
                          <div className="field">
                            <label className="field-label field-required">Price (KES)</label>
                            <div className="inp-wrap">
                              <span className="inp-pre">KES</span>
                              <input className="inp" style={{ paddingLeft: 'var(--space-40)' }} value={pkg.price} onChange={(e) => updatePackage(pkg.id, "price", e.target.value)} />
                            </div>
                          </div>
                        </div>
                        <div className="field">
                          <label className="field-label">Description</label>
                          <div className="inp-wrap"><span className="inp-icon l"><IconAlignLeft className="icon-sm" /></span><input className="inp inp-icon-l" value={pkg.desc} onChange={(e) => updatePackage(pkg.id, "desc", e.target.value)} /></div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 'var(--space-8)' }}>
                          <button className={`toggle${pkg.feat ? " on" : ""}`} onClick={() => updatePackage(pkg.id, "feat", !pkg.feat)} />
                          <span style={{ fontSize: 12.5, color: "var(--txt-secondary)" }}>Mark as featured (highlighted on card)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bento">
                  <div className="card-dash card-p" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 'var(--space-8)', minHeight: 58 }} onClick={addPackage}>
                    <IconPlus className="icon-md" color="var(--txt-tertiary)" />
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--txt-secondary)" }}>Add another package</span>
                  </div>
                  <div className="alert alert-info">
                    <IconInfoCircle className="icon-md" />
                    <div className="alert-body"><div className="alert-title">Pro tip</div>Brands respond best to 2–4 clear packages. Keep names short and prices specific.</div>
                  </div>
                </div>
              </div>

              <div className="rcp-preview-col">
                <p className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Live preview</p>
                <RateCardPreview profile={profile} platforms={platforms} packages={packages} />
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 3 && (
            <div style={{ maxWidth: 700, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 'var(--space-12)' }}>
              <div className="alert alert-info">
                <IconShieldCheck className="icon-md" />
                <div className="alert-body"><div className="alert-title">Secure &amp; encrypted</div>All payment details are stored securely. Creatorske never stores full card credentials.</div>
              </div>

              {(() => { const m = methodOf('mpesa'); return (
              <div className={`pay-method${m ? " active-method" : ""}`}>
                <div className="pay-method-header">
                  <div className="pay-icon" style={{ background: "#00a651" }}><IconDeviceMobile className="icon-md" color="#fff" /></div>
                  <div style={{ flex: 1 }}><div className="section-title">M-Pesa</div><p className="hint">{m ? m.detail : 'Safaricom mobile money'}</p></div>
                  {m ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                      <span className="tag tag-success"><span className="sdot" style={{ background: "var(--green-400)" }} />Connected</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => removePayoutMethod(m.id)}>Disconnect</button>
                    </div>
                  ) : (
                    <button className={`btn btn-ghost btn-sm${addingPayout ? " btn-loading" : ""}`} disabled={addingPayout || mpesaPhone.trim().length < 9} onClick={connectMpesa}>Connect</button>
                  )}
                </div>
                {!m && (
                <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-12)' }}>
                  <div className="field">
                    <label className="field-label field-required">M-Pesa phone number</label>
                    <div className="inp-wrap"><span className="inp-pre">+254</span><input className="inp" style={{ paddingLeft: 'var(--space-48)' }} value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} placeholder="7XX XXX XXX" /></div>
                  </div>
                  <div className="field">
                    <label className="field-label">Business name on M-Pesa</label>
                    <div className="inp-wrap"><span className="inp-icon l"><IconBuildingStore className="icon-sm" /></span><input className="inp inp-icon-l" value={mpesaBusiness} onChange={(e) => setMpesaBusiness(e.target.value)} placeholder={profile.name || 'Your name'} /></div>
                    <p className="hint">Displayed to clients when they pay</p>
                  </div>
                </div>
                )}
              </div>
              ); })()}

              {(() => { const m = methodOf('airtel'); return (
              <div className={`pay-method${m ? " active-method" : ""}`}>
                <div className="pay-method-header">
                  <div className="pay-icon" style={{ background: "#e40000" }}><IconDeviceMobile className="icon-md" color="#fff" /></div>
                  <div style={{ flex: 1 }}><div className="section-title">Airtel Money</div><p className="hint">{m ? m.detail : 'Airtel mobile money'}</p></div>
                  {m ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                      <span className="tag tag-success"><span className="sdot" style={{ background: "var(--green-400)" }} />Connected</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => removePayoutMethod(m.id)}>Disconnect</button>
                    </div>
                  ) : (
                    <button className={`btn btn-ghost btn-sm${addingPayout ? " btn-loading" : ""}`} disabled={addingPayout || airtelPhone.trim().length < 9} onClick={connectAirtel}>Connect</button>
                  )}
                </div>
                {!m && (
                <div className="field">
                  <label className="field-label">Airtel phone number</label>
                  <div className="inp-wrap"><span className="inp-pre">+254</span><input className="inp" style={{ paddingLeft: 'var(--space-48)' }} placeholder="7XX XXX XXX" value={airtelPhone} onChange={(e) => setAirtelPhone(e.target.value)} /></div>
                </div>
                )}
              </div>
              ); })()}

              {(() => { const m = methodOf('bank'); return (
              <div className={`pay-method${m ? " active-method" : ""}`}>
                <div className="pay-method-header">
                  <div className="pay-icon" style={{ background: "var(--bg-secondary)" }}><IconBuilding className="icon-md" color="var(--txt-secondary)" /></div>
                  <div style={{ flex: 1 }}><div className="section-title">Bank transfer</div><p className="hint">{m ? `${m.name} ${m.detail}` : 'Local & international wire'}</p></div>
                  {m ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                      <span className="tag tag-success"><span className="sdot" style={{ background: "var(--green-400)" }} />Connected</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => removePayoutMethod(m.id)}>Disconnect</button>
                    </div>
                  ) : (
                    <button className="btn btn-ghost btn-sm" onClick={() => setBankOpen((o) => !o)}>{bankOpen ? "Hide" : "Add details"}</button>
                  )}
                </div>
                {!m && bankOpen && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-12)' }}>
                    <div className="g2">
                      <div className="field">
                        <label className="field-label">Bank name</label>
                        <Select className="inp" aria-label="Bank" value={bankName} onChange={setBankName} placeholder="Select bank" options={["Equity Bank", "KCB Bank", "Co-operative Bank", "NCBA", "Stanbic Bank", "Other"].map((b) => ({ value: b, label: b }))} />
                      </div>
                      <div className="field"><label className="field-label">Account number</label><div className="inp-wrap"><span className="inp-icon l"><IconHash className="icon-sm" /></span><input className="inp inp-icon-l" placeholder="e.g. 0123456789" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} /></div></div>
                    </div>
                    <div className="field"><label className="field-label">Account name</label><div className="inp-wrap"><span className="inp-icon l"><IconUser className="icon-sm" /></span><input className="inp inp-icon-l" placeholder={profile.name || 'Account holder'} value={bankHolder} onChange={(e) => setBankHolder(e.target.value)} /></div></div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className={`btn btn-primary btn-sm${addingPayout ? " btn-loading" : ""}`} disabled={addingPayout || !bankName || bankAccount.trim().length < 6} onClick={connectBank}>Save bank details</button>
                    </div>
                  </div>
                )}
              </div>
              ); })()}

              <div className="card card-p">
                <p className="section-title" style={{ marginBottom: 'var(--space-16)' }}>Invoice preferences</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-12)' }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 'var(--space-12)' }}>
                    <div><div style={{ fontSize: 13.5, fontWeight: 500 }}>Auto-send invoice on booking</div><p className="hint">Automatically email invoice when a client books</p></div>
                    <button className={`toggle${autoInvoice ? " on" : ""}`} onClick={() => setAutoInvoice((v) => !v)} />
                  </div>
                  <div className="hr" />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 'var(--space-12)' }}>
                    <div><div style={{ fontSize: 13.5, fontWeight: 500 }}>Require 50% deposit</div><p className="hint">Client pays half upfront before work begins</p></div>
                    <button className={`toggle${requireDeposit ? " on" : ""}`} onClick={() => setRequireDeposit((v) => !v)} />
                  </div>
                  <div className="hr" />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 'var(--space-12)' }}>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-16)' }}>
                <div className="card card-p">
                  <p className="section-title" style={{ marginBottom: 'var(--space-16)' }}>Card header</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-12)' }}>
                    <div className="field">
                      <label className="field-label">Headline</label>
                      <div className="inp-wrap"><span className="inp-icon l"><IconHeading className="icon-sm" /></span><input className="inp inp-icon-l" value={headline} onChange={(e) => setHeadline(e.target.value)} /></div>
                      <p className="hint">Appears at the top of your published card</p>
                    </div>
                    <div className="field">
                      <label className="field-label">Short pitch</label>
                      <textarea className="inp ta" rows={2} value={pitch} onChange={(e) => setPitch(e.target.value)} />
                    </div>
                    <div className="g2">
                      <div className="field">
                        <label className="field-label">Booking lead time</label>
                        <Select className="inp" aria-label="Lead time" value={leadTime} onChange={setLeadTime} options={["3-5 business days", "1 week", "2 weeks", "1 month"].map((o) => ({ value: o, label: o }))} />
                      </div>
                      <div className="field">
                        <label className="field-label">Availability</label>
                        <Select className="inp" aria-label="Availability" value={availability} onChange={setAvailability} options={["Open for collabs", "Limited slots", "Fully booked"].map((o) => ({ value: o, label: o }))} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card card-p">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 'var(--space-16)' }}>
                    <p className="section-title">Package order &amp; visibility</p>
                    <button className="btn btn-ghost btn-xs" onClick={() => setStep(2)}><IconPencil className="icon-xs" />Edit packages</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-8)' }}>
                    {packages.map((pkg) => (
                      <div key={pkg.id} style={{ display: "flex", alignItems: "center", gap: 'var(--space-12)', padding: "var(--space-12) var(--space-12)", background: pkg.feat ? "var(--accent-light)" : "var(--bg-secondary)", border: `0.5px solid ${pkg.feat ? "var(--accent-border)" : "var(--bdr-tertiary)"}`, borderRadius: "var(--r-md)", opacity: pkg.hidden ? 0.5 : 1 }}>
                        <span style={{ color: "var(--txt-tertiary)", display: "flex", cursor: "grab" }}><IconGripVertical className="icon-sm" /></span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{pkg.name}{pkg.hidden ? " (hidden)" : ""}</div>
                          <div style={{ fontSize: 11.5, color: "var(--txt-tertiary)" }}>KES {pkg.price}{pkg.feat ? " · Featured" : ""}</div>
                        </div>
                        {pkg.feat && <span className="tag tag-accent">Featured</span>}
                        <button
                          type="button"
                          className="icon-btn icon-btn-sm"
                          title={pkg.hidden ? "Show on rate card" : "Hide from rate card"}
                          onClick={() => updatePackage(pkg.id, "hidden", !pkg.hidden)}
                        >
                          {pkg.hidden ? <IconEyeOff className="icon-sm" /> : <IconEye className="icon-sm" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card card-p">
                  <p className="section-title" style={{ marginBottom: 'var(--space-16)' }}>Contact &amp; social links</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-12)' }}>
                    <div className="field">
                      <label className="field-label">WhatsApp business number</label>
                      <div className="inp-wrap"><span className="inp-icon l"><IconMessageCircle className="icon-sm" color="#25D366" /></span><input className="inp inp-icon-l" value={profile.whatsapp} onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })} placeholder="+254 7XX XXX XXX" /></div>
                    </div>
                    <div className="field">
                      <label className="field-label">Instagram</label>
                      <div className="inp-wrap"><span className="inp-icon l"><IconBrandInstagram className="icon-sm" /></span><input className="inp inp-icon-l" value={profile.instagram} onChange={(e) => setProfile({ ...profile, instagram: e.target.value })} placeholder="instagram.com/…" /></div>
                    </div>
                    <div className="field">
                      <label className="field-label">TikTok</label>
                      <div className="inp-wrap"><span className="inp-icon l"><IconBrandTiktok className="icon-sm" /></span><input className="inp inp-icon-l" value={profile.tiktok} onChange={(e) => setProfile({ ...profile, tiktok: e.target.value })} placeholder="tiktok.com/@…" /></div>
                    </div>
                    <div className="g2">
                      <div className="field">
                        <label className="field-label">YouTube</label>
                        <div className="inp-wrap"><span className="inp-icon l"><IconBrandYoutube className="icon-sm" /></span><input className="inp inp-icon-l" value={profile.youtube} onChange={(e) => setProfile({ ...profile, youtube: e.target.value })} placeholder="youtube.com/…" /></div>
                      </div>
                      <div className="field">
                        <label className="field-label">Twitter / X</label>
                        <div className="inp-wrap"><span className="inp-icon l"><IconBrandX className="icon-sm" /></span><input className="inp inp-icon-l" value={profile.twitter} onChange={(e) => setProfile({ ...profile, twitter: e.target.value })} placeholder="x.com/…" /></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card card-p">
                  <p className="section-title" style={{ marginBottom: 'var(--space-16)' }}>Terms &amp; conditions</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-12)' }}>
                    <div className="field">
                      <label className="field-label">Custom usage rights note</label>
                      <textarea className="inp ta" rows={2} value={usageNote} onChange={(e) => setUsageNote(e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="field-label">Revision policy</label>
                      <Select className="inp" aria-label="Revision policy" value={revisionPolicy} onChange={setRevisionPolicy} options={["1 round of revisions included", "2 rounds included", "No revisions", "Unlimited revisions"].map((o) => ({ value: o, label: o }))} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 'var(--space-12)' }}>
                      <div><div style={{ fontSize: 13.5, fontWeight: 500 }}>Show KES pricing on card</div><p className="hint">Uncheck to show &ldquo;Price on request&rdquo; instead</p></div>
                      <button className={`toggle${showPricing ? " on" : ""}`} onClick={() => setShowPricing((v) => !v)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rcp-preview-col">
                <p className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Live preview</p>
                <div className="rcp">
                  <div className="rcp-top">
                    <SmartImage src={profile.photoUrl} className="av av-md" style={{ objectFit: "cover" }} fallback={<div className="av av-md av-accent">{initials(profile.name)}</div>} />
                    <div className="rcp-name" style={{ fontSize: 13.5 }}>{headline}</div>
                    <div className="rcp-handle">@{profile.handle} &middot; {profile.location}</div>
                    <div style={{ fontSize: 10.5, color: "var(--txt-tertiary)", marginTop: 'var(--space-4)', lineHeight: 1.4 }}>{pitch}</div>
                    <div style={{ display: "flex", gap: 'var(--space-8)', marginTop: 'var(--space-12)', flexWrap: "wrap" }}>
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
                            <div style={{ fontSize: 9, color: "var(--txt-tertiary)", marginTop: 'var(--space-2)' }}>{pkg.desc}</div>
                          </div>
                          <div className="rcp-pkg-price">{showPricing ? `KES ${compact(pkg.price)}` : "On request"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: "var(--space-12) var(--space-12)", borderTop: "0.5px solid var(--bdr-tertiary)", display: "flex", gap: 'var(--space-4)', alignItems: "center" }}>
                    <IconBrandInstagram className="icon-sm" color="var(--txt-secondary)" />
                    <IconBrandTiktok className="icon-sm" color="var(--txt-secondary)" />
                    <IconMessageCircle className="icon-sm" color="var(--txt-secondary)" />
                    <span style={{ fontSize: 10, color: "var(--txt-tertiary)", marginLeft: 'var(--space-4)' }}>Usage rights &middot; {revisionPolicy.split(" ").slice(0, 2).join(" ")}</span>
                  </div>
                  <div className="rcp-footer">
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={previewOnly}><IconMessageCircle className="icon-xs" />Enquire</button>
                    <button className="btn btn-accent btn-sm" style={{ flex: 1 }} onClick={previewOnly}>Book now</button>
                  </div>
                </div>
                <p className="hint" style={{ marginTop: 'var(--space-8)', textAlign: "center" }}>Updates as you type</p>
              </div>
            </div>
          )}

          {/* STEP 5: PUBLISH */}
          {step === 5 && (
            <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 'var(--space-16)' }}>
              <div className="card card-p">
                <p className="section-title" style={{ marginBottom: 'var(--space-16)' }}>Readiness check</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-12)' }}>
                  {[
                    "Profile setup complete",
                    `${packages.length} package${packages.length === 1 ? "" : "s"} added`,
                    "M-Pesa payment connected",
                    "Rate card edited & reviewed",
                  ].map((label, i) => (
                    <React.Fragment key={label}>
                      <div className="check-row">
                        <div className="check-row-dot ok"><IconCheck className="icon-xs" /></div>
                        <span style={{ fontSize: 13, flex: 1 }}>{label}</span>
                        <span className="tag tag-success"><span className="sdot" style={{ background: "var(--green-400)" }} />Done</span>
                      </div>
                      {i < 3 && <div className="hr" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="card card-p">
                <p className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Your public link</p>
                <div className="share-box">
                  <IconLink className="icon-sm" color="var(--txt-tertiary)" />
                  <span className="share-url">{slug}</span>
                  <button className="btn btn-ghost btn-xs" onClick={copyLink}>{copied ? <><IconCheck className="icon-xs" />Copied!</> : <><IconCopy className="icon-xs" />Copy</>}</button>
                </div>
                <div style={{ display: "flex", gap: 'var(--space-8)', marginTop: 'var(--space-12)' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Check out my rate card: https://" + slug)}`, "_blank")}>
                    <IconMessageCircle className="icon-xs" />Share on WhatsApp
                  </button>
                </div>
              </div>

              {published ? (
                <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 'var(--space-16)', padding: 'var(--space-32)', textAlign: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--bg-success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconCheck className="icon-xl" color="var(--txt-success)" />
                  </div>
                  <div>
                    <div className="page-title" style={{ marginBottom: 'var(--space-4)' }}>You're live!</div>
                    <p style={{ fontSize: 13, color: "var(--txt-secondary)" }}>Your rate card is published and ready to share with brands.</p>
                  </div>
                  <div style={{ display: "flex", gap: 'var(--space-8)', flexWrap: "wrap", justifyContent: "center" }}>
                    <button className="btn btn-secondary btn-sm" onClick={copyLink}><IconCopy className="icon-xs" />Copy link</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/creator/dashboard')}><IconLayoutDashboard className="icon-xs" />Go to dashboard</button>
                  </div>
                </div>
              ) : (
                <button className={`btn btn-accent btn-full${publishing || isCreating ? " btn-loading" : ""}`} style={{ padding: 'var(--space-12)' }} disabled={publishing || isCreating} onClick={doPublish}>
                  <IconRocket className="icon-sm" />Publish rate card
                </button>
              )}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="bfooter">
          <div className="bfooter-inner">
            {step > 1 ? (
              <button className="btn btn-ghost" onClick={back}><IconArrowLeft className="icon-sm" />Back</button>
            ) : <div />}
            <div style={{ display: "flex", gap: 'var(--space-8)' }}>
              {step < 5 && <button className={`btn btn-ghost${savingDraft ? " btn-loading" : ""}`} disabled={savingDraft} onClick={handleSaveDraft}>Save draft</button>}
              {step === 5 ? (
                <button className={`btn btn-ghost${savingDraft ? " btn-loading" : ""}`} disabled={savingDraft} onClick={handleSaveDraft}>Save draft</button>
              ) : (
                <button className="btn btn-primary" onClick={next}>Save &amp; continue<IconArrowRight className="icon-sm" /></button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}