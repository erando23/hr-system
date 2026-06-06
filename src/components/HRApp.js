//cat > /mnt/user - data / outputs / HRApp << 'ENDOFFILE'
"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { useOutlets } from "@/hooks/useApi";
import LoginScreen from "@/components/LoginScreen";

/* ── FONTS ── */
function useFont() {
  useEffect(() => {
    if (document.getElementById("hr-font")) return;
    const l = document.createElement("link");
    l.id = "hr-font"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap";
    document.head.appendChild(l);
  }, []);
}

/* ══════════════ GLOBAL RESPONSIVE STYLES ══════════════ */
function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById("hr-global-style")) return;
    const s = document.createElement("style");
    s.id = "hr-global-style";
    s.textContent = `
      .hr-auto-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
      .hr-auto-scroll::-webkit-scrollbar { height: 6px; }
      .hr-auto-scroll::-webkit-scrollbar-thumb { background: #213252; border-radius: 3px; }
      .hr-auto-scroll > table { width: 100%; }
      *, *::before, *::after { box-sizing: border-box; }
      html, body { overflow-x: hidden; }
      body { -webkit-text-size-adjust: 100%; }

      .hr-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
      .hr-table-scroll table { min-width: 100%; }
      .hr-table-scroll::-webkit-scrollbar { height: 6px; }
      .hr-table-scroll::-webkit-scrollbar-thumb { background: #213252; border-radius: 3px; }

      .hr-row-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
      .hr-row-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
      .hr-row-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
      .hr-row-2x { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .hr-row-l2 { display: grid; grid-template-columns: 120px 1fr; gap: 8px; }

      .hr-absensi-grid { display: grid; gap: 14px; grid-template-columns: 190px 1fr 1fr; }
      .hr-cal-grid-7 { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }

      .hr-page-title { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 12px; flex-wrap: wrap; }
      .hr-page-title h2 { margin: 0; font-size: 22px; font-family: ${"'Plus Jakarta Sans',sans-serif"}; font-weight: 800; color: ${"#E8F2FF"}; letter-spacing: -0.5px; }
      .hr-page-title p { margin: 4px 0 0; font-size: 13px; color: ${"#46607F"}; }

      .hr-row-flex { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
      .hr-row-flex-right { margin-left: auto; }

      .hr-mobile-toggle { display: none; }

      .hr-scrim { display: none; }

      @media (max-width: 1024px) {
        .hr-row-4 { grid-template-columns: repeat(2, 1fr); }
        .hr-row-3 { grid-template-columns: repeat(3, 1fr); }
        .hr-absensi-grid { grid-template-columns: 1fr 1fr; }
        .hr-absensi-grid > .hr-clock-cell { grid-column: 1 / -1; }
      }

      @media (max-width: 720px) {
        .hr-row-3, .hr-row-4 { grid-template-columns: repeat(2, 1fr); }
        .hr-row-2 { grid-template-columns: 1fr; }
        .hr-absensi-grid { grid-template-columns: 1fr; }
        .hr-absensi-grid > * { grid-column: 1 / -1 !important; }
        .hr-page-title h2 { font-size: 18px; }
        .hr-page-title p { font-size: 12px; }
        .hr-main { margin-left: 0 !important; padding: 14px 14px 28px !important; }
        .hr-sidebar { transform: translateX(-100%); transition: transform .25s ease; box-shadow: 6px 0 30px #00000088; }
        .hr-sidebar.open { transform: translateX(0); }
        .hr-mobile-toggle { display: inline-flex; }
        .hr-scrim.open { display: block; position: fixed; inset: 0; background: #00000099; z-index: 19; }
        .hr-topbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: ${"#0C1018"}; border-bottom: 1px solid ${"#1A2840"}; position: sticky; top: 0; z-index: 15; gap: 10px; }
        .hr-topbar-title { font-size: 14px; font-weight: 700; color: ${"#E8F2FF"}; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .hr-card-p-sm { padding: 14px 14px !important; }
        .hr-modal-panel { width: 100% !important; max-width: 100vw !important; max-height: 100vh !important; height: 100vh; border-radius: 0 !important; padding: 18px 16px !important; }
        .hr-cal-cell { padding: 6px 4px !important; min-height: 48px; }
        .hr-cal-cell .day-circle { width: 30px !important; height: 30px !important; font-size: 11px !important; }
        .hr-cal-cell .day-num { font-size: 9px !important; margin-bottom: 4px !important; }
        .hr-cal-cell .day-time { font-size: 8px !important; }
        .hr-day-header { font-size: 8px !important; padding: 4px 0 !important; letter-spacing: 1px !important; }
        .hr-print-panel { width: 100% !important; max-width: 100vw !important; padding: 20px 16px !important; }
        .hr-payroll-table { min-width: 760px; }
        .hr-row-flex > button { font-size: 12px !important; }
      }

      @media (max-width: 420px) {
        .hr-row-3, .hr-row-4 { grid-template-columns: 1fr; }
        .hr-page-title h2 { font-size: 16px; }
      }
    `;
    document.head.appendChild(s);
  }, []);
}

/* ══════════════ DESIGN TOKENS ══════════════ */
const T = {
  bg: "#07090F", bg1: "#0C1018", bg2: "#111826", bg3: "#172030", bg4: "#1C2840",
  line: "#1A2840", lineL: "#213252",
  t0: "#E8F2FF", t1: "#8AA4CC", t2: "#46607F",
  em: "#00D4AA", emD: "#002218",
  blue: "#3B82F6", blueD: "#0A1C3C",
  amber: "#F59E0B", amberD: "#1C1200",
  red: "#EF4444", redD: "#280808",
  purple: "#A855F7", purpleD: "#180A2C",
  fS: "'Plus Jakarta Sans',sans-serif",
  fM: "'JetBrains Mono',monospace",
};

/* ══════════════ SHIFTS ══════════════ */
// Default shifts (Outlet Sudirman — o1)
const SHIFTS_DEF = {
  L: { label: "Libur", start: null, end: null, color: T.t2, bg: T.bg3 },
  FULL: { label: "Full Time", start: "07:00", end: "21:00", color: T.em, bg: T.emD },
  P: { label: "Shift 1 (Pagi)", start: "07:00", end: "14:00", color: T.em, bg: T.emD },
  S: { label: "Shift 2 (Siang)", start: "14:00", end: "21:00", color: T.amber, bg: T.amberD },
  //A: { label: "Shift A", start: "07:15", end: "14:15", color: T.em, bg: T.emD },
  //B: { label: "Shift B", start: "14:00", end: "21:00", color: T.amber, bg: T.amberD },
  //AB: { label: "Double Shift", start: "07:15", end: "21:00", color: T.purple, bg: T.purpleD },
};

// Resolve shift def from outlet hours config
// Single-shift outlets: only FULL is meaningful (P/S collapse to FULL window)
// Two-shift outlets: FULL = P start → S end, P/S keep their own windows
function getShiftDef(outlet) {
  let h = outlet?.outletHours || {};
  if (typeof h === "string") {
    try { h = JSON.parse(h); } catch { h = {}; }
  }
  const isSingle = !!outlet?.isSingleShift;
  const sStart = h.shift1Start || h.shiftStart || "07:00";
  const sEnd = h.shift2End || h.shiftEnd || "21:00";
  const pStart = isSingle ? sStart : (h.shift1Start || "07:00");
  const pEnd = isSingle ? sEnd : (h.shift1End || "14:00");
  const ssStart = isSingle ? sStart : (h.shift2Start || "14:00");
  const ssEnd = isSingle ? sEnd : (h.shift2End || "21:00");
  return {
    L: { ...SHIFTS_DEF.L, start: null, end: null },
    FULL: { ...SHIFTS_DEF.FULL, start: sStart, end: sEnd },
    P: { ...SHIFTS_DEF.P, start: pStart, end: pEnd },
    S: { ...SHIFTS_DEF.S, start: ssStart, end: ssEnd },
  };
}

const DAYS_ID = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const DAYS_S = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const DEPT_LIST = ["Outlet", "Kitchen", "Kasir", "Security"];
const DEPT_COLOR = { Outlet: T.em, Kitchen: T.amber, Kasir: T.blue, Security: T.purple };
const DEPT_BG = { Outlet: T.emD, Kitchen: T.amberD, Kasir: T.blueD, Security: T.purpleD };

/* ══════════════ UTILS ══════════════ */
const rp = n => "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(Math.abs(n || 0)));
const initials = name => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
function calcDist(lat1, lng1, lat2, lng2) {
  const R = 6371000, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function getRealDayAndWeek() { const d = new Date(), jsDay = d.getDay(); return { dayIdx: jsDay === 0 ? 6 : jsDay - 1, weekIdx: Math.min(Math.floor((d.getDate() - 1) / 7), 3) }; }
function shiftToMins(t) { if (!t) return null; const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function formatMins(m) { if (!m && m !== 0) return "—"; return m < 60 ? `${m} mnt` : `${Math.floor(m / 60)}j ${m % 60}m`; }

/* ══════════════ UI PRIMITIVES ══════════════ */
function Pill({ color, bg, children, small, style = {} }) { return <span style={{ display: "inline-flex", alignItems: "center", padding: small ? "1px 7px" : "3px 10px", borderRadius: 20, fontSize: small ? 8 : 10, fontFamily: T.fM, fontWeight: 500, letterSpacing: .5, color: color || T.t1, background: bg || T.bg3, ...style }}>{children}</span>; }
function Avatar({ name, color = T.em, bg = T.emD, size = 32 }) { return <div style={{ width: size, height: size, borderRadius: "50%", background: bg, border: `1.5px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * .3, fontFamily: T.fM, fontWeight: 700, color, flexShrink: 0 }}>{initials(name)}</div>; }
function Card({ children, style = {}, p = "20px 22px", className = "" }) { return <div className={className} style={{ background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 14, padding: p, ...style }}>{children}</div>; }
function SBtn({ children, onClick, variant = "primary", size = "md", style = {}, disabled = false }) {
  const sz = { sm: { padding: "6px 14px", fontSize: 12 }, md: { padding: "9px 18px", fontSize: 13 }, lg: { padding: "12px 24px", fontSize: 14 } };
  const v = { primary: { background: T.em, color: "#001810" }, secondary: { background: T.bg3, color: T.t1 }, danger: { background: T.red, color: "#fff" }, ghost: { background: "transparent", color: T.t1, border: `1px solid ${T.line}` }, amber: { background: T.amber, color: "#140E00" } };
  return <button onClick={onClick} disabled={disabled} style={{ border: "none", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", fontFamily: T.fS, fontWeight: 600, transition: "all .15s", display: "inline-flex", alignItems: "center", gap: 6, ...sz[size], ...v[variant], opacity: disabled ? .45 : 1, ...style }}>{children}</button>;
}
function FInput({ label, value, onChange, type = "text", placeholder, style = {} }) { return (<div style={{ marginBottom: 14 }}>{label && <div style={{ fontSize: 10, fontFamily: T.fM, letterSpacing: 1.5, color: T.t2, marginBottom: 6, textTransform: "uppercase" }}>{label}</div>}<input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", boxSizing: "border-box", background: T.bg3, border: `1px solid ${T.lineL}`, borderRadius: 8, padding: "10px 13px", color: T.t0, fontFamily: T.fS, fontSize: 13, outline: "none", ...style }} /></div>); }
function FSelect({ label, value, onChange, options }) { return (<div style={{ marginBottom: 14 }}>{label && <div style={{ fontSize: 10, fontFamily: T.fM, letterSpacing: 1.5, color: T.t2, marginBottom: 6, textTransform: "uppercase" }}>{label}</div>}<select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", background: T.bg3, border: `1px solid ${T.lineL}`, borderRadius: 8, padding: "10px 13px", color: T.t0, fontFamily: T.fS, fontSize: 13, outline: "none" }}>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>); }
function FTextarea({ label, value, onChange, placeholder, rows = 3 }) { return (<div style={{ marginBottom: 14 }}>{label && <div style={{ fontSize: 10, fontFamily: T.fM, letterSpacing: 1.5, color: T.t2, marginBottom: 6, textTransform: "uppercase" }}>{label}</div>}<textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ width: "100%", boxSizing: "border-box", background: T.bg3, border: `1px solid ${T.lineL}`, borderRadius: 8, padding: "10px 13px", color: T.t0, fontFamily: T.fS, fontSize: 13, outline: "none", resize: "vertical", minHeight: rows * 22 + "px" }} /></div>); }
function Modal({ open, onClose, title, children, width = 480, closeOnBackdrop = true }) { if (!open) return null; return (<div style={{ position: "fixed", inset: 0, background: "#00000090", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }} onClick={closeOnBackdrop ? onClose : undefined}><div className="hr-modal-panel" style={{ background: T.bg2, border: `1px solid ${T.lineL}`, borderRadius: 16, padding: "24px 26px", width, maxHeight: "86vh", overflowY: "auto", boxShadow: "0 24px 80px #000" }} onClick={e => e.stopPropagation()}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 10 }}><div style={{ fontSize: 16, fontWeight: 700, color: T.t0, fontFamily: T.fS, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div><button onClick={onClose} style={{ background: "transparent", border: "none", color: T.t2, cursor: "pointer", fontSize: 18, flexShrink: 0 }}>✕</button></div>{children}</div></div>); }
function PageTitle({ children, sub, action }) {
  return (
    <div className="hr-page-title">
      <div style={{ minWidth: 0 }}>
        <h2>{children}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {action && <div className="hr-row-flex">{action}</div>}
    </div>
  );
}
function StatCard({ label, value, sub, color = T.em, icon }) { return (<Card p="18px 20px" style={{ position: "relative", overflow: "hidden" }}><div style={{ position: "absolute", top: 14, right: 16, fontSize: 22, opacity: .07 }}>{icon}</div><div style={{ fontSize: 9, fontFamily: T.fM, letterSpacing: 2, color: T.t2, marginBottom: 8, textTransform: "uppercase" }}>{label}</div><div style={{ fontSize: 26, fontFamily: T.fM, fontWeight: 700, color, letterSpacing: -1, lineHeight: 1.1 }}>{value}</div>{sub && <div style={{ fontSize: 11, color: T.t2, marginTop: 4 }}>{sub}</div>}</Card>); }
function Th({ children, right }) { return <th style={{ padding: "9px 13px", textAlign: right ? "right" : "left", fontSize: 9, fontFamily: T.fM, letterSpacing: 1.5, color: T.t2, fontWeight: 500, background: T.bg1, borderBottom: `1px solid ${T.line}`, whiteSpace: "nowrap" }}>{children}</th>; }
function Td({ children, right, mono, bold, color }) { return <td style={{ padding: "11px 13px", textAlign: right ? "right" : "left", fontSize: 13, fontFamily: mono ? T.fM : T.fS, borderBottom: `1px solid ${T.line}`, color: color || T.t1, fontWeight: bold ? 700 : 400 }}>{children}</td>; }
function ShiftBadge({ sk }) { const s = SHIFTS_DEF[sk] || SHIFTS_DEF.L; return <Pill color={s.color} bg={s.bg}>{s.label}</Pill>; }
function StatusBadge({ status }) { const m = { hadir: { c: T.em, b: T.emD }, libur: { c: T.t2, b: T.bg3 }, belum: { c: T.blue, b: T.blueD }, terlambat: { c: T.amber, b: T.amberD }, izin: { c: T.purple, b: T.purpleD }, alpa: { c: T.red, b: T.redD } }; const x = m[status] || m.belum; return <Pill color={x.c} bg={x.b}>{status}</Pill>; }
function DeptBadge({ dept }) { return <Pill color={DEPT_COLOR[dept] || T.t1} bg={DEPT_BG[dept] || T.bg3}>{dept}</Pill>; }
function KasbonStatusBadge({ status }) {
  const m = { pending: { c: T.blue, b: T.blueD, label: "Menunggu" }, aktif: { c: T.amber, b: T.amberD, label: "Aktif" }, lunas: { c: T.em, b: T.emD, label: "Lunas" }, ditolak: { c: T.red, b: T.redD, label: "Ditolak" } };
  const x = m[status] || m.pending;
  return <Pill color={x.c} bg={x.b}>{x.label}</Pill>;
}

/* OLD LoginScreen moved to src/components/LoginScreen.js */

/* ══════════════ APP ROOT ══════════════ */
export default function App() {
  useFont();
  useGlobalStyles();
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const wrapTables = () => {
      document.querySelectorAll(".hr-main table").forEach((t) => {
        if (t.parentElement?.classList.contains("hr-auto-scroll")) return;
        const w = document.createElement("div");
        w.className = "hr-auto-scroll";
        t.parentNode.insertBefore(w, t);
        w.appendChild(t);
      });
    };
    const id = setTimeout(wrapTables, 0);
    const mo = new MutationObserver(wrapTables);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { clearTimeout(id); mo.disconnect(); };
  }, [currentUser]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [attendance, setAttendance] = useState([]);
  const [kasbon, setKasbon] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [page, setPage] = useState("absensi");

  const shared = { employees, setEmployees, outlets, setOutlets, schedule, setSchedule, attendance, setAttendance, kasbon, setKasbon, adjustments, setAdjustments, currentUser, page, setPage };

  // On mount: try to restore session without re-prompting for PIN
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) { setLoading(false); return; }
        const json = await res.json();
        if (!json.success || !json.data?.user) { setLoading(false); return; }

        const { user, outlets: outletsData, employees: employeesData, schedules: schedulesData, kasbon: kasbonData, attendances: attendanceData } = json.data;

        const parsedSchedule = {};
        (schedulesData || []).forEach(row => {
          if (!parsedSchedule[row.userId]) parsedSchedule[row.userId] = {};
          if (!parsedSchedule[row.userId][row.month]) parsedSchedule[row.userId][row.month] = {};
          const dayNum = row.dayNum || (row.dayIdx !== undefined ? row.dayIdx + 1 : null);
          if (dayNum !== null) parsedSchedule[row.userId][row.month][dayNum] = row.shiftKey;
        });

        const normalizedOutlets = (outletsData || []).map(o => ({
          ...o,
          outletHours: o.outletHours ? (typeof o.outletHours === "string" ? JSON.parse(o.outletHours) : o.outletHours) : {},
        }));

        const normalizedKasbon = (kasbonData || []).map(k => ({ ...k, empId: k.userId }));
        const normalizedAttendance = (attendanceData || []).map(a => ({ ...a, empId: a.userId }));

        setCurrentUser(user);
        setOutlets(normalizedOutlets);
        setEmployees((employeesData || []).filter(e => e.role !== "superadmin"));
        setSchedule(parsedSchedule);
        setAttendance(normalizedAttendance);
        setKasbon(normalizedKasbon);
        setAdjustments([]);
        setPage(user.role === "karyawan" ? "absensi" : "home");
      } catch {
        // session expired or network error — show login
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogin = (user, outletsData, employeesData, schedulesData, kasbonData, attendanceData) => {
    const parsedSchedule = {};
    (schedulesData || []).forEach(row => {
      if (!parsedSchedule[row.userId]) parsedSchedule[row.userId] = {};
      if (!parsedSchedule[row.userId][row.month]) parsedSchedule[row.userId][row.month] = {};
      const dayNum = row.dayNum || (row.dayIdx !== undefined ? row.dayIdx + 1 : null);
      if (dayNum !== null) parsedSchedule[row.userId][row.month][dayNum] = row.shiftKey;
    });

    const normalizedOutlets = (outletsData || []).map(o => ({
      ...o,
      outletHours: o.outletHours ? (typeof o.outletHours === "string" ? JSON.parse(o.outletHours) : o.outletHours) : {},
    }));

    const normalizedKasbon = (kasbonData || []).map(k => ({ ...k, empId: k.userId }));
    const normalizedAttendance = (attendanceData || []).map(a => ({ ...a, empId: a.userId }));

    setCurrentUser(user);
    setOutlets(normalizedOutlets);
    setEmployees((employeesData || []).filter(e => e.role !== "superadmin"));
    setSchedule(parsedSchedule);
    setAttendance(normalizedAttendance);
    setKasbon(normalizedKasbon);
    setAdjustments([]);
    setPage(user.role === "karyawan" ? "absensi" : "home");
  };

  if (loading) return (
    <div style={{ fontFamily: T.fS, background: T.bg, minHeight: "100vh", color: T.t0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 48, height: 48, border: `3px solid ${T.line}`, borderTopColor: T.em, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <div style={{ fontSize: 14, color: T.t2 }}>Memuat...</div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!currentUser) return <LoginScreen onLogin={handleLogin} />;
  const role = currentUser.role;
  const navTo = (p) => { setPage(p); setSidebarOpen(false); };
  const PAGE_LABEL = {
    absensi: "Absensi", home: "Dashboard", jadwal: "Jadwal", kasbon: "Kasbon",
    karyawan: "Karyawan", outlet: "Outlet", payroll: "Payroll",
  };

  return (
    <div style={{ fontFamily: T.fS, background: T.bg, minHeight: "100vh", color: T.t0, display: "flex" }}>
      <div className={`hr-scrim ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar role={role} page={page} setPage={navTo} user={currentUser} onLogout={async () => { try { await fetch("/api/auth/logout", { method: "POST" }); } catch { } setCurrentUser(null); setPage("absensi"); }} kasbon={kasbon} open={sidebarOpen} />
      <main className="hr-main" style={{ marginLeft: 220, flex: 1, padding: "28px 30px", minWidth: 0 }}>
        <div className="hr-topbar">
          <button className="hr-mobile-toggle" onClick={() => setSidebarOpen(true)} aria-label="Buka menu" style={{ background: "transparent", border: "none", color: T.t0, cursor: "pointer", padding: 6, fontSize: 20, lineHeight: 1 }}>☰</button>
          <div className="hr-topbar-title">{PAGE_LABEL[page] || "HR System"}</div>
          <div style={{ width: 28 }} />
        </div>
        {role === "karyawan" && <>{page === "absensi" && <EmpAbsensi {...shared} />}{page === "home" && <EmpHome {...shared} />}{page === "jadwal" && <EmpJadwal {...shared} />}{page === "kasbon" && <EmpKasbon {...shared} />}</>}
        {(role === "manager" || role === "superadmin") && <>{page === "home" && <MgrHome {...shared} />}{page === "karyawan" && <MgrKaryawan {...shared} />}{page === "jadwal" && <MgrJadwal {...shared} />}{page === "absensi" && <MgrAbsensi {...shared} />}{page === "kasbon" && <MgrKasbon {...shared} />}{page === "outlet" && role === "superadmin" && <SAOutlet {...shared} />}{page === "payroll" && role === "superadmin" && <SAPayroll {...shared} />}</>}
      </main>
    </div>
  );
}

/* ══════════════ SIDEBAR ══════════════ */
function Sidebar({ role, page, setPage, user, onLogout, kasbon, open = false }) {
  const pendingCount = kasbon.filter(k => k.status === "pending").length;
  const navByRole = {
    karyawan: [{ id: "absensi", icon: "📍", label: "Absensi" }, { id: "home", icon: "⊞", label: "Dashboard" }, { id: "jadwal", icon: "📅", label: "Jadwal Saya" }, { id: "kasbon", icon: "💳", label: "Kasbon" }],
    manager: [{ id: "home", icon: "⊞", label: "Dashboard" }, { id: "karyawan", icon: "👥", label: "Karyawan" }, { id: "jadwal", icon: "📅", label: "Kelola Jadwal" }, { id: "absensi", icon: "✓", label: "Override Absensi" }, { id: "kasbon", icon: "💳", label: "Kasbon", badge: pendingCount }],
    superadmin: [{ id: "home", icon: "⊞", label: "Dashboard" }, { id: "karyawan", icon: "👥", label: "Karyawan" }, { id: "jadwal", icon: "📅", label: "Kelola Jadwal" }, { id: "absensi", icon: "✓", label: "Override Absensi" }, { id: "kasbon", icon: "💳", label: "Kasbon", badge: pendingCount }, { id: "outlet", icon: "📍", label: "Outlet" }, { id: "payroll", icon: "💰", label: "Payroll" }],
  };
  const nav = navByRole[role] || [];
  const rc = role === "superadmin" ? T.purple : role === "manager" ? T.amber : T.em;
  const rl = role === "superadmin" ? "Super Admin" : role === "manager" ? "Manager" : "Karyawan";
  return (
    <aside className={`hr-sidebar ${open ? "open" : ""}`} style={{ width: 220, background: T.bg1, borderRight: `1px solid ${T.line}`, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 20 }}>
      <div style={{ padding: "22px 20px 16px" }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ fontSize: 22 }}>⬡</div><div><div style={{ fontSize: 15, fontWeight: 800, color: T.t0, letterSpacing: -.5 }}>HR<span style={{ color: T.em }}>System</span></div><div style={{ fontSize: 9, fontFamily: T.fM, letterSpacing: 1.5, color: T.t2 }}>v4.0</div></div></div></div>
      <nav style={{ padding: "4px 10px", flex: 1 }}>
        {nav.map(n => {
          const on = page === n.id; return (
            <button key={n.id} onClick={() => setPage(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: on ? T.emD : "transparent", color: on ? T.em : T.t2, fontFamily: T.fS, fontWeight: on ? 600 : 400, fontSize: 13, marginBottom: 2, textAlign: "left", transition: "all .15s" }}>
              <span style={{ fontSize: 15 }}>{n.icon}</span>{n.label}
              {n.badge > 0 && <span style={{ marginLeft: "auto", background: T.red, color: "#fff", borderRadius: 10, fontSize: 9, fontFamily: T.fM, padding: "2px 6px", fontWeight: 700 }}>{n.badge}</span>}
              {on && !n.badge && <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: T.em }} />}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.line}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Avatar name={user.name} color={rc} bg={rc + "22"} size={34} />
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: T.t0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div><Pill color={rc} bg={rc + "22"} small>{rl}</Pill></div>
        </div>
        <button onClick={onLogout} style={{ width: "100%", background: "transparent", border: `1px solid ${T.line}`, borderRadius: 8, padding: "7px", color: T.t2, fontFamily: T.fS, fontSize: 12, cursor: "pointer" }}>Keluar</button>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════
   REVISI 1: ANTI FAKE GPS
   Teknik yang diterapkan:
   1. accuracy check — tolak jika akurasi GPS > 100m (terlalu kasar = emulator/fake)
   2. speed check — tolak jika kecepatan tidak wajar (teleport)
   3. movement consistency — bandingkan dengan posisi sebelumnya
   4. timestamp freshness — tolak koordinat yang sudah "basi"
   5. altitude sanity — koordinat tanpa altitude biasanya dari emulator
══════════════════════════════════════════════ */
function EmpAbsensi({ currentUser, attendance, setAttendance, schedule, outlets }) {
  const [clock, setClock] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(t); }, []);

  const [gpsState, setGpsState] = useState("idle");
  const [userCoords, setUserCoords] = useState(null);
  const [dist, setDist] = useState(null);
  const [gpsError, setGpsError] = useState("");
  const [gpsFrameError, setGpsFrameError] = useState("");
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [securityFlag, setSecurityFlag] = useState(""); // pesan warning keamanan
  const prevCoordsRef = useRef(null);
  const prevTimestampRef = useRef(null);
  const outletRef = useRef(null);
  useEffect(() => { outletRef.current = outlets.find(o => o.id === currentUser.outletId) || null; }, [outlets, currentUser]);

  const [actionState, setActionState] = useState("idle");
  const [msg, setMsg] = useState({ text: "", ok: true });

  const today = todayStr();
  const outlet = outlets.find(o => o.id === currentUser.outletId);
  const { dayIdx } = getRealDayAndWeek();
  const todayDay = parseInt(today.split("-")[2]);
  const now = new Date();
  const mk = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const shiftKey = schedule[currentUser.id]?.[mk]?.[todayDay] ?? "L";
  const shiftDef = getShiftDef(outlet);
  const shift = shiftDef[shiftKey] || SHIFTS_DEF[shiftKey];
  const todayAtt = attendance.find(a => a.empId === currentUser.id && a.date === today);

  const hh = String(clock.getHours()).padStart(2, "0");
  const mm = String(clock.getMinutes()).padStart(2, "0");
  const ss = String(clock.getSeconds()).padStart(2, "0");
  const dateLabel = `${DAYS_ID[dayIdx]}, ${clock.getDate()} ${MONTHS[clock.getMonth()]} ${clock.getFullYear()}`;

  // ── ANTI FAKE GPS VALIDATION ──
  const validateGPS = (pos) => {
    const { latitude: lat, longitude: lng, accuracy, altitude, speed } = pos.coords;
    const ts = pos.timestamp;
    const warnings = [];

    // 1. Accuracy check — GPS palsu/emulator sering accuracy=0 atau sangat besar
    if (accuracy === null || accuracy === undefined) {
      warnings.push("Akurasi GPS tidak tersedia — kemungkinan lokasi palsu");
    } else if (accuracy > 250) {
      warnings.push(`Akurasi GPS terlalu rendah (${Math.round(accuracy)}m) — gunakan di area terbuka`);
    }

    // 2. Altitude check — emulator sering tidak punya altitude (disabled: too many false positives on real phones)
    // if (altitude === null) { warnings.push("Sinyal altitude tidak terdeteksi — kemungkinan menggunakan GPS palsu"); }

    // 3. Speed sanity — jika sebelumnya ada posisi, cek apakah berpindah terlalu cepat
    if (prevCoordsRef.current && prevTimestampRef.current) {
      const { lat: pLat, lng: pLng } = prevCoordsRef.current;
      const pTs = prevTimestampRef.current;
      const dMeters = calcDist(pLat, pLng, lat, lng);
      const dSecs = (ts - pTs) / 1000;
      if (dSecs > 0 && dSecs < 30) {
        const mps = dMeters / dSecs;
        // Lebih dari 50 m/s (180 km/jam) tidak wajar untuk pejalan kaki
        if (mps > 50) {
          warnings.push(`Perpindahan tidak wajar (${Math.round(mps * 3.6)} km/jam) — kemungkinan lokasi dipalsukan`);
        }
      }
    }

    // 4. Timestamp freshness — koordinat tidak boleh lebih dari 60 detik
    const ageSecs = (Date.now() - ts) / 1000;
    if (ageSecs > 60) {
      warnings.push(`Data GPS sudah ${Math.round(ageSecs)} detik — tidak fresh`);
    }

    prevCoordsRef.current = { lat, lng };
    prevTimestampRef.current = ts;

    return { lat, lng, accuracy, altitude, warnings, isValid: warnings.length === 0 || accuracy <= 250 };
  };

  const processGPS = (pos) => {
    // Look up outlet from live outlets array to avoid stale closure
    const myOutlet = outlets.find(o => o.id === currentUser.outletId);
    console.log("[GPS DEBUG] pos:", pos.coords.latitude, pos.coords.longitude, "myOutlet:", myOutlet ? `${myOutlet.lat},${myOutlet.lng} radius=${myOutlet.radius}` : "NULL");
    if (!myOutlet) {
      setGpsState("fail");
      setGpsError("Data outlet belum siap. Refresh halaman dan coba lagi.");
      setGpsFrameError("");
      return;
    }
    const { lat, lng, accuracy, warnings, isValid } = validateGPS(pos);
    setUserCoords({ lat, lng });
    setGpsAccuracy(Math.round(accuracy || 0));
    const d = calcDist(lat, lng, myOutlet.lat, myOutlet.lng);
    setDist(Math.round(d));
    setGpsError("");
    setGpsFrameError("");

    if (warnings.length > 0) {
      setSecurityFlag(warnings[0]);
    } else {
      setSecurityFlag("");
    }

    // Gagal jika akurasi jelek ATAU di luar radius
    if (accuracy && accuracy > 250) {
      setGpsState("fail");
      setGpsError(`Akurasi ${Math.round(accuracy)}m terlalu rendah. Pindah ke area terbuka atau coba muat ulang halaman.`);
      setGpsFrameError("");
    } else if (d > myOutlet.radius) {
      setGpsState("fail");
      setGpsError("");
      setGpsFrameError(`Anda ${Math.round(d)}m dari outlet (batas: ${myOutlet.radius}m).`);
    } else {
      setGpsState("ok");
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) { setGpsState("fail"); setGpsError("Browser tidak mendukung GPS."); return; }
    if (!outlet) return; // tunggu data outlet siap
    const opt = { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 };
    const get = () => {
      if (gpsState === "requesting") return; // jangan interrupt klik manual
      navigator.geolocation.getCurrentPosition(processGPS, e => {
        setGpsState("denied");
        setGpsError(e.code === 1
          ? "Izin GPS ditolak browser. Aktifkan lokasi di pengaturan browser/perangkat lalu coba lagi."
          : "Gagal deteksi lokasi.");
      }, opt);
    };
    get();
    const t = setInterval(get, 25000);
    return () => clearInterval(t);
  }, [outlet]);

  const reqGps = () => {
    const myOutletId = currentUser.outletId;
    if (!navigator.geolocation) { setGpsState("fail"); setGpsError("Browser tidak mendukung GPS."); setDist(null); return; }
    setGpsState("requesting");
    setGpsError("");
    setDist(null);
    setGpsAccuracy(null);
    setUserCoords(null);
    setSecurityFlag("");
    setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng, accuracy } = pos.coords;
          setUserCoords({ lat, lng });
          setGpsAccuracy(Math.round(accuracy || 0));
          const myOutlet = outlets.find(o => o.id === myOutletId);
          if (!myOutlet) {
            setGpsState("fail");
            setGpsError(`Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)} — data outlet belum siap.`);
            return;
          }
          const d = calcDist(lat, lng, myOutlet.lat, myOutlet.lng);
          setDist(Math.round(d));
          if (accuracy && accuracy > 250) {
            setGpsState("fail");
            setGpsError(`Akurasi terlalu rendah (${Math.round(accuracy)}m).`);
          } else if (d > myOutlet.radius) {
            setGpsState("fail");
            setGpsError(`Jarak ${Math.round(d)}m dari outlet (batas: ${myOutlet.radius}m).`);
          } else {
            setGpsState("ok");
            setGpsError("");
          }
        },
        (e) => {
          setGpsState(e.code === 1 ? "denied" : "fail");
          setGpsError(e.code === 1 ? "Akses GPS ditolak." : "Gagal deteksi lokasi.");
          setDist(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }, 300);
  };

  const doCheckIn = () => {
    if (gpsState !== "ok") { setMsg({ text: `❌ Lokasi belum terverifikasi.`, ok: false }); return; }
    if (securityFlag) { setMsg({ text: `❌ Peringatan keamanan: ${securityFlag}`, ok: false }); return; }
    if (!userCoords) { setMsg({ text: `❌ Koordinat GPS belum tersedia.`, ok: false }); return; }
    setActionState("processing");
    fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "checkin", lat: userCoords.lat, lng: userCoords.lng }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setAttendance(prev => {
            const ex = prev.find(a => a.empId === currentUser.id && a.date === today);
            const lateMins = data.data.lateMins || 0;
            if (ex) return prev.map(a => a.empId === currentUser.id && a.date === today ? { ...a, status: "hadir", checkIn: data.data.time, lateMins } : a);
            return [...prev, { id: Date.now(), empId: currentUser.id, date: today, dayIdx, week: weekIdx, shiftKey, status: "hadir", checkIn: data.data.time, checkOut: null, lateMins, earlyMins: 0, overtimeCount: 0, note: "" }];
          });
          setMsg({ text: data.data.message, ok: !data.data.isLate });
        } else {
          setMsg({ text: `❌ ${data.error}`, ok: false });
        }
        setActionState("done");
      })
      .catch(() => { setMsg({ text: "❌ Gagal menyimpan absen.", ok: false }); setActionState("idle"); });
  };

  const doCheckOut = () => {
    if (gpsState !== "ok") { setMsg({ text: "❌ Lokasi belum terverifikasi.", ok: false }); return; }
    if (securityFlag) { setMsg({ text: `❌ Peringatan keamanan: ${securityFlag}`, ok: false }); return; }
    if (!userCoords) { setMsg({ text: `❌ Koordinat GPS belum tersedia.`, ok: false }); return; }
    setActionState("processing");
    fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "checkout", lat: userCoords.lat, lng: userCoords.lng }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setAttendance(prev => prev.map(a => a.empId === currentUser.id && a.date === today ? { ...a, checkOut: data.data.time } : a));
          setMsg({ text: data.data.message, ok: true });
        } else {
          setMsg({ text: `❌ ${data.error}`, ok: false });
        }
        setActionState("done");
      })
      .catch(() => { setMsg({ text: "❌ Gagal menyimpan absen.", ok: false }); setActionState("idle"); });
  };

  const gpsColor = gpsState === "ok" ? T.em : ["fail", "denied"].includes(gpsState) ? T.red : T.amber;
  const gpsBg = gpsState === "ok" ? T.emD : ["fail", "denied"].includes(gpsState) ? T.redD : T.amberD;
  const gpsLabel = {
    idle: "Mendeteksi lokasi...",
    requesting: "Meminta akses GPS...",
    ok: `✓ Dalam radius (${dist}m / ${outlet?.radius || 50}m)`,
    fail: dist !== null ? `✗ ${Math.round(dist)}m di luar radius (batas: ${outlet?.radius || 50}m)` : "✗ Di luar radius",
    denied: "✗ Izin GPS ditolak"
  }[gpsState] ?? "-";
  const nowMinsLive = clock.getHours() * 60 + clock.getMinutes();
  const sStart = shiftToMins(shift?.start);
  const sEnd = shiftToMins(shift?.end);

  return (
    <div>
      {shiftKey !== "L" && !todayAtt?.checkIn && (
        <div style={{ background: T.amberD, border: `1px solid ${T.amber}55`, borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div><div style={{ fontSize: 14, fontWeight: 700, color: T.amber }}>Wajib Check-In Sekarang</div><div style={{ fontSize: 12, color: T.t1, marginTop: 2 }}>Shift {shift?.label} dimulai pukul {shift?.start}. Check-in dulu sebelum akses fitur lain.</div></div>
        </div>
      )}
      <PageTitle sub="Absensi real-time berbasis GPS — dilindungi anti-fake GPS">Absensi Harian</PageTitle>

      <div className="hr-absensi-grid" style={{ marginBottom: 18 }}>
        {/* Clock */}
        <Card p="18px 20px" className="hr-clock-cell" style={{ textAlign: "center", background: T.bg3 }}>
          <div style={{ fontSize: 9, fontFamily: T.fM, letterSpacing: 2, color: T.t2, marginBottom: 8 }}>WAKTU SEKARANG</div>
          <div style={{ fontFamily: T.fM, fontWeight: 700, letterSpacing: 1, lineHeight: 1 }}>
            <span style={{ fontSize: 36, color: T.t0 }}>{hh}:{mm}</span>
            <span style={{ fontSize: 20, color: T.t2, marginLeft: 3 }}>{ss}</span>
          </div>
          <div style={{ fontSize: 11, color: T.t2, marginTop: 8 }}>{dateLabel}</div>
        </Card>

        {/* GPS + Security */}
        <Card p="18px 20px">
          <div style={{ fontSize: 9, fontFamily: T.fM, letterSpacing: 2, color: T.t2, marginBottom: 6 }}>LOKASI GPS & KEAMANAN</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.t0, marginBottom: 2 }}>{outlet?.name}</div>
          <div style={{ fontSize: 11, color: T.t2, marginBottom: 10 }}>{outlet?.address}</div>
          {/* GPS status */}
          <div style={{ background: gpsBg, border: `1px solid ${gpsColor}33`, borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {gpsState === "requesting" ? (
                <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0 }}><circle cx="5" cy="5" r="4" fill="none" stroke={gpsColor} strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="5"><animateTransform attributeName="transform" type="rotate" from="0 5 5" to="360 5 5" dur="0.8s" repeatCount="indefinite" /></circle></svg>
              ) : (
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: gpsColor, flexShrink: 0 }} />
              )}
              <span style={{ fontSize: 12, color: gpsColor, fontWeight: 600 }}>{gpsLabel}</span>
            </div>
            {gpsError && <div style={{ fontSize: 11, color: T.red, marginTop: 4 }}>{gpsError}</div>}
            {gpsFrameError && <div style={{ fontSize: 11, color: T.red, marginTop: 4 }}>{gpsFrameError}</div>}
          </div>
          {/* Guide when GPS denied */}
          {gpsState === "denied" && (
            <div style={{ background: T.amberD, border: `1px solid ${T.amber}44`, borderRadius: 8, padding: "10px 14px", fontSize: 11, color: T.amber, lineHeight: 1.8 }}>
              <b>Cara mengaktifkan GPS:</b><br />
              1. Buka <b>Pengaturan &gt; Lokasi</b> perangkat → ON<br />
              2. Di browser: tap icon 🔒/📍 → pilih <b>"Izinkan"</b><br />
              3. Tutup & buka ulang browser HR System<br />
              4. Atau pakai Chrome/Edge (rekomendasi)<br />
              <button onClick={reqGps} style={{ marginTop: 8, background: T.amber, border: "none", borderRadius: 6, padding: "6px 12px", color: "#001810", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>🔄 Coba Lagi</button>
            </div>
          )}
          {/* Distance — always show once GPS has returned a value */}
          {dist !== null && (
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              <Pill color={dist <= outlet?.radius ? T.em : T.red} bg={dist <= outlet?.radius ? T.emD : T.redD} small>
                📍 {Math.round(dist)}m / {outlet?.radius || 50}m
              </Pill>
              {gpsAccuracy !== null && (
                <Pill color={gpsAccuracy <= 30 ? T.em : gpsAccuracy <= 100 ? T.amber : T.red} bg={gpsAccuracy <= 30 ? T.emD : gpsAccuracy <= 100 ? T.amberD : T.redD} small>
                  Akurasi: {gpsAccuracy}m
                </Pill>
              )}
              {userCoords && <Pill color={T.t2} bg={T.bg3} small>{userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}</Pill>}
            </div>
          )}
          {/* Security warning */}
          {securityFlag && (
            <div style={{ background: T.redD, border: `1px solid ${T.red}44`, borderRadius: 7, padding: "7px 10px", marginBottom: 8, fontSize: 11, color: T.red }}>
              🔒 {securityFlag}
            </div>
          )}
          {gpsState !== "ok" && <SBtn size="sm" variant="ghost" onClick={reqGps} style={{ fontSize: 11 }}>🔄 Perbarui Lokasi</SBtn>}
        </Card>

        {/* Shift */}
        <Card p="18px 20px" style={{ background: shiftKey === "L" ? T.bg2 : shift?.bg, border: `1px solid ${shiftKey === "L" ? T.line : shift?.color + "44"}` }}>
          <div style={{ fontSize: 9, fontFamily: T.fM, letterSpacing: 2, color: T.t2, marginBottom: 6 }}>SHIFT HARI INI</div>
          {shiftKey === "L" ? (
            <div style={{ fontSize: 20, fontWeight: 800, color: T.t2, marginTop: 8 }}>🌙 Hari Libur</div>
          ) : (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: shift?.color }}>{shift?.label}</div>
              <div style={{ fontFamily: T.fM, fontSize: 22, fontWeight: 700, color: T.t0, margin: "6px 0" }}>{shift?.start}<span style={{ fontSize: 13, color: T.t2 }}>→</span>{shift?.end}</div>
              <div style={{ fontSize: 11, color: T.t2, marginBottom: 8 }}>Toleransi terlambat: 15 menit</div>
              {sStart !== null && nowMinsLive < sStart && !todayAtt?.checkIn && <Pill color={T.blue} bg={T.blueD}>Mulai dalam {formatMins(sStart - nowMinsLive)}</Pill>}
              {sEnd !== null && nowMinsLive < sEnd && todayAtt?.checkIn && !todayAtt?.checkOut && <Pill color={T.em} bg={T.emD}>Selesai dalam {formatMins(sEnd - nowMinsLive)}</Pill>}
              {sEnd !== null && nowMinsLive > sEnd && todayAtt?.checkIn && !todayAtt?.checkOut && <Pill color={T.purple} bg={T.purpleD}>Lembur berlangsung</Pill>}
            </>
          )}
        </Card>
      </div>

      {/* Action Panel */}
      {shiftKey !== "L" && (
        <Card p="32px" style={{ marginBottom: 18, textAlign: "center" }}>
          {!todayAtt?.checkIn && (
            <div>
              <div style={{ fontSize: 11, fontFamily: T.fM, letterSpacing: 2, color: T.amber, marginBottom: 18 }}>⚠ BELUM CHECK-IN — WAJIB ABSEN</div>
              <div style={{ fontSize: 48, marginBottom: 12, lineHeight: 1 }}>📍</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.t0, marginBottom: 6 }}>Siap untuk check-in?</div>
              <div style={{ fontSize: 13, color: T.t2, marginBottom: 20 }}>Waktu tercatat: <b style={{ color: T.t0, fontFamily: T.fM }}>{hh}:{mm}:{ss}</b></div>
              {gpsState === "denied" && (
                <div style={{ background: T.redD, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "12px 18px", marginBottom: 16, fontSize: 13, color: T.red, lineHeight: 1.8 }}>
                  <b>⚠ GPS belum aktif.</b> Cek panduan di atas panel GPS untuk cara aktifkan.<br />Setelah aktif, tombol check-in akan aktif otomatis.
                </div>
              )}
              {gpsState === "fail" && !gpsError.includes("ditolak") && <div style={{ background: T.redD, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "12px 18px", marginBottom: 20, fontSize: 13, color: T.red, lineHeight: 1.8 }}>
                {gpsError
                  ? <><b>⚠ Gagal verifikasi lokasi:</b> {gpsError}</>
                  : <><b>⚠ Lokasi belum terverifikasi.</b><br />Pastikan GPS aktif dan Anda berada di area outlet.</>}
                {dist !== null && <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600 }}>📍 Anda saat ini: <span style={{ color: T.red }}>{Math.round(dist)}m</span> dari outlet (batas: {outlet?.radius || 50}m)</div>}
              </div>}
              {securityFlag && <div style={{ background: T.redD, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "12px 18px", marginBottom: 20, fontSize: 13, color: T.red }}>🔒 {securityFlag}</div>}
              {sStart !== null && nowMinsLive > sStart + 15 && <div style={{ marginBottom: 16, background: T.amberD, border: `1px solid ${T.amber}44`, borderRadius: 8, padding: "10px 18px", fontSize: 13, color: T.amber, display: "inline-block" }}>⚠ Sudah terlambat {nowMinsLive - sStart} menit</div>}
              <SBtn size="lg" onClick={doCheckIn} disabled={gpsState !== "ok" || !!securityFlag || actionState === "processing"} style={{ justifyContent: "center", minWidth: 200, fontSize: 15, padding: "14px 32px" }}>
                {actionState === "processing" ? "⏳ Menyimpan..." : "✓ CHECK-IN SEKARANG"}
              </SBtn>
            </div>
          )}
          {todayAtt?.checkIn && !todayAtt?.checkOut && (
            <div>
              <div style={{ fontSize: 11, fontFamily: T.fM, letterSpacing: 2, color: T.em, marginBottom: 18 }}>STATUS: SEDANG BEKERJA</div>
              <div style={{ fontSize: 48, marginBottom: 10, lineHeight: 1 }}>✅</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.em, marginBottom: 6 }}>Check-in tercatat pukul</div>
              <div style={{ fontFamily: T.fM, fontSize: 40, fontWeight: 700, color: T.t0, marginBottom: 8 }}>{todayAtt.checkIn}</div>
              {todayAtt.lateMins > 15 && <div style={{ marginBottom: 14 }}><Pill color={T.amber} bg={T.amberD}>⚠ Terlambat {todayAtt.lateMins} menit</Pill></div>}
              {(() => { const [ch, cm] = todayAtt.checkIn.split(":").map(Number); const wm = nowMinsLive - (ch * 60 + cm); return wm > 0 ? (<div style={{ fontSize: 13, color: T.t2, marginBottom: 20 }}>Sudah bekerja <b style={{ color: T.t1 }}>{formatMins(wm)}</b></div>) : null; })()}
              {securityFlag && <div style={{ background: T.redD, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "12px 18px", marginBottom: 20, fontSize: 13, color: T.red }}>🔒 {securityFlag}</div>}
              <SBtn variant="secondary" size="lg" onClick={doCheckOut} disabled={gpsState !== "ok" || !!securityFlag || actionState === "processing"} style={{ justifyContent: "center", minWidth: 200, fontSize: 15, padding: "14px 32px" }}>
                {actionState === "processing" ? "⏳ Menyimpan..." : "⬛ Check-Out"}
              </SBtn>
            </div>
          )}
          {todayAtt?.checkIn && todayAtt?.checkOut && (
            <div>
              <div style={{ fontSize: 11, fontFamily: T.fM, letterSpacing: 2, color: T.em, marginBottom: 18 }}>ABSENSI SELESAI</div>
              <div style={{ fontSize: 48, marginBottom: 10, lineHeight: 1 }}>🎉</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.em, marginBottom: 12 }}>Selesai Hari Ini!</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 16 }}>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, fontFamily: T.fM, color: T.t2, marginBottom: 4 }}>MASUK</div><div style={{ fontFamily: T.fM, fontSize: 26, fontWeight: 700, color: T.t0 }}>{todayAtt.checkIn}</div></div>
                <div style={{ fontSize: 24, color: T.t2, alignSelf: "center" }}>→</div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, fontFamily: T.fM, color: T.t2, marginBottom: 4 }}>KELUAR</div><div style={{ fontFamily: T.fM, fontSize: 26, fontWeight: 700, color: T.t0 }}>{todayAtt.checkOut}</div></div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                {todayAtt.lateMins > 15 && <Pill color={T.amber} bg={T.amberD}>Terlambat {todayAtt.lateMins} mnt</Pill>}
                {todayAtt.overtimeCount > 0 && <Pill color={T.purple} bg={T.purpleD}>Lembur {todayAtt.overtimeCount}× hari ini</Pill>}
                {todayAtt.earlyMins > 0 && <Pill color={T.red} bg={T.redD}>Pulang awal {formatMins(todayAtt.earlyMins)}</Pill>}
                {todayAtt.lateMins <= 15 && !todayAtt.overtimeCount && !todayAtt.earlyMins && <Pill color={T.em} bg={T.emD}>✓ Sempurna</Pill>}
              </div>
            </div>
          )}
          {msg.text && <div style={{ marginTop: 20, background: msg.ok ? T.emD : T.redD, border: `1px solid ${msg.ok ? T.em : T.red}44`, borderRadius: 10, padding: "12px 20px", fontSize: 13, color: msg.ok ? T.em : T.red }}>{msg.text}</div>}
        </Card>
      )}
      {shiftKey === "L" && <Card p="32px" style={{ textAlign: "center", marginBottom: 18 }}><div style={{ fontSize: 48, marginBottom: 10 }}>🌙</div><div style={{ fontSize: 18, fontWeight: 700, color: T.t2 }}>Hari Libur</div></Card>}

      {/* Rekap */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontFamily: T.fM, letterSpacing: 1.5, color: T.t2 }}>REKAP ABSENSI BULAN INI</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[["Hadir", attendance.filter(a => a.empId === currentUser.id && a.status === "hadir").length, T.em], ["Terlambat", attendance.filter(a => a.empId === currentUser.id && a.lateMins > 15).length, T.amber], ["Lembur", attendance.filter(a => a.empId === currentUser.id && a.overtimeCount > 0).length, T.purple]].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: "center", background: T.bg3, borderRadius: 8, padding: "6px 14px" }}>
                <div style={{ fontFamily: T.fM, fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
                <div style={{ fontSize: 9, color: T.t2, fontFamily: T.fM, letterSpacing: 1 }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hr-table-scroll">
          <table className="hr-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Tanggal</Th><Th>Hari</Th><Th>Shift</Th><Th>Masuk</Th><Th>Keluar</Th><Th>Status</Th><Th right>Terlambat</Th><Th right>Lembur</Th></tr></thead>
            <tbody>
              {attendance.filter(a => a.empId === currentUser.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20).map(a => (
                <tr key={a.id} style={{ background: a.date === today ? T.emD + "22" : "transparent" }}>
                  <Td mono color={a.date === today ? T.em : T.t1}>{a.date.slice(8)} {MONTHS[parseInt(a.date.slice(5, 7)) - 1]?.slice(0, 3)}</Td>
                  <Td color={T.t2}>{DAYS_S[a.dayIdx] ?? "-"}</Td>
                  <Td><ShiftBadge sk={a.shiftKey} /></Td>
                  <Td mono color={a.lateMins > 15 ? T.amber : T.t1}>{a.checkIn || "—"}</Td>
                  <Td mono>{a.checkOut || "—"}</Td>
                  <Td><StatusBadge status={a.status === "hadir" && a.lateMins > 15 ? "terlambat" : a.status} /></Td>
                  <Td right mono color={a.lateMins > 15 ? T.red : T.t2}>{a.lateMins > 0 ? formatMins(a.lateMins) : "—"}</Td>
                  <Td right mono color={a.overtimeCount > 0 ? T.purple : T.t2}>{a.overtimeCount > 0 ? `${a.overtimeCount}×` : "—"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ══════════════ EMP: DASHBOARD ══════════════ */
function EmpHome({ currentUser, attendance, schedule, kasbon, outlets }) {
  const today = todayStr();
  const todayAtt = attendance.find(a => a.empId === currentUser.id && a.date === today);
  const nd = new Date(), mp = `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, "0")}`;
  const atts = attendance.filter(a => a.empId === currentUser.id && a.date.startsWith(mp) && a.status === "hadir");
  const myKasbon = kasbon.filter(k => k.empId === currentUser.id && k.status === "aktif").reduce((s, k) => s + k.amount, 0);
  const todayDayNum = nd.getDate();
  const sk = schedule[currentUser.id]?.[mp]?.[todayDayNum] ?? "L";
  const outlet = outlets.find(o => o.id === currentUser.outletId);
  const shiftDef = getShiftDef(outlet);
  const shift = shiftDef[sk] || SHIFTS_DEF[sk];
  const now = new Date();
  const dayLabel = DAYS_ID[now.getDay() === 0 ? 6 : now.getDay() - 1];
  return (
    <div>
      <PageTitle sub={`Selamat datang, ${currentUser.name.split(" ")[0]}! — ${dayLabel}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`}>Dashboard</PageTitle>
      <Card style={{ marginBottom: 20, background: todayAtt?.status === "hadir" ? T.emD : T.bg2, border: `1px solid ${todayAtt?.status === "hadir" ? T.em + "44" : T.line}` }} p="22px 24px">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: T.fM, letterSpacing: 1.5, color: T.em, marginBottom: 6 }}>STATUS HARI INI</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.t0 }}>{todayAtt?.status === "hadir" ? "✓ Sudah Absen" : sk === "L" ? "🌙 Hari Libur" : "⚠ Belum Absen"}</div>
            {sk && sk !== "L" && <div style={{ marginTop: 8, display: "flex", gap: 10 }}><ShiftBadge sk={sk} /><span style={{ fontSize: 12, color: T.t1 }}>{shift?.start || SHIFTS_DEF[sk]?.start} – {shift?.end || SHIFTS_DEF[sk]?.end}</span></div>}
          </div>
          {todayAtt?.checkIn && <div style={{ textAlign: "right" }}><div style={{ fontFamily: T.fM, fontSize: 28, fontWeight: 700, color: T.em }}>{todayAtt.checkIn}</div><div style={{ fontSize: 11, color: T.t2 }}>Check-in</div>{todayAtt.checkOut && <div style={{ fontFamily: T.fM, fontSize: 16, fontWeight: 700, color: T.t1, marginTop: 4 }}>{todayAtt.checkOut}<span style={{ fontSize: 11, color: T.t2 }}> out</span></div>}</div>}
        </div>
      </Card>
      <div className="hr-stat-grid hr-row-3" style={{ marginBottom: 20 }}>
        <StatCard label="Kehadiran Bulan Ini" value={atts.length} sub="hari hadir" color={T.em} icon="✓" />
        <StatCard label="Keterlambatan" value={atts.filter(a => a.lateMins > 15).length} sub="kali terlambat" color={T.amber} icon="⏰" />
        <StatCard label="Kasbon Aktif" value={rp(myKasbon)} sub="akan dipotong gaji" color={T.red} icon="💳" />
      </div>
      <Card>
        <div style={{ padding: "0 0 14px", borderBottom: `1px solid ${T.line}`, marginBottom: 14 }}><div style={{ fontSize: 11, fontFamily: T.fM, letterSpacing: 1.5, color: T.t2 }}>RIWAYAT ABSENSI TERAKHIR</div></div>
        <div className="hr-table-scroll">
          <table className="hr-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Tanggal</Th><Th>Shift</Th><Th>Masuk</Th><Th>Keluar</Th><Th>Status</Th><Th right>Lembur</Th></tr></thead>
            <tbody>
              {attendance.filter(a => a.empId === currentUser.id && a.status === "hadir").slice(-6).reverse().map(a => (
                <tr key={a.id}><Td mono>{a.date.slice(8)} {MONTHS[parseInt(a.date.slice(5, 7)) - 1]?.slice(0, 3)}</Td><Td><ShiftBadge sk={a.shiftKey} /></Td><Td mono>{a.checkIn || "—"}</Td><Td mono>{a.checkOut || "—"}</Td><Td><StatusBadge status={a.lateMins > 15 ? "terlambat" : "hadir"} /></Td><Td right mono color={a.overtimeCount > 0 ? T.purple : T.t2}>{a.overtimeCount > 0 ? `${a.overtimeCount}×` : "—"}</Td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ══════════════ EMP: JADWAL ══════════════ */
function EmpJadwal({ currentUser, schedule }) {
  const now = new Date();
  const [selMonth, setSelMonth] = useState(null);
  const [selYear, setSelYear] = useState(null);
  const activeMonth = selMonth === null ? now.getMonth() : selMonth;
  const activeYear = selYear === null ? now.getFullYear() : selYear;
  const monthKey = `${activeYear}-${String(activeMonth + 1).padStart(2, "0")}`;
  const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
  const today = todayStr();
  const todayDayNum = parseInt(today.split("-")[2]);
  const todayMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const empSch = schedule[currentUser.id]?.[monthKey] || {};

  // Real calendar grid: compute number of weeks in this month
  const firstDayOfMonth = new Date(activeYear, activeMonth, 1).getDay(); // 0=Sun, 1=Mon, ...
  const startDow = firstDayOfMonth === 0 ? 7 : firstDayOfMonth; // Mon-based: 1=Mon ... 7=Sun
  const totalCells = startDow - 1 + daysInMonth; // cells before 1st + all days
  const numWeeks = Math.ceil(totalCells / 7);
  const isThisMonth = monthKey === todayMonthKey;

  return (
    <div>
      <PageTitle sub={`Jadwal shift bulanan — ${MONTHS[activeMonth]} ${activeYear}`}>Jadwal Saya</PageTitle>
      <div className="hr-row-flex" style={{ marginBottom: 20 }}>
        <select value={activeMonth} onChange={e => { setSelMonth(Number(e.target.value)); if (selYear === null) setSelYear(activeYear); }} style={{ background: T.bg3, color: T.t0, border: `1px solid ${T.line}`, borderRadius: 8, padding: "6px 12px", fontFamily: T.fS }}>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={activeYear} onChange={e => { setSelYear(Number(e.target.value)); if (selMonth === null) setSelMonth(activeMonth); }} style={{ background: T.bg3, color: T.t0, border: `1px solid ${T.line}`, borderRadius: 8, padding: "6px 12px", fontFamily: T.fS }}>
          {[activeYear - 1, activeYear, activeYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Calendar header row */}
      <div className="hr-cal-grid-7" style={{ marginBottom: 6 }}>
        {DAYS_ID.map(d => (
          <div key={d} className="hr-day-header" style={{ textAlign: "center", fontSize: 9, fontFamily: T.fM, letterSpacing: 1.5, color: T.t2, padding: "4px 0" }}>{d.slice(0, 3).toUpperCase()}</div>
        ))}
      </div>

      {/* Calendar grid rows */}
      <div className="hr-cal-grid-7">
        {Array.from({ length: numWeeks * 7 }, (_, cellIdx) => {
          const dayNum = cellIdx - startDow + 2; // +1 for 1-indexed, +1 because firstDayOfMonth=1
          const isInMonth = dayNum >= 1 && dayNum <= daysInMonth;
          const isToday = isThisMonth && dayNum === todayDayNum;
          if (!isInMonth) return <div key={cellIdx} />;
          const sk = empSch[dayNum] ?? "L";
          const sv = SHIFTS_DEF[sk] || SHIFTS_DEF["L"];
          return (
            <div key={cellIdx} className="hr-cal-cell" style={{ background: isToday ? `${T.em}14` : T.bg3, border: `1px solid ${isToday ? T.em : T.line}`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div className="day-num" style={{ fontSize: 10, color: T.t2, marginBottom: 6, fontFamily: T.fM }}>{dayNum}</div>
              <div className="day-circle" style={{ width: 38, height: 38, borderRadius: "50%", background: sv.bg, border: `1.5px solid ${isToday ? T.em : sv.color}55`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: 13, color: sv.color, fontWeight: 700, fontFamily: T.fM }}>{sk}</div>
              <div className="day-time" style={{ fontSize: 9, color: sv.color, marginTop: 3 }}>{sv.start || "—"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   EMP: KASBON
══════════════════════════════════════════════ */
function EmpKasbon({ currentUser, kasbon, setKasbon }) {
  const [show, setShow] = useState(false);
  const [amt, setAmt] = useState("");
  const [note, setNote] = useState("");
  const mine = kasbon.filter(k => k.empId === currentUser.id).sort((a, b) => b.id - a.id);
  const aktif = mine.filter(k => k.status === "aktif").reduce((s, k) => s + k.amount, 0);
  const pending = mine.filter(k => k.status === "pending");

  const sub = async () => {
    if (!amt) return;
    const res = await fetch("/api/kasbon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseInt(amt), note }),
    });
    const json = await res.json();
    if (json.success) {
      // Reload kasbon from DB
      const kasbonRes = await fetch("/api/kasbon?userId=" + currentUser.id);
      const kasbonJson = await kasbonRes.json();
      if (kasbonJson.success) setKasbon(kasbonJson.data.map(k => ({ ...k, empId: k.userId })));
    }
    setAmt(""); setNote(""); setShow(false);
  };
  return (
    <div>
      <PageTitle sub="Pengajuan kasbon perlu persetujuan manager/admin" action={<SBtn onClick={() => setShow(true)}>+ Ajukan Kasbon</SBtn>}>Kasbon Saya</PageTitle>
      <div className="hr-stat-grid hr-row-2" style={{ marginBottom: 20 }}>
        <StatCard label="Kasbon Aktif" value={rp(aktif)} sub="akan dipotong gaji" color={T.red} icon="💳" />
        <StatCard label="Menunggu Approval" value={pending.length} sub="belum disetujui" color={T.blue} icon="⏳" />
      </div>
      {pending.length > 0 && (
        <div style={{ background: T.blueD, border: `1px solid ${T.blue}33`, borderRadius: 10, padding: "14px 18px", marginBottom: 16, fontSize: 13, color: T.blue }}>
          ℹ️ Anda memiliki <b>{pending.length}</b> pengajuan kasbon yang menunggu persetujuan manager.
        </div>
      )}
      <Card>
        <div className="hr-table-scroll">
          <table className="hr-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Tanggal</Th><Th right>Jumlah</Th><Th>Keterangan</Th><Th>Status</Th><Th>Keterangan Penolakan</Th></tr></thead>
            <tbody>
              {mine.length === 0 && <tr><td colSpan={5} style={{ padding: "32px", textAlign: "center", color: T.t2, fontSize: 13 }}>Belum ada kasbon</td></tr>}
              {mine.map(k => (
                <tr key={k.id}>
                  <Td mono>{k.date}</Td>
                  <Td right bold color={T.red}>{rp(k.amount)}</Td>
                  <Td>{k.note}</Td>
                  <Td><KasbonStatusBadge status={k.status} /></Td>
                  <Td><span style={{ fontSize: 11, color: T.red }}>{k.rejectNote || "—"}</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal open={show} onClose={() => setShow(false)} title="Ajukan Kasbon">
        <div style={{ background: T.blueD, border: `1px solid ${T.blue}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: T.blue }}>
          ℹ️ Pengajuan kasbon akan dikirim ke manager untuk disetujui terlebih dahulu.
        </div>
        <FInput label="Jumlah (Rp)" type="number" value={amt} onChange={setAmt} placeholder="200000" />
        <FInput label="Keterangan / Alasan" value={note} onChange={setNote} placeholder="Jelaskan keperluan kasbon..." />
        <SBtn onClick={sub} style={{ width: "100%", justifyContent: "center" }}>Kirim Pengajuan</SBtn>
      </Modal>
    </div>
  );
}

/* ══════════════ MGR: DASHBOARD ══════════════ */
function MgrHome({ currentUser, employees, attendance, kasbon, outlets }) {
  const isSuper = currentUser.role === "superadmin";
  const [filterOutlet, setFilterOutlet] = useState(currentUser.outletId);
  const scopedOutletId = isSuper ? filterOutlet : currentUser.outletId;
  const outlet = outlets.find(o => o.id === scopedOutletId);
  const myEmps = employees.filter(e => e.outletId === scopedOutletId && e.role === "karyawan");
  const nd = new Date(), { dayIdx } = getRealDayAndWeek();
  const todayDate = todayStr();
  const lateToday = attendance.filter(a => myEmps.some(e => e.id === a.empId) && a.date === todayDate && a.lateMins > 15).length;
  const hadirToday = attendance.filter(a => myEmps.some(e => e.id === a.empId) && a.date === todayDate && a.status === "hadir").length;
  const totalKasbon = kasbon.filter(k => myEmps.some(e => e.id === k.empId) && k.status === "aktif").reduce((s, k) => s + k.amount, 0);
  const pendingKasbon = kasbon.filter(k => myEmps.some(e => e.id === k.empId) && k.status === "pending").length;
  return (
    <div>
      <PageTitle sub={`${outlet?.name} — ${DAYS_ID[dayIdx]}, ${nd.getDate()} ${MONTHS[nd.getMonth()]} ${nd.getFullYear()}`}>Dashboard Manager</PageTitle>
      {isSuper && (
        <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
          {outlets.map(o => (
            <SBtn key={o.id} variant={filterOutlet === o.id ? "primary" : "secondary"} onClick={() => setFilterOutlet(o.id)}>{o.name}</SBtn>
          ))}
        </div>
      )}
      <div className="hr-stat-grid hr-row-4" style={{ marginBottom: 20 }}>
        <StatCard label="Hadir Hari Ini" value={hadirToday} sub={`dari ${myEmps.length} karyawan`} color={T.blue} icon="✓" />
        <StatCard label="Terlambat Hari Ini" value={lateToday} sub=">15 menit" color={T.amber} icon="⏰" />
        <StatCard label="Kasbon Menunggu" value={pendingKasbon} sub="perlu approval" color={T.blue} icon="⏳" />
        <StatCard label="Total Kasbon Aktif" value={rp(totalKasbon)} sub="sudah disetujui" color={T.red} icon="💳" />
      </div>
      {pendingKasbon > 0 && (
        <div style={{ background: T.blueD, border: `1px solid ${T.blue}44`, borderRadius: 10, padding: "14px 18px", marginBottom: 20, fontSize: 13, color: T.blue }}>
          📋 Ada <b>{pendingKasbon}</b> pengajuan kasbon yang menunggu persetujuan Anda. Buka menu <b>Kasbon</b> untuk meninjau.
        </div>
      )}
      <Card>
        <div style={{ fontSize: 11, fontFamily: T.fM, letterSpacing: 1.5, color: T.t2, marginBottom: 16 }}>STATUS KARYAWAN HARI INI</div>
        <div className="hr-table-scroll">
          <table className="hr-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Karyawan</Th><Th>Dept</Th><Th>Shift</Th><Th>Masuk</Th><Th>Keluar</Th><Th>Status</Th><Th right>Terlambat</Th><Th right>Lembur</Th></tr></thead>
            <tbody>
              {myEmps.map(emp => {
                const att = attendance.find(a => a.empId === emp.id && a.date === todayDate); return (
                  <tr key={emp.id}>
                    <Td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={emp.name} size={26} /><span style={{ fontWeight: 600, color: T.t0, fontSize: 13 }}>{emp.name}</span></div></Td>
                    <Td><DeptBadge dept={emp.dept} /></Td>
                    <Td>{att && <ShiftBadge sk={att.shiftKey} />}</Td>
                    <Td mono color={att?.lateMins > 15 ? T.amber : T.t1}>{att?.checkIn || "—"}</Td>
                    <Td mono>{att?.checkOut || "—"}</Td>
                    <Td>{att ? <StatusBadge status={att.status === "hadir" && att.lateMins > 15 ? "terlambat" : att.status} /> : "—"}</Td>
                    <Td right mono color={att?.lateMins > 15 ? T.red : T.t2}>{att?.lateMins > 0 ? formatMins(att.lateMins) : "—"}</Td>
                    <Td right mono color={att?.overtimeCount > 0 ? T.purple : T.t2}>{att?.overtimeCount > 0 ? `${att.overtimeCount}×` : "—"}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ══════════════ MGR: KARYAWAN ══════════════ */
function MgrKaryawan({ currentUser, employees, setEmployees, outlets }) {
  const [show, setShow] = useState(false);
  const isSuper = currentUser.role === "superadmin";
  const [form, setForm] = useState({ name: "", dept: "Outlet", outletId: currentUser.outletId, gaji: "3200000" });
  const [saving, setSaving] = useState(false);
  const [empPins, setEmpPins] = useState({}); // { empId: "plaintext_pin" }
  const myEmps = isSuper ? employees.filter(e => e.role === "karyawan") : employees.filter(e => e.outletId === currentUser.outletId && e.role === "karyawan");

  // Fetch plain-text PINs from API on mount (manager/superadmin only)
  useEffect(() => {
    if (currentUser.role === "karyawan") return;
    fetch("/api/employees/pin")
      .then(r => r.json())
      .then(j => { if (j.success) setEmpPins(j.data.reduce((acc, u) => { acc[u.id] = u.pin; return acc; }, {})); })
      .catch(() => { });
  }, []);

  const add = async () => {
    if (!form.name) return;
    setSaving(true);
    const pin = String(Date.now()).slice(-6);
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, dept: form.dept, outletId: form.outletId, gaji: parseInt(form.gaji), role: "karyawan", pin }),
    });
    const json = await res.json();
    if (json.success) {
      setEmployees(pr => [...pr, { id: json.data.id, name: form.name, outletId: form.outletId, dept: form.dept, gaji: parseInt(form.gaji), role: "karyawan", pin }]);
      setShow(false);
      setForm({ name: "", dept: "Outlet", outletId: currentUser.outletId, gaji: "3200000" });
    }
    setSaving(false);
  };
  return (
    <div>
      <PageTitle sub="Daftar dan kelola karyawan" action={<SBtn onClick={() => setShow(true)}>+ Tambah Karyawan</SBtn>}>Manajemen Karyawan</PageTitle>
      <Card>
        <div className="hr-table-scroll">
          <table className="hr-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Karyawan</Th><Th>Outlet</Th><Th>Dept</Th><Th right>Gaji Pokok</Th><Th>PIN</Th></tr></thead>
            <tbody>
              {myEmps.map(emp => {
                const o = outlets.find(x => x.id === emp.outletId); return (
                  <tr key={emp.id}><Td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={emp.name} size={28} /><span style={{ fontWeight: 600, color: T.t0 }}>{emp.name}</span></div></Td><Td>{o?.name || "—"}</Td><Td><DeptBadge dept={emp.dept} /></Td><Td right mono color={T.em}>{rp(emp.gaji)}</Td><Td mono style={{ letterSpacing: 2 }}>{empPins[emp.id] || "—"}</Td></tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal open={show} onClose={() => setShow(false)} title="Tambah Karyawan Baru">
        <FInput label="Nama Lengkap" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Nama karyawan..." />
        <FSelect label="Departemen" value={form.dept} onChange={v => setForm(p => ({ ...p, dept: v }))} options={DEPT_LIST.map(d => ({ value: d, label: d }))} />
        {isSuper && <FSelect label="Outlet" value={form.outletId} onChange={v => setForm(p => ({ ...p, outletId: v }))} options={outlets.map(o => ({ value: o.id, label: o.name }))} />}
        <FInput label="Gaji Pokok (Rp)" type="number" value={form.gaji} onChange={v => setForm(p => ({ ...p, gaji: v }))} placeholder="3200000" />
        <SBtn onClick={add} style={{ width: "100%", justifyContent: "center" }} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Karyawan"}</SBtn>
      </Modal>
    </div>
  );
}

/* ══════════════ MGR: JADWAL ══════════════ */
function MgrJadwal({ currentUser, employees, schedule, setSchedule, outlets }) {
  const now = new Date();
  const [selMonth, setSelMonth] = useState(null);
  const [selYear, setSelYear] = useState(null);
  const activeMonth = selMonth === null ? now.getMonth() : selMonth;
  const activeYear = selYear === null ? now.getFullYear() : selYear;
  const [popup, setPopup] = useState(null);
  const [showRandom, setShowRandom] = useState(false);
  const [randomResult, setRandomResult] = useState(null);
  // Lock state per (outletId + monthKey)
  const [scheduleLocked, setScheduleLocked] = useState({}); // { "o1-2026-05": true, ... }
  const isSuper = currentUser.role === "superadmin";
  const [filterOutlet, setFilterOutlet] = useState(currentUser.outletId);
  const monthKey = `${activeYear}-${String(activeMonth + 1).padStart(2, "0")}`;
  const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
  const displayEmps = employees.filter(e => e.outletId === filterOutlet && e.role === "karyawan");

  // Load lock status from API on mount and when outlet/month changes
  useEffect(() => {
    if (!filterOutlet || !monthKey) return;
    const key = `${filterOutlet}-${monthKey}`;
    fetch(`/api/schedule-lock?outletId=${filterOutlet}&month=${monthKey}`)
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setScheduleLocked(prev => ({ ...prev, [key]: j.data.isLocked }));
        }
      })
      .catch(() => { });
  }, [filterOutlet, monthKey]);

  const lockKey = `${filterOutlet}-${monthKey}`;
  const isLocked = !!scheduleLocked[lockKey];

  const toggleLock = async (newLockState) => {
    const key = lockKey;
    try {
      const res = await fetch("/api/schedule-lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outletId: filterOutlet, month: monthKey, isLocked: newLockState }),
      });
      const json = await res.json();
      if (json.success) {
        setScheduleLocked(prev => ({ ...prev, [key]: newLockState }));
      }
    } catch (e) { console.error(e); }
  };

  // Real calendar grid calculations
  const firstDayOfMonth = new Date(activeYear, activeMonth, 1).getDay();
  const startDow = firstDayOfMonth === 0 ? 7 : firstDayOfMonth;
  const totalCells = startDow - 1 + daysInMonth;
  const numWeeks = Math.ceil(totalCells / 7);
  const today = todayStr();
  const todayMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const isThisMonth = monthKey === todayMonthKey;
  const todayDayNum = parseInt(today.split("-")[2]);

  const setShift = (empId, day, sk) => {
    setSchedule(prev => ({
      ...prev,
      [empId]: { ...prev[empId], [monthKey]: { ...prev[empId]?.[monthKey], [day]: sk } },
    }));
    setPopup(null);
    const weekIdx = Math.min(Math.floor((day - 1) / 7), 3);
    const dayIdx = (new Date(activeYear, activeMonth, day).getDay() + 6) % 7;
    fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedules: [{ userId: empId, weekIdx, dayIdx, dayNum: day, month: monthKey, shiftKey: sk }] }),
    });
  };

  // ══ SMART RANDOMIZE with PAIRING ROTATION ══
  const smartRandomize = () => {
    const outletObj = outlets.find(o => o.id === filterOutlet) || {};
    const isSingleShift = !!outletObj.isSingleShift;
    // offDay: 0=Senin, 1=Selasa, ..., 6=Minggu (weekday index, Mon=0)
    // Guard: null in DB → use default 0 (Minggu); number/string coercion handled by Number()
    const outletOffDay = Number(outletObj.offDay);
    const hasOffDay = outletObj.offDay !== null && outletObj.offDay !== undefined && !isNaN(outletOffDay);

    const outletEmps = employees.filter(e => e.outletId === filterOutlet && e.role === "karyawan");
    const newSch = JSON.parse(JSON.stringify(schedule));
    const warnings = [];

    const deptGroups = {};
    outletEmps.forEach(emp => {
      if (!deptGroups[emp.dept]) deptGroups[emp.dept] = [];
      deptGroups[emp.dept].push(emp);
    });

    Object.entries(deptGroups).forEach(([dept, emps]) => {
      const n = emps.length;
      if (n < 2) warnings.push(`${dept}: hanya ${n} orang (minimal 2)`);

      if (isSingleShift) {
        // ═══ SINGLE-SHIFT: Semua OFF di hari yang sama, FULL di hari lain ═══
        emps.forEach(emp => {
          if (!newSch[emp.id]) newSch[emp.id] = {};
          if (!newSch[emp.id][monthKey]) newSch[emp.id][monthKey] = {};
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(activeYear, activeMonth, day);
            const jsDay = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
            const dayIdx = jsDay === 0 ? 6 : jsDay - 1; // Convert: Mon=0, ..., Sun=6
            newSch[emp.id][monthKey][day] = (hasOffDay && dayIdx === outletOffDay) ? "L" : "FULL";
          }
        });
      } else {
        // ═══ 2-SHIFT: Simple rotation per day — setiap karyawan mendapat L/F/P/S tiap minggu ═══
        // Pattern: Week 1: Mon=L Tue=F Wed=P Thu=S (bergilir tiap minggu)
        // Weekend: Fri/Sat/Sun P/S swap per week

        emps.forEach((emp, empIdx) => {
          if (!newSch[emp.id]) newSch[emp.id] = {};
          if (!newSch[emp.id][monthKey]) newSch[emp.id][monthKey] = {};

          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(activeYear, activeMonth, day);
            const jsDay = date.getDay();
            const dayIdx = jsDay === 0 ? 6 : jsDay - 1; // Mon=0..Sun=6
            const weekNum = Math.floor((day - 1) / 7);

            if (dayIdx < 4) {
              // ╔══════════════════════════════════════��═══╗
              // ║  PAIRING ROTATION (Senin-Kamis)         ║
              // ║  Minggu 1: (0,1)  → P  → S               ║
              // ║  Minggu 2: (0,2)  → P  → S               ║
              // ║  Minggu 3: (1,2)  → P  → S               ║
              // ║  Minggu 4: (0,1)  → S  → P  (shift swap) ║
              // ║  dst...                                   ║
              // ╚══════════════════════════════════════════╝
              // pairIdx: minggu ganjil = urut, minggu genap = shift swap + next pair
              const shiftCycle = ["L", "FULL", "P", "S"];
              const weekOffset = weekNum % 4;
              const dayOffset = dayIdx;
              const rotPos = (weekOffset + dayOffset + empIdx) % 4;
              newSch[emp.id][monthKey][day] = shiftCycle[rotPos];
            } else {
              // ╔════════════════════════════════════════════════════════╗
              // ║  JUMAT-MINGGU: Pairing rotation sama seperti Senin-Kamis ║
              // ║  friSunIdx 0=Fri, 1=Sabtu, 2=Minggu                     ║
              // ║  Week 1: Fri→pair[0], Sat→pair[1], Sun→pair[2]         ║
              // ║  Week 2: Fri→pair[3], Sat→pair[4], Sun→pair[5]         ║
              // ╚════════════════════════════════════════════════════════╝
              // WEEKEND (Jumat-Minggu): P/S only, swap per week
              const weekendIdx = dayIdx - 4; // 0=Fri, 1=Sat, 2=Sun
              const isSwapWeekend = weekNum % 2 === 1;
              const baseShift = empIdx % 2 === 0 ? "P" : "S";
              const shiftIdx = (weekendIdx + (isSwapWeekend ? 1 : 0)) % 2;
              newSch[emp.id][monthKey][day] = shiftIdx === 0 ? baseShift : (baseShift === "P" ? "S" : "P");
            }
          }
        });
      }
    });

    setSchedule(newSch);

    // Save to DB
    const scheduleItems = [];
    Object.entries(newSch).forEach(([empId, monthData]) => {
      const empMonth = monthData[monthKey];
      if (!empMonth) return;
      Object.entries(empMonth).forEach(([dayNumStr, shiftKey]) => {
        const dayNum = parseInt(dayNumStr);
        const weekIdx = Math.min(Math.floor((dayNum - 1) / 7), 3);
        const dayIdx = (new Date(activeYear, activeMonth, dayNum).getDay() + 6) % 7;
        scheduleItems.push({ userId: empId, weekIdx, dayIdx, dayNum, month: monthKey, shiftKey });
      });
    });

    if (scheduleItems.length > 0) {
      fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules: scheduleItems }),
      });
    }

    // Set result FIRST (so warnings are visible), THEN lock
    setRandomResult({ warnings, outletName: outletObj.name || outlets.find(o => o.id === filterOutlet)?.name });

    // Auto-lock after generate
    fetch("/api/schedule-lock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outletId: filterOutlet, month: monthKey, isLocked: true }),
    }).then(() => setScheduleLocked(p => ({ ...p, [lockKey]: true })));
  };
  const seedFn = (i, d, y, m) => (y * 12 + m) * 17 + i * 7 + d * 3;

  return (
    <div onClick={() => setPopup(null)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <PageTitle sub={`Jadwal bergilir per bulan — ${MONTHS[activeMonth]} ${activeYear}`}>
          Kelola Jadwal
          {isLocked && <span style={{ fontSize: 11, color: T.amber, fontWeight: 600, marginLeft: 10 }}>🔒 Terkunci</span>}
        </PageTitle>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Lock/Unlock button */}
          <SBtn
            variant={isLocked ? "secondary" : "primary"}
            onClick={() => {
              if (isLocked) {
                if (!confirm(`Buka kunci jadwal ${MONTHS[activeMonth]} ${activeYear}?\n\nJadwal tetap tersimpan di database.`)) return;
                toggleLock(false);
              }
            }}
            title={isLocked ? "Jadwal terkunci - klik untuk buka" : "Jadwal belum dikunci"}
          >
            {isLocked ? "🔓 Buka Kunci" : "🔒 Kunci Jadwal"}
          </SBtn>
          {/* Acak jadwal button */}
          <SBtn
            variant={isLocked ? "secondary" : "amber"}
            onClick={() => { if (isLocked) return; setRandomResult(null); setShowRandom(true); }}
            disabled={isLocked}
          >
            {isLocked ? "🔒 Sudah Terkunci" : "🔀 Acak Jadwal"}
          </SBtn>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <select value={activeMonth} onChange={e => { setSelMonth(Number(e.target.value)); if (selYear === null) setSelYear(activeYear); }} style={{ background: T.bg3, color: T.t0, border: `1px solid ${T.line}`, borderRadius: 8, padding: "6px 12px", fontFamily: T.fS }}>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={activeYear} onChange={e => { setSelYear(Number(e.target.value)); if (selMonth === null) setSelMonth(activeMonth); }} style={{ background: T.bg3, color: T.t0, border: `1px solid ${T.line}`, borderRadius: 8, padding: "6px 12px", fontFamily: T.fS }}>
          {[activeYear - 1, activeYear, activeYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {isSuper && <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>{outlets.map(o => <SBtn key={o.id} variant={filterOutlet === o.id ? "primary" : "secondary"} onClick={() => setFilterOutlet(o.id)}>{o.name.replace("Outlet ", "")}</SBtn>)}</div>}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(getShiftDef(outlets.find(o => o.id === filterOutlet))).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, background: v.bg, border: `1px solid ${v.color}33`, borderRadius: 8, padding: "5px 12px" }}>
            <span style={{ fontFamily: T.fM, fontWeight: 700, color: v.color, fontSize: 12 }}>{k}</span>
            <span style={{ fontSize: 11, color: T.t1 }}>{v.label}</span>
            {v.start && <span style={{ fontSize: 10, color: T.t2, fontFamily: T.fM }}>{v.start}–{v.end}</span>}
          </div>
        ))}
      </div>

      {/* Calendar grid: header row + week rows */}
      <div className="hr-table-scroll" style={{ marginBottom: 20, overflowX: "auto" }}>
        <div style={{ minWidth: 700 }}>
          {/* Day-of-week header */}
          <div className="hr-cal-grid-7" style={{ marginBottom: 6 }}>
            {DAYS_ID.map(d => (
              <div key={d} className="hr-day-header" style={{ textAlign: "center", fontSize: 9, fontFamily: T.fM, letterSpacing: 1.5, color: T.t2, padding: "4px 0", fontWeight: 600 }}>{d.slice(0, 3).toUpperCase()}</div>
            ))}
          </div>

          {/* Week rows */}
          {Array.from({ length: numWeeks }, (_, weekIdx) => (
            <div key={weekIdx} className="hr-cal-grid-7" style={{ marginBottom: 8 }}>
              {Array.from({ length: 7 }, (_, dowIdx) => {
                const cellIdx = weekIdx * 7 + dowIdx;
                const dayNum = cellIdx - startDow + 2;
                const isInMonth = dayNum >= 1 && dayNum <= daysInMonth;
                const isToday = isThisMonth && dayNum === todayDayNum;
                const outletShiftDef = getShiftDef(outlets.find(o => o.id === filterOutlet));
                const daySchedule = isInMonth ? displayEmps.map(emp => {
                  const sk = schedule[emp.id]?.[monthKey]?.[dayNum] ?? "L";
                  const sv = outletShiftDef[sk] || SHIFTS_DEF["L"];
                  return { emp, sk, sv };
                }) : [];
                return (
                  <div key={dowIdx} className="hr-cal-cell" style={{
                    background: T.bg3,
                    border: `1px solid ${isToday ? T.em : T.line}`,
                    borderRadius: 10,
                    overflow: "hidden",
                  }}>
                    {/* Date number header */}
                    <div style={{
                      padding: "5px 8px",
                      background: isToday ? `${T.em}18` : "transparent",
                      borderBottom: `1px solid ${T.line}`,
                      textAlign: "center",
                      fontSize: 10,
                      fontFamily: T.fM,
                      color: isToday ? T.em : T.t2,
                      fontWeight: isToday ? 700 : 500,
                    }}>
                      {isInMonth ? dayNum : ""}
                    </div>
                    {/* Employee shifts list */}
                    <div style={{ padding: "6px", minHeight: 60, maxHeight: 140, overflowY: "auto" }}>
                      {!isInMonth ? null : daySchedule.length === 0 ? (
                        <div style={{ fontSize: 9, color: T.t2, textAlign: "center", padding: "8px 0" }}>—</div>
                      ) : daySchedule.map(({ emp, sk, sv }, i) => {
                        const isOpen = popup?.day === dayNum && popup?.empId === emp.id;
                        return (
                          <div key={emp.id} style={{ position: "relative", marginBottom: 3 }}>
                            <button
                              onClick={e => { e.stopPropagation(); if (isLocked) return; setPopup(isOpen ? null : { empId: emp.id, day: dayNum }); }}
                              style={{
                                display: "flex", alignItems: "center", gap: 4,
                                background: isLocked ? `${sv.color}22` : sv.bg,
                                color: isLocked ? `${sv.color}88` : sv.color,
                                border: `1px solid ${isOpen ? T.em : sv.color}55`,
                                borderRadius: 5, padding: "3px 6px",
                                cursor: isLocked ? "not-allowed" : "pointer",
                                fontFamily: T.fM, fontWeight: 700, fontSize: 10,
                                width: "100%", outline: isOpen ? `2px solid ${T.em}` : "none",
                                opacity: isLocked ? 0.7 : 1,
                              }}
                            >
                              <span style={{ fontSize: 9, color: `${sv.color}88` }}>{emp.name.split(" ")[0]}</span>
                              <span style={{ fontSize: 11 }}>{sk}</span>
                            </button>
                            {isOpen && (
                              <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: "calc(100% + 2px)", left: "50%", transform: "translateX(-50%)", zIndex: 500, background: T.bg3, border: `1px solid ${T.lineL}`, borderRadius: 8, padding: 6, boxShadow: "0 8px 24px #00000088", minWidth: 160 }}>
                                <div style={{ fontSize: 9, color: T.t2, marginBottom: 4, letterSpacing: 1 }}>GANTI</div>
                                {Object.entries(outletShiftDef).map(([k, v]) => (
                                  <button key={k} onClick={() => setShift(emp.id, dayNum, k)} style={{ display: "block", width: "100%", padding: "5px 8px", background: sk === k ? v.bg : "transparent", color: v.color, border: "none", borderRadius: 5, cursor: "pointer", fontFamily: T.fM, fontWeight: 700, fontSize: 10, textAlign: "left", marginBottom: 2 }}>
                                    [{k}] {v.label}{v.start ? ` · ${v.start}–${v.end}` : ""}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Modal open={showRandom} onClose={() => setShowRandom(false)} title="🔀 Generate Jadwal Bergilir" width={480}>
        {!randomResult ? (
          <>
            <div style={{ background: T.amberD, border: `1px solid ${T.amber}33`, borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: T.amber, fontWeight: 600, marginBottom: 8 }}>
                🔀 Aturan Penjadwalan — {outlets.find(o => o.id === filterOutlet)?.name}
              </div>
              <div style={{ fontSize: 11, color: T.t1, marginBottom: 10 }}>
                Bulan: <b>{MONTHS[activeMonth]} {activeYear}</b> &nbsp;·&nbsp; Shift: <b>{outlets.find(o => o.id === filterOutlet)?.isSingleShift ? "SINGLE-SHIFT" : "2-SHIFT"}</b>
              </div>
              <div style={{ fontSize: 11, color: T.t1, marginBottom: 12, padding: "8px 10px", background: T.bg3, borderRadius: 6, border: `1px solid ${T.line}` }}>
                📍 <b style={{ color: T.t0 }}>{displayEmps.length} karyawan</b> di outlet ini akan dijadwalkan
              </div>
              {(() => {
                const o = outlets.find(x => x.id === filterOutlet);
                const shiftDef = getShiftDef(o);
                const isSingle = o?.isSingleShift;
                return (
                isSingle ? (
                // SINGLE-SHIFT INFO
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: T.t1, lineHeight: 2.2 }}>
                  <li><b style={{ color: T.em }}>FULL Time</b> — kerja penuh hari ({shiftDef.FULL.start}–{shiftDef.FULL.end})</li>
                  <li><b style={{ color: T.red }}>Libur Bersama</b> — <b>SEMUA</b> karyawan off di hari: <b>{["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][o?.offDay ?? 0]}</b> (sesuai data Outlet)</li>
                  <li>Libur &amp; Shift tunggal <b style={{ color: T.t0 }}>BERLAKU UNTUK SEMUA KARYAWAN</b> (tidak individual)</li>
                  <li>Ganti hari libur? Edit Outlet → atur <b>"Hari Libur Default Outlet"</b> lalu generate ulang</li>
                </ul>
                ) : (
                // 2-SHIFT INFO
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: T.t1, lineHeight: 2.2 }}>
                  <li><b style={{ color: T.em }}>Shift Pagi (P)</b> — pagi ({shiftDef.P.start}–{shiftDef.P.end}) &nbsp;·&nbsp; <b style={{ color: T.amber }}>Shift Siang (S)</b> — siang ({shiftDef.S.start}–{shiftDef.S.end})</li>
                  <li><b style={{ color: T.purple }}>Rotation Sederhana</b> — setiap karyawan mendapat L, FULL, P, S dalam 1 minggu</li>
                  <li>Senin–Kamis: rotasi L/FULL/P/S bergilir tiap hari</li>
                  <li>Jumat–Minggu: P/S saja, swap per minggu</li>
                  <li>Minimal <b style={{ color: T.t0 }}>2 karyawan per departemen</b></li>
                </ul>
                )
                );
              })}
              <div style={{ fontSize: 11, color: T.t2, marginTop: 8, borderTop: `1px solid ${T.amber}33`, paddingTop: 8 }}>
                ⚠️ Setelah generate, jadwal akan <b>TERKUNCI OTOMATIS</b>. Klik "🔓 Buka Kunci" untuk edit manual.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <SBtn variant="amber" onClick={() => {
                const outletName = outlets.find(o => o.id === filterOutlet)?.name || "";
                if (!confirm(`Generate jadwal ${MONTHS[activeMonth]} ${activeYear} untuk Outlet ${outletName}?\n\nJadwal akan langsung tersimpan dan terkunci.`)) return;
                smartRandomize();
              }} style={{ flex: 1, justifyContent: "center" }}>🔀 Generate Sekarang</SBtn>
              <SBtn variant="secondary" onClick={() => setShowRandom(false)} style={{ flex: 1, justifyContent: "center" }}>Batal</SBtn>
            </div>
          </>
        ) : (
          <>
            <div style={{ background: T.emD, border: `1px solid ${T.em}33`, borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: T.em, fontWeight: 700, marginBottom: 4 }}>✓ Jadwal berhasil di-generate!</div>
              <div style={{ fontSize: 12, color: T.t1 }}>{randomResult.outletName} — {MONTHS[selMonth]} {selYear}</div>
            </div>
            {randomResult.warnings.length > 0 && (
              <div style={{ background: T.amberD, border: `1px solid ${T.amber}33`, borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: T.amber, fontWeight: 600, marginBottom: 6 }}>⚠ Perhatian:</div>
                {randomResult.warnings.map((w, i) => <div key={i} style={{ fontSize: 11, color: T.t1 }}>• {w}</div>)}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <SBtn variant="amber" onClick={() => {
                if (!confirm(`Generate ulang jadwal ${MONTHS[activeMonth]} ${activeYear}?\n\nJadwal lama akan ditimpa.`)) return;
                toggleLock(false).then(() => {
                  setRandomResult(null);
                  smartRandomize();
                });
              }} style={{ flex: 1, justifyContent: "center" }}>🔀 Generate Ulang</SBtn>
              <SBtn onClick={() => setShowRandom(false)} style={{ flex: 1, justifyContent: "center" }}>Selesai ✓</SBtn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

/* ══════════════ MGR: OVERRIDE ABSENSI ══════════════ */
function MgrAbsensi({ currentUser, employees, attendance, setAttendance, outlets }) {
  const [selEmp, setSelEmp] = useState("");
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ date: "", type: "", note: "" });
  const [overrideMsg, setOverrideMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const isSuper = currentUser.role === "superadmin";
  const myEmps = isSuper ? employees.filter(e => e.role === "karyawan") : employees.filter(e => e.outletId === currentUser.outletId && e.role === "karyawan");

  // ── 5 Override types ──
  const types = [
    {
      value: "terlambat_izin",
      label: "Terlambat",
      short: "Datang terlambat tapi ada izin",
      color: T.amber,
      bg: T.amberD,
      icon: "⏰",
      needsCheckIn: true,
      defaultNote: "Terlambat karena ada izin — override manager",
      desc: "Untuk karyawan yang datang terlambat namun memiliki alasan/keterangan. Berlaku max 2× per bulan tanpa potongan. Lebih dari 2× → tetap kena potongan Rp 10.000/kejadian.",
    },
    {
      value: "ganti_shift",
      label: "Ganti Shift",
      short: "Gantikan shift teman (lembur)",
      color: T.purple,
      bg: T.purpleD,
      icon: "🔁",
      needsCheckIn: true,
      defaultNote: "Ganti shift teman — dihitung lembur",
      desc: "Untuk karyawan yang menggantikan shift rekan kerja. Tercatat sebagai lembur (overtime) di payroll.",
    },
    {
      value: "izin",
      label: "Izin",
      short: "Tidak masuk dengan izin",
      color: T.blue,
      bg: T.blueD,
      icon: "📝",
      needsCheckIn: false,
      defaultNote: "Tidak masuk dengan izin",
      desc: "Karyawan tidak hadir di tanggal tersebut dengan izin resmi. Potongan gaji sesuai tarif departemen.",
    },
    {
      value: "alpa",
      label: "Alpa",
      short: "Tanpa keterangan",
      color: T.red,
      bg: T.redD,
      icon: "❌",
      needsCheckIn: false,
      defaultNote: "Tanpa keterangan — override manager",
      desc: "Karyawan tidak hadir tanpa keterangan. Potongan gaji sesuai tarif departemen.",
    },
    {
      value: "pulang_tidak_sesuai",
      label: "Pulang Cepat",
      short: "Pulang tidak sesuai jadwal",
      color: T.t2,
      bg: T.bg3,
      icon: "🏃",
      needsCheckIn: true,
      defaultNote: "Pulang tidak sesuai jadwal",
      desc: "Karyawan pulang lebih awal dari jadwal. Tercatat sebagai izin dengan potongan sesuai departemen.",
    },
  ];

  const now = new Date();
  const mp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const selAtts = selEmp ? attendance.filter(a => a.empId === selEmp && a.date.startsWith(mp)) : [];
  const latePermCount = selAtts.filter(a => a.overrideType === "terlambat_izin").length;
  const selEmpData = selEmp ? myEmps.find(e => e.id === selEmp) : null;

  // ── Monthly stats for selected employee ──
  // Match the server's calculatePayroll() in src/lib/utils.js so the summary
  // cards here line up with the Payroll page.
  const stats = selAtts.reduce((acc, a) => {
    const s = a.status;
    if (s === "hadir" || s === "terlambat") {
      acc.hadir++;
      if ((a.lateMins > 15 && !a.lateWithPermission) || s === "terlambat" || a.keterangan === "terlambat") {
        acc.terlambat++;
      } else if (a.lateWithPermission) {
        acc.hadirIzin++;
      }
    } else if (s === "libur") acc.libur++;
    else if (s === "izin") acc.izin++;
    else if (s === "alpa") acc.alpa++;
    return acc;
  }, { hadir: 0, hadirIzin: 0, terlambat: 0, libur: 0, izin: 0, alpa: 0 });

  // Count overtime occurrences (per-kejadian), not per-day — matches
  // calculatePayroll's totalOvertimeCount. The previous version counted days
  // with overtimeMins > 0, which undercounted when an employee worked multiple
  // overtime shifts in one day or got 0 in payroll's per-occurrence count.
  const totalOTKali = selAtts.reduce((s, a) => s + (a.overtimeCount || 0), 0);

  // Days paid: totalHadir + min(latePermission, 2) - latePermissionOverLimit
  // (mirrors calculatePayroll's totalDaysPaid → gajiPokok prorate)
  const latePermOverLimit = selAtts.filter((a) => a.overrideType === "terlambat_izin" && a.keterangan === "terlambat").length;
  const totalHadirBayar = stats.hadir + Math.min(latePermCount, 2) - latePermOverLimit;

  // ── Step 1: pick type → step 2: fill form → step 3: confirm ──
  const openModal = () => {
    setForm({ date: "", type: "", note: "" });
    setStep(1);
    setShow(true);
  };
  const pickType = (type) => {
    setForm(p => ({ ...p, type, note: types.find(t => t.value === type).defaultNote }));
    setStep(2);
  };
  const proceedToConfirm = () => {
    if (!form.date || !form.type) return;
    setStep(3);
  };
  const selectedType = form.type ? types.find(t => t.value === form.type) : null;
  const existingForDate = form.date ? attendance.find(a => a.empId === selEmp && a.date === form.date) : null;

  const doOverride = async () => {
    if (!selEmp || !form.date || !form.type) return;
    setSaving(true);

    if (existingForDate) {
      try {
        const res = await fetch("/api/attendance", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attendanceId: existingForDate.id,
            overrideType: form.type,
            overrideNote: form.note || "",
          })
        });
        const json = await res.json();
        if (!json.success) { alert("Gagal: " + json.error); setSaving(false); return; }
        setOverrideMsg({ ok: true, text: `Override ${selectedType.label} berhasil — ${json.data.status}${json.data.keterangan ? ` · ${json.data.keterangan}` : ""}` });
      } catch (e) { alert("Error: " + e.message); setSaving(false); return; }
    } else {
      if (["alpa", "izin", "pulang_tidak_sesuai"].includes(form.type)) {
        const dateObj = new Date(form.date);
        const jsDay = dateObj.getDay();
        const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
        const weekIdx = Math.min(Math.floor((dateObj.getDate() - 1) / 7), 3);
        const statusMap = { alpa: "alpa", izin: "izin", pulang_tidak_sesuai: "izin" };
        try {
          const res = await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "manual", empId: selEmp, date: form.date,
              status: statusMap[form.type], shiftKey: "P",
              lateMins: 0, earlyMins: 0, overtimeMins: 0,
              note: form.note || selectedType.defaultNote,
            })
          });
          const json = await res.json();
          if (!json.success) { alert("Gagal: " + json.error); setSaving(false); return; }
          setOverrideMsg({ ok: true, text: `Record ${statusMap[form.type]} berhasil dibuat untuk ${form.date}` });
        } catch (e) { alert("Error: " + e.message); setSaving(false); return; }
      } else {
        alert(`Tidak ada record check-in untuk ${form.date}.\n\nTipe "${selectedType.label}" memerlukan karyawan sudah check-in dulu.\nGunakan "Izin" atau "Alpa" jika karyawan tidak masuk.`);
        setSaving(false);
        return;
      }
    }

    try {
      const attRes = await fetch(`/api/attendance?userId=${selEmp}&month=${mp}`);
      const attJson = await attRes.json();
      if (attJson.success) setAttendance(prev => {
        const others = prev.filter(a => a.empId !== selEmp);
        return [...others, ...attJson.data.map(a => ({ ...a, empId: a.userId }))];
      });
    } catch { /* silent */ }

    setSaving(false);
    setShow(false);
    setTimeout(() => setOverrideMsg(null), 5000);
  };

  const runAutoFill = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/attendance/auto-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: mp }),
      });
      const json = await res.json();
      if (json.success) {
        setOverrideMsg({ ok: true, text: `Auto-fill selesai: ${json.data.filled} record baru (dari ${json.data.scanned} jadwal yang dicek)` });
        // Refresh attendance for current month (all employees)
        const attRes = await fetch(`/api/attendance?month=${mp}`);
        const attJson = await attRes.json();
        if (attJson.success) {
          const list = attJson.data;
          setAttendance(list.map(a => ({ ...a, empId: a.userId })));
        }
      } else {
        setOverrideMsg({ ok: false, text: "Gagal: " + json.error });
      }
    } catch (e) {
      setOverrideMsg({ ok: false, text: "Error: " + e.message });
    }
    setSaving(false);
    setTimeout(() => setOverrideMsg(null), 5000);
  };

  return (
    <div>
      <PageTitle sub="Koreksi/override absensi karyawan — status & efek payroll otomatis" action={
        <div style={{ display: "flex", gap: 8 }}>
          <SBtn variant="secondary" onClick={runAutoFill} disabled={saving}>{saving ? "..." : "⟳ Auto-Fill"}</SBtn>
          {selEmp && <SBtn onClick={openModal}>+ Override Absensi</SBtn>}
        </div>
      }>Override Absensi</PageTitle>

      {overrideMsg && (
        <div style={{ background: overrideMsg.ok ? T.emD : T.redD, border: `1px solid ${overrideMsg.ok ? T.em : T.red}44`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: overrideMsg.ok ? T.em : T.red, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          {overrideMsg.ok ? "✓" : "✕"} {overrideMsg.text}
        </div>
      )}

      <div style={{ marginBottom: 20 }}><FSelect label="Pilih Karyawan" value={selEmp} onChange={setSelEmp} options={[{ value: "", label: "— Pilih Karyawan —" }, ...myEmps.map(e => ({ value: e.id, label: `${e.name} (${e.dept})` }))]} /></div>

      {selEmp && selEmpData && (
        <>
          {/* Header summary */}
          <Card style={{ marginBottom: 16, padding: "18px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.t0, marginBottom: 4 }}>{selEmpData.name}</div>
                <div style={{ fontSize: 12, color: T.t2 }}>{selEmpData.dept} · {MONTHS[parseInt(mp.slice(5)) - 1]} {mp.slice(0, 4)}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <Pill color={latePermCount >= 2 ? T.red : latePermCount > 0 ? T.amber : T.em} bg={latePermCount >= 2 ? T.redD : latePermCount > 0 ? T.amberD : T.emD}>
                  Izin Terlambat: {latePermCount}/2
                </Pill>
                {latePermCount >= 2 && <span style={{ fontSize: 10, color: T.red, fontWeight: 600 }}>⚠ Limit tercapai</span>}
              </div>
            </div>
          </Card>

          {/* Stat cards — match calculatePayroll() in src/lib/utils.js */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Hadir", value: stats.hadir, color: T.em, bg: T.emD },
              { label: "Terlambat", value: stats.terlambat, color: T.amber, bg: T.amberD, sub: "kena potong" },
              { label: "Lembur", value: totalOTKali, color: T.purple, bg: T.purpleD, sub: "× kejadian" },
              { label: "Izin", value: stats.izin, color: T.blue, bg: T.blueD },
              { label: "Alpa", value: stats.alpa, color: T.red, bg: T.redD },
            ].map(s => (
              <div key={s.label} style={{ background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontFamily: T.fM, letterSpacing: 1.2, color: T.t2, marginBottom: 4 }}>{s.label.toUpperCase()}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: T.fM }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: 9, color: T.t2, marginTop: 2 }}>{s.sub}</div>}
              </div>
            ))}
          </div>

          {/* Attendance table */}
          <Card>
            <div style={{ fontSize: 11, fontFamily: T.fM, letterSpacing: 1.5, color: T.t2, marginBottom: 14 }}>RIWAYAT ABSENSI · {MONTHS[parseInt(mp.slice(5)) - 1]} {mp.slice(0, 4)}</div>
            <div className="hr-table-scroll">
              <table className="hr-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><Th>Tanggal</Th><Th>Shift</Th><Th>Masuk</Th><Th>Keluar</Th><Th>Status</Th><Th right>Telat</Th><Th right>Lembur</Th><Th>Catatan</Th></tr></thead>
                <tbody>
                  {selAtts.sort((a, b) => b.date.localeCompare(a.date)).map(a => (
                    <tr key={a.id} style={{ background: a.overrideType ? `${T.amber}0A` : "transparent" }}>
                      <Td mono>{a.date.slice(8)} {MONTHS[parseInt(a.date.slice(5, 7)) - 1]?.slice(0, 3)}</Td>
                      <Td><ShiftBadge sk={a.shiftKey} /></Td>
                      <Td mono color={a.lateMins > 15 ? T.amber : T.t1}>{a.checkIn || "—"}</Td>
                      <Td mono>{a.checkOut || "—"}</Td>
                      <Td><StatusBadge status={a.status === "hadir" && a.lateMins > 15 && !a.lateWithPermission ? "terlambat" : a.status} /></Td>
                      <Td right mono color={a.lateMins > 0 ? T.red : T.t2}>{a.lateMins > 0 ? formatMins(a.lateMins) : "—"}</Td>
                      <Td right mono color={(a.overtimeMins || 0) > 0 ? T.purple : T.t2}>{(a.overtimeMins || 0) > 0 ? `${Math.floor(a.overtimeMins / 60)}j` : "—"}</Td>
                      <Td><span style={{ fontSize: 11, color: a.note ? T.amber : T.t2, fontWeight: a.note ? 500 : 400 }}>{a.note || "—"}</span></Td>
                    </tr>
                  ))}
                  {selAtts.length === 0 && <tr><td colSpan={8} style={{ padding: "32px", textAlign: "center", color: T.t2, fontSize: 13 }}>Belum ada record absensi bulan ini</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {!selEmp && (
        <Card style={{ padding: "40px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
          <div style={{ fontSize: 14, color: T.t1, marginBottom: 4 }}>Pilih karyawan terlebih dahulu</div>
          <div style={{ fontSize: 12, color: T.t2 }}>Pilih karyawan di atas untuk melihat dan meng-override absensinya</div>
        </Card>
      )}

      {/* Override modal — 3-step flow */}
      <Modal open={show} onClose={() => setShow(false)} title="Override Absensi" width={560}>
        {/* Stepper */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {["Pilih Tipe", "Tanggal & Catatan", "Konfirmasi"].map((s, i) => (
            <div key={s} style={{ flex: 1, padding: "8px 10px", background: step >= i + 1 ? T.blueD : T.bg3, border: `1px solid ${step >= i + 1 ? T.blue : T.line}33`, borderRadius: 8, fontSize: 11, color: step >= i + 1 ? T.blue : T.t2, fontWeight: 600, textAlign: "center" }}>
              {i + 1}. {s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div style={{ fontSize: 13, color: T.t1, marginBottom: 14 }}>Override untuk: <span style={{ fontWeight: 700, color: T.t0 }}>{selEmpData?.name}</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {types.map(t => (
                <button key={t.value} onClick={() => pickType(t.value)} style={{ background: t.bg, border: `1px solid ${t.color}44`, borderRadius: 10, padding: "14px 14px", cursor: "pointer", textAlign: "left", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 22 }}>{t.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.color, marginBottom: 2 }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: T.t1, lineHeight: 1.3 }}>{t.short}</div>
                    {t.value === "terlambat_izin" && latePermCount >= 2 && (
                      <div style={{ fontSize: 10, color: T.red, fontWeight: 600, marginTop: 4 }}>⚠ Limit 2x/bulan tercapai</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
              <SBtn variant="secondary" onClick={() => setShow(false)}>Batal</SBtn>
            </div>
          </>
        )}

        {step === 2 && selectedType && (
          <>
            <div style={{ background: selectedType.bg, border: `1px solid ${selectedType.color}33`, borderRadius: 8, padding: "12px 14px", marginBottom: 16, display: "flex", gap: 12 }}>
              <div style={{ fontSize: 20 }}>{selectedType.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: selectedType.color }}>{selectedType.label}</div>
                <div style={{ fontSize: 11, color: T.t1, marginTop: 2, lineHeight: 1.4 }}>{selectedType.desc}</div>
              </div>
            </div>

            <FInput label="Tanggal" type="date" value={form.date} onChange={v => setForm(p => ({ ...p, date: v }))} />
            <FTextarea label="Catatan / Alasan" value={form.note} onChange={v => setForm(p => ({ ...p, note: v }))} placeholder="Jelaskan alasan override..." />

            {form.date && existingForDate && (
              <div style={{ background: T.bg3, border: `1px solid ${T.line}`, borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 11, color: T.t1 }}>
                ℹ️ Record absensi untuk tanggal ini sudah ada. Override akan mengubah status tanpa membuat record baru.
              </div>
            )}
            {form.date && !existingForDate && selectedType.needsCheckIn && (
              <div style={{ background: T.redD, border: `1px solid ${T.red}33`, borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 11, color: T.red }}>
                ⚠ Tidak ada record check-in untuk tanggal ini. Pilih "Izin" atau "Alpa" jika karyawan tidak hadir.
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <SBtn variant="secondary" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: "center" }}>← Kembali</SBtn>
              <SBtn onClick={proceedToConfirm} disabled={!form.date} style={{ flex: 1, justifyContent: "center" }}>Lanjut →</SBtn>
            </div>
          </>
        )}

        {step === 3 && selectedType && (
          <>
            <div style={{ background: T.bg3, border: `1px solid ${T.line}`, borderRadius: 10, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: T.fM, letterSpacing: 1.2, color: T.t2, marginBottom: 12 }}>KONFIRMASI OVERRIDE</div>
              <div style={{ display: "grid", gap: 10 }}>
                <ConfirmRow label="Karyawan" value={selEmpData?.name} />
                <ConfirmRow label="Tanggal" value={form.date} mono />
                <ConfirmRow label="Tipe" value={<span style={{ color: selectedType.color, fontWeight: 600 }}>{selectedType.icon} {selectedType.label}</span>} />
                {selectedType.value === "terlambat_izin" && (
                  <ConfirmRow label="Limit izin telat" value={<span style={{ color: latePermCount >= 2 ? T.red : T.amber, fontWeight: 600 }}>{latePermCount}/2 {latePermCount >= 2 ? "(akan tetap dipotong)" : ""}</span>} />
                )}
                {form.note && <ConfirmRow label="Catatan" value={<span style={{ fontStyle: "italic" }}>{form.note}</span>} />}
                {existingForDate && <ConfirmRow label="Aksi" value={<span style={{ color: T.amber }}>Override record existing</span>} />}
                {!existingForDate && <ConfirmRow label="Aksi" value={<span style={{ color: T.em }}>Buat record baru</span>} />}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <SBtn variant="secondary" onClick={() => setStep(2)} disabled={saving} style={{ flex: 1, justifyContent: "center" }}>← Edit</SBtn>
              <SBtn onClick={doOverride} disabled={saving} style={{ flex: 1, justifyContent: "center" }}>{saving ? "Menyimpan..." : "✓ Konfirmasi Simpan"}</SBtn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

function ConfirmRow({ label, value, mono }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ fontSize: 11, color: T.t2, minWidth: 120, paddingTop: 1 }}>{label}</div>
      <div style={{ flex: 1, fontSize: 12, color: T.t0, fontWeight: 500, fontFamily: mono ? T.fM : "inherit" }}>{value}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   REVISI 3: MGR KASBON — approval workflow
══════════════════════════════════════════════ */
function MgrKasbon({ currentUser, employees, kasbon, setKasbon, outlets }) {
  const nd = new Date(), mp = `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, "0")}`;
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ empId: "", amount: "", note: "" });
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [approvedMsg, setApprovedMsg] = useState(null);
  const [approvedMsgTimer, setApprovedMsgTimer] = useState(null);
  const isSuper = currentUser.role === "superadmin";
  const myEmps = isSuper ? employees.filter(e => e.role === "karyawan") : employees.filter(e => e.outletId === currentUser.outletId && e.role === "karyawan");
  const myK = kasbon.filter(k => myEmps.some(e => e.id === k.empId)).sort((a, b) => b.id - a.id);
  const pending = myK.filter(k => k.status === "pending");

  const reloadKasbon = async () => {
    const res = await fetch("/api/kasbon");
    const json = await res.json();
    if (json.success) setKasbon(json.data.map(k => ({ ...k, empId: k.userId })));
  };

  const add = async () => {
    if (!form.empId || !form.amount) return;
    const res = await fetch("/api/kasbon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: form.empId, amount: parseInt(form.amount), note: form.note }),
    });
    if (res.ok) await reloadKasbon();
    setShowAdd(false); setForm({ empId: "", amount: "", note: "" });
  };

  const approve = async (id) => {
    const k = kasbon.find(k => k.id === id);
    const emp = employees.find(e => e.id === k?.empId);
    const res = await fetch("/api/kasbon", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "aktif" }),
    });
    if (res.ok) {
      await reloadKasbon();
      setApprovedMsg(`✓ Kasbon ${emp?.name || ""} sejumlah ${rp(k?.amount || 0)} berhasil disetujui — akan dipotong di payroll bulan ini`);
      if (approvedMsgTimer) clearTimeout(approvedMsgTimer);
      setApprovedMsgTimer(setTimeout(() => setApprovedMsg(""), 4000));
    }
  };

  const reject = async (id, note) => {
    const res = await fetch("/api/kasbon", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "ditolak", rejectNote: note }),
    });
    if (res.ok) await reloadKasbon();
    setRejectModal(null); setRejectNote("");
  };

  const toggleLunas = async (id) => {
    const k = kasbon.find(k => k.id === id);
    const newStatus = k.status === "aktif" ? "lunas" : "aktif";
    const res = await fetch("/api/kasbon", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (res.ok) await reloadKasbon();
  };

  return (
    <div>
      <PageTitle sub="Kelola dan setujui kasbon karyawan" action={<SBtn onClick={() => setShowAdd(true)}>+ Tambah Kasbon</SBtn>}>Manajemen Kasbon</PageTitle>

      <div className="hr-stat-grid hr-row-3" style={{ marginBottom: 20 }}>
        <StatCard label="Menunggu Approval" value={pending.length} sub="perlu ditinjau" color={T.blue} icon="⏳" />
        <StatCard label="Kasbon Aktif" value={rp(myK.filter(k => k.status === "aktif" && k.date.startsWith(mp)).reduce((s, k) => s + k.amount, 0))} sub="bulan ini" color={T.red} icon="💳" />
        <StatCard label="Total Lunas" value={myK.filter(k => k.status === "lunas").length} sub="selesai" color={T.em} icon="✓" />
      </div>
      {!!approvedMsg && (
        <div style={{ background: T.emD, border: `1px solid ${T.em}44`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: T.em, fontWeight: 600 }}>
          {approvedMsg}
        </div>
      )}

      {/* Pending Section */}
      {pending.length > 0 && (
        <Card style={{ marginBottom: 20, border: `1px solid ${T.blue}44`, background: T.blueD + "44" }}>
          <div style={{ fontSize: 11, fontFamily: T.fM, letterSpacing: 1.5, color: T.blue, marginBottom: 14 }}>⏳ MENUNGGU PERSETUJUAN ({pending.length})</div>
          <div className="hr-table-scroll">
            <table className="hr-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Karyawan</Th><Th>Dept</Th><Th>Tanggal Pengajuan</Th><Th right>Jumlah</Th><Th>Keterangan</Th><Th>Aksi</Th></tr></thead>
              <tbody>
                {pending.map(k => {
                  const emp = employees.find(e => e.id === k.empId); return (
                    <tr key={k.id}>
                      <Td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={emp?.name || "?"} size={24} /><span style={{ fontWeight: 600, color: T.t0, fontSize: 12 }}>{emp?.name}</span></div></Td>
                      <Td><DeptBadge dept={emp?.dept || ""} /></Td>
                      <Td mono>{k.requestedAt || k.date}</Td>
                      <Td right bold color={T.blue}>{rp(k.amount)}</Td>
                      <Td>{k.note}</Td>
                      <Td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <SBtn size="sm" onClick={() => approve(k.id)} style={{ background: T.em, color: "#001810" }}>✓ Setujui</SBtn>
                          <SBtn size="sm" variant="danger" onClick={() => { setRejectModal(k.id); setRejectNote(""); }}>✗ Tolak</SBtn>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* All kasbon */}
      <Card>
        <div style={{ fontSize: 11, fontFamily: T.fM, letterSpacing: 1.5, color: T.t2, marginBottom: 14 }}>SEMUA KASBON</div>
        <div className="hr-table-scroll">
          <table className="hr-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Karyawan</Th><Th>Dept</Th><Th>Tanggal</Th><Th right>Jumlah</Th><Th>Keterangan</Th><Th>Status</Th><Th>Aksi</Th></tr></thead>
            <tbody>
              {myK.length === 0 && <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: T.t2, fontSize: 13 }}>Tidak ada kasbon</td></tr>}
              {myK.map(k => {
                const emp = employees.find(e => e.id === k.empId); return (
                  <tr key={k.id}>
                    <Td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={emp?.name || "?"} size={24} /><span style={{ fontWeight: 600, color: T.t0, fontSize: 12 }}>{emp?.name}</span></div></Td>
                    <Td><DeptBadge dept={emp?.dept || ""} /></Td>
                    <Td mono>{k.date}</Td>
                    <Td right bold color={T.red}>{rp(k.amount)}</Td>
                    <Td>{k.note}{k.rejectNote && <div style={{ fontSize: 10, color: T.red, marginTop: 2 }}>Alasan: {k.rejectNote}</div>}</Td>
                    <Td><KasbonStatusBadge status={k.status} /></Td>
                    <Td>
                      {k.status === "pending" && (
                        <div style={{ display: "flex", gap: 4 }}>
                          <SBtn size="sm" onClick={() => approve(k.id)} style={{ background: T.em, color: "#001810", fontSize: 10 }}>✓</SBtn>
                          <SBtn size="sm" variant="danger" onClick={() => { setRejectModal(k.id); setRejectNote(""); }} style={{ fontSize: 10 }}>✗</SBtn>
                        </div>
                      )}
                      {k.status === "aktif" && <SBtn size="sm" variant="primary" onClick={() => toggleLunas(k.id)}>Lunas</SBtn>}
                      {k.status === "lunas" && <SBtn size="sm" variant="secondary" onClick={() => toggleLunas(k.id)}>Aktifkan</SBtn>}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Tambah Kasbon (Langsung Aktif)">
        <div style={{ background: T.emD, border: `1px solid ${T.em}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: T.em }}>
          Kasbon yang ditambahkan manager langsung berstatus Aktif.
        </div>
        <FSelect label="Karyawan" value={form.empId} onChange={v => setForm(p => ({ ...p, empId: v }))} options={[{ value: "", label: "— Pilih —" }, ...myEmps.map(e => ({ value: e.id, label: e.name }))]} />
        <FInput label="Jumlah (Rp)" type="number" value={form.amount} onChange={v => setForm(p => ({ ...p, amount: v }))} placeholder="200000" />
        <FInput label="Keterangan" value={form.note} onChange={v => setForm(p => ({ ...p, note: v }))} placeholder="Keperluan kasbon..." />
        <SBtn onClick={add} style={{ width: "100%", justifyContent: "center" }}>Simpan Kasbon</SBtn>
      </Modal>

      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Tolak Pengajuan Kasbon" width={420}>
        <div style={{ background: T.redD, border: `1px solid ${T.red}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: T.red }}>
          Pengajuan kasbon <b>{employees.find(e => e.id === kasbon.find(k => k.id === rejectModal)?.empId)?.name}</b> sebesar <b>{rp(kasbon.find(k => k.id === rejectModal)?.amount || 0)}</b> akan ditolak.
        </div>
        <FInput label="Alasan Penolakan" value={rejectNote} onChange={setRejectNote} placeholder="Jelaskan alasan penolakan..." />
        <div style={{ display: "flex", gap: 10 }}>
          <SBtn variant="danger" onClick={() => reject(rejectModal, rejectNote)} style={{ flex: 1, justifyContent: "center" }}>✗ Tolak Pengajuan</SBtn>
          <SBtn variant="secondary" onClick={() => setRejectModal(null)} style={{ flex: 1, justifyContent: "center" }}>Batal</SBtn>
        </div>
      </Modal>
    </div>
  );
}

/* ══════════════ SA: OUTLET ══════════════ */
function SAOutlet({ outlets, setOutlets, employees, setEmployees }) {
  const [show, setShow] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showAssign, setShowAssign] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", lat: "", lng: "", radius: "50", shiftStart: "07:00", shiftEnd: "21:00", shift1Start: "07:00", shift1End: "14:00", shift2Start: "14:00", shift2End: "21:00", isSingleShift: false, dayOff: "0" });
  const [assignOutlet, setAssignOutlet] = useState("");
  const [saving, setSaving] = useState(false);
  const { addOutlet, updateOutlet } = useOutlets();

  const add = async () => {
    if (!form.name) return;
    setSaving(true);
    const payload = { name: form.name, address: form.address, lat: parseFloat(form.lat) || 0, lng: parseFloat(form.lng) || 0, radius: parseInt(form.radius) || 50, isSingleShift: form.isSingleShift, outletHours: { shiftStart: form.shiftStart || "07:00", shiftEnd: form.shiftEnd || "21:00", shift1Start: form.shift1Start || "07:00", shift1End: form.shift1End || "14:00", shift2Start: form.shift2Start || "14:00", shift2End: form.shift2End || "21:00" }, offDay: form.isSingleShift ? parseInt(form.dayOff) : null };
    const result = await addOutlet(payload);
    if (result) setOutlets(p => [...p, result]);
    setShow(false);
    setForm({ name: "", address: "", lat: "", lng: "", radius: "50", shiftStart: "07:00", shiftEnd: "21:00", shift1Start: "07:00", shift1End: "14:00", shift2Start: "14:00", shift2End: "21:00", isSingleShift: false, dayOff: "0" });
    setSaving(false);
  };

  const openEdit = (o) => { setShowEdit(o.id); const h = o.outletHours || {}; setForm({ name: o.name, address: o.address, lat: String(o.lat), lng: String(o.lng), radius: String(o.radius), shiftStart: h.shiftStart || "07:00", shiftEnd: h.shiftEnd || "21:00", shift1Start: h.shift1Start || "07:00", shift1End: h.shift1End || "14:00", shift2Start: h.shift2Start || "14:00", shift2End: h.shift2End || "21:00", isSingleShift: !!o.isSingleShift, dayOff: o.offDay !== null && o.offDay !== undefined ? String(o.offDay) : (h.dayOff !== undefined ? String(h.dayOff) : "0") }); };

  const saveEdit = async () => {
    if (!showEdit || !form.name) return;
    setSaving(true);
    const payload = { id: showEdit, name: form.name, address: form.address, lat: parseFloat(form.lat) || 0, lng: parseFloat(form.lng) || 0, radius: parseInt(form.radius) || 50, isSingleShift: form.isSingleShift, outletHours: { shiftStart: form.shiftStart, shiftEnd: form.shiftEnd, shift1Start: form.shift1Start, shift1End: form.shift1End, shift2Start: form.shift2Start, shift2End: form.shift2End }, offDay: form.isSingleShift ? parseInt(form.dayOff) : null };
    const result = await updateOutlet(payload);
    if (result) setOutlets(p => p.map(o => o.id === showEdit ? { ...o, ...payload } : o));
    setShowEdit(null);
    setSaving(false);
  };

  const doAssign = async () => {
    if (!showAssign || !assignOutlet) return;
    setSaving(true);
    const res = await fetch("/api/employees", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: showAssign, outletId: assignOutlet }),
    });
    const json = await res.json();
    if (json.success) {
      setEmployees(p => p.map(e => e.id === showAssign ? { ...e, outletId: assignOutlet } : e));
    }
    setShowAssign(null);
    setSaving(false);
  };
  return (
    <div>
      <PageTitle sub="Kelola outlet dan penugasan karyawan" action={<SBtn onClick={() => setShow(true)}>+ Tambah Outlet</SBtn>}>Manajemen Outlet</PageTitle>
      <div className="hr-stat-grid hr-row-3" style={{ gap: 16, marginBottom: 24 }}>
        {outlets.map(o => {
          const n = employees.filter(e => e.outletId === o.id && e.role === "karyawan").length; return (
            <Card key={o.id} p="20px 22px" style={{ position: "relative" }}>
              <button onClick={() => openEdit(o)} style={{ position: "absolute", top: 12, right: 12, background: "transparent", border: "none", cursor: "pointer", fontSize: 14, opacity: 0.6, padding: 4 }}>✏️</button>
              <div style={{ fontSize: 10, fontFamily: T.fM, letterSpacing: 1.5, color: T.em, marginBottom: 8 }}>OUTLET</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.t0, marginBottom: 4 }}>{o.name}</div>
              <div style={{ fontSize: 12, color: T.t2, marginBottom: 12 }}>{o.address}</div>
              <div style={{ display: "flex", gap: 8 }}><Pill color={T.blue} bg={T.blueD}>{n} Karyawan</Pill><Pill color={T.em} bg={T.emD}>Radius: {o.radius}m</Pill></div>
            </Card>
          );
        })}
      </div>
      <Card>
        <div style={{ fontSize: 11, fontFamily: T.fM, letterSpacing: 1.5, color: T.t2, marginBottom: 16 }}>PENUGASAN KARYAWAN</div>
        <div className="hr-table-scroll">
          <table className="hr-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>Karyawan</Th><Th>Dept</Th><Th>Outlet Saat Ini</Th><Th right>Gaji</Th><Th>Aksi</Th></tr></thead>
            <tbody>
              {employees.filter(e => e.role === "karyawan").map(emp => {
                const o = outlets.find(x => x.id === emp.outletId); return (
                  <tr key={emp.id}><Td><div style={{ display: "flex", alignItems: "center", gap: 9 }}><Avatar name={emp.name} size={24} /><span style={{ fontWeight: 600, color: T.t0, fontSize: 12 }}>{emp.name}</span></div></Td><Td><DeptBadge dept={emp.dept} /></Td><Td color={T.em}>{o?.name || "—"}</Td><Td right mono color={T.t1}>{rp(emp.gaji)}</Td><Td><SBtn size="sm" variant="ghost" onClick={() => { setShowAssign(emp.id); setAssignOutlet(emp.outletId); }}>Pindahkan</SBtn></Td></tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal open={show} onClose={() => setShow(false)} title="+ Tambah Outlet Baru">
        <FInput label="Nama Outlet" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Outlet Jakarta Selatan..." />
        <FInput label="Alamat" value={form.address} onChange={v => setForm(p => ({ ...p, address: v }))} placeholder="Jl. ..." />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <FInput label="Latitude" value={form.lat} onChange={v => setForm(p => ({ ...p, lat: v }))} placeholder="-6.2088" />
          <FInput label="Longitude" value={form.lng} onChange={v => setForm(p => ({ ...p, lng: v }))} placeholder="106.8456" />
        </div>
        <FInput label="Radius Absensi (meter)" type="number" value={form.radius} onChange={v => setForm(p => ({ ...p, radius: v }))} placeholder="50" />
        <div style={{ marginTop: 8, borderTop: `1px solid ${T.line}`, paddingTop: 12 }}>
          <div style={{ fontSize: 11, fontFamily: T.fM, color: T.em, letterSpacing: 1, marginBottom: 8 }}>JAM OPERASIONAL</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <FInput label="Jam Buka" value={form.shiftStart} onChange={v => setForm(p => ({ ...p, shiftStart: v }))} placeholder="07:00" />
            <FInput label="Jam Tutup" value={form.shiftEnd} onChange={v => setForm(p => ({ ...p, shiftEnd: v }))} placeholder="21:00" />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 10 }}>
            <input type="checkbox" checked={form.isSingleShift} onChange={e => setForm(p => ({ ...p, isSingleShift: e.target.checked }))} />
            <span style={{ fontSize: 12, color: T.t1, fontFamily: T.fS }}>Hanya 1 shift (tidak ada Shift 2)</span>
          </label>
          {form.isSingleShift && (
            <div style={{ marginBottom: 10 }}>
              <FSelect
                label="Hari Libur Default Outlet"
                value={form.dayOff}
                onChange={v => setForm(p => ({ ...p, dayOff: v }))}
                options={[
                  { value: "0", label: "Senin" },
                  { value: "1", label: "Selasa" },
                  { value: "2", label: "Rabu" },
                  { value: "3", label: "Kamis" },
                  { value: "4", label: "Jumat" },
                  { value: "5", label: "Sabtu" },
                  { value: "6", label: "Minggu" },
                ]}
              />
              <div style={{ fontSize: 11, color: T.t2, marginTop: -6, marginBottom: 8 }}>Setiap karyawan mendapat 1 hari off per minggu</div>
            </div>
          )}
          {!form.isSingleShift && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <FInput label="Shift 1 Mulai" value={form.shift1Start} onChange={v => setForm(p => ({ ...p, shift1Start: v }))} placeholder="07:00" />
                <FInput label="Shift 1 Selesai" value={form.shift1End} onChange={v => setForm(p => ({ ...p, shift1End: v }))} placeholder="14:00" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <FInput label="Shift 2 Mulai" value={form.shift2Start} onChange={v => setForm(p => ({ ...p, shift2Start: v }))} placeholder="14:00" />
                <FInput label="Shift 2 Selesai" value={form.shift2End} onChange={v => setForm(p => ({ ...p, shift2End: v }))} placeholder="21:00" />
              </div>
            </>
          )}
        </div>
        <SBtn onClick={add} style={{ width: "100%", justifyContent: "center", marginTop: 16 }}>Simpan Outlet</SBtn>
      </Modal>
      <Modal open={!!showAssign} onClose={() => setShowAssign(null)} title="Pindahkan Karyawan">
        <div style={{ marginBottom: 10, fontSize: 13, color: T.t1 }}>Karyawan: <b style={{ color: T.t0 }}>{employees.find(e => e.id === showAssign)?.name}</b></div>
        <FSelect label="Outlet Tujuan" value={assignOutlet} onChange={setAssignOutlet} options={outlets.map(o => ({ value: o.id, label: o.name }))} />
        <div style={{ display: "flex", gap: 10 }}><SBtn onClick={doAssign} style={{ flex: 1, justifyContent: "center" }} disabled={saving}>{saving ? "Memindahkan..." : "Pindahkan"}</SBtn><SBtn variant="secondary" onClick={() => setShowAssign(null)} style={{ flex: 1, justifyContent: "center" }}>Batal</SBtn></div>
      </Modal>
      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title="✏️ Edit Outlet" closeOnBackdrop={false}>
        <FInput label="Nama Outlet" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Outlet Jakarta Selatan..." />
        <FInput label="Alamat" value={form.address} onChange={v => setForm(p => ({ ...p, address: v }))} placeholder="Jl. ..." />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <FInput label="Latitude" value={form.lat} onChange={v => setForm(p => ({ ...p, lat: v }))} placeholder="-6.2088" />
          <FInput label="Longitude" value={form.lng} onChange={v => setForm(p => ({ ...p, lng: v }))} placeholder="106.8456" />
        </div>
        <FInput label="Radius Absensi (meter)" type="number" value={form.radius} onChange={v => setForm(p => ({ ...p, radius: v }))} placeholder="50" />
        <div style={{ marginTop: 8, borderTop: `1px solid ${T.line}`, paddingTop: 12 }}>
          <div style={{ fontSize: 11, fontFamily: T.fM, color: T.em, letterSpacing: 1, marginBottom: 8 }}>JAM OPERASIONAL & SHIFT</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <FInput label="Jam Buka" value={form.shiftStart} onChange={v => setForm(p => ({ ...p, shiftStart: v }))} placeholder="07:00" />
            <FInput label="Jam Tutup" value={form.shiftEnd} onChange={v => setForm(p => ({ ...p, shiftEnd: v }))} placeholder="21:00" />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 10 }}>
            <input type="checkbox" checked={form.isSingleShift} onChange={e => setForm(p => ({ ...p, isSingleShift: e.target.checked }))} />
            <span style={{ fontSize: 12, color: T.t1, fontFamily: T.fS }}>Hanya 1 shift (tidak ada Shift 2)</span>
          </label>
          {form.isSingleShift && (
            <div style={{ marginBottom: 10 }}>
              <FSelect
                label="Hari Libur Default Outlet"
                value={form.dayOff}
                onChange={v => setForm(p => ({ ...p, dayOff: v }))}
                options={[
                  { value: "0", label: "Senin" },
                  { value: "1", label: "Selasa" },
                  { value: "2", label: "Rabu" },
                  { value: "3", label: "Kamis" },
                  { value: "4", label: "Jumat" },
                  { value: "5", label: "Sabtu" },
                  { value: "6", label: "Minggu" },
                ]}
              />
              <div style={{ fontSize: 11, color: T.t2, marginTop: -6, marginBottom: 8 }}>Setiap karyawan mendapat 1 hari off per minggu (bergilir)</div>
            </div>
          )}
          {!form.isSingleShift && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <FInput label="Shift 1 Mulai" value={form.shift1Start} onChange={v => setForm(p => ({ ...p, shift1Start: v }))} placeholder="07:00" />
                <FInput label="Shift 1 Selesai" value={form.shift1End} onChange={v => setForm(p => ({ ...p, shift1End: v }))} placeholder="14:00" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <FInput label="Shift 2 Mulai" value={form.shift2Start} onChange={v => setForm(p => ({ ...p, shift2Start: v }))} placeholder="14:00" />
                <FInput label="Shift 2 Selesai" value={form.shift2End} onChange={v => setForm(p => ({ ...p, shift2End: v }))} placeholder="21:00" />
              </div>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <SBtn onClick={saveEdit} style={{ flex: 1, justifyContent: "center" }}>💾 Simpan Perubahan</SBtn>
          <SBtn variant="secondary" onClick={() => setShowEdit(null)} style={{ flex: 1, justifyContent: "center" }}>Batal</SBtn>
        </div>
      </Modal>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SA: PAYROLL — REVISI 5: detail sub-item slip, persist to DB, auto-alpha
══════════════════════════════════════════════ */
function SAPayroll({ employees, attendance, kasbon, setKasbon, adjustments, setAdjustments, outlets }) {
  const [selOutlet, setSelOutlet] = useState(outlets[0]?.id || "");
  const [viewMode, setViewMode] = useState("perOutlet"); // "perOutlet" or "allOutlets"
  const [showAdj, setShowAdj] = useState(null);
  const [adjForm, setAdjForm] = useState({ type: "tambah", amount: "", note: "" });
  const [generated, setGenerated] = useState(false);
  const [generatedMonth, setGeneratedMonth] = useState("");
  const [showTarifModal, setShowTarifModal] = useState(false);
  const [tarifLembur, setTarifLembur] = useState({ "Outlet": 25000, "Kasir": 25000, "Kitchen": 35000, "Security": 25000 });
  const [printSlip, setPrintSlip] = useState(null);
  const [printOutlet, setPrintOutlet] = useState(null);
  const [savedPayrollData, setSavedPayrollData] = useState([]); // persisted payroll records
  const [loading, setLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const nd = new Date();
  const mp = `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, "0")}`;
  const TARIF_TERLAMBAT = 10000, TARIF_EARLY = 500;

  // Save All as PDF — opens a standalone print window with all displayed slips
  // Layout: 2×2 grid (4 employees per A4 page)
  const saveAllPdf = () => {
    const totalPages = Math.ceil(displayedEmps.length / 4);
    const totalSlips = displayedEmps.length;
    const pagesHtml = [];
    for (let p = 0; p < totalPages; p++) {
      const pageSlips = displayedEmps.slice(p * 4, p * 4 + 4);
      const isFirstPage = p === 0;
      const isLastPage = p === totalPages - 1;
      const slipsOnPage = pageSlips.map((emp) => {
        const empOutlet = outlets.find(o => o.id === emp.outletId);
        return `<div class="slip-card">
          <div class="slip-head">
            <div class="slip-head-l">
              <div class="slip-name">${emp.name}</div>
              <div class="slip-meta">${emp.dept} — ${empOutlet?.name || "—"}</div>
              <div class="slip-meta">Hadir:${emp.hadir}h | Alpha:${emp.alpha || 0}× | Telat:${emp.lateDays}× | Lembur:${emp.totalOTKali}×</div>
            </div>
            <div class="slip-head-r">
              <div class="slip-bersih-label">GAJI BERSIH</div>
              <div class="slip-bersih-val">${rp(emp.bersih)}</div>
            </div>
          </div>
          <div class="slip-cols">
            <div class="slip-col">
              <div class="slip-col-title">PENDAPATAN</div>
              <div class="slip-row"><span>Gaji Pokok (Prorate)</span><span>${rp(emp.gajiPokok)}</span></div>
              <div class="slip-sub">Rp ${rp(emp.gaji)} ÷ 30 × ${emp.hadir + emp.lateDays} hari</div>
              ${emp.totalOTKali > 0 ? `<div class="slip-row"><span>+Lembur (${emp.totalOTKali}× × Rp${rp(emp.tarifOT)})</span><span class="pos">+${rp(emp.plusL)}</span></div>` : ""}
              ${(emp.adjTambah && emp.adjTambah.length > 0) ? emp.adjTambah.map(a => `<div class="slip-subrow"><span>• ${a.note || "Bonus"}</span><span class="pos">+${rp(a.amount)}</span></div>`).join("") : ""}
              <div class="slip-total pos"><span>Total Pendapatan</span><span>${rp(emp.gajiPokok + emp.plusL + emp.tambah)}</span></div>
            </div>
            <div class="slip-col">
              <div class="slip-col-title">POTONGAN</div>
              ${emp.potT > 0 ? `<div class="slip-row"><span>-Terlambat (${emp.lateDays}×)</span><span class="neg">-${rp(emp.potT)}</span></div>` : ""}
              ${emp.potE > 0 ? `<div class="slip-row"><span>-Pulang Cepat (${formatMins(emp.totalEarly)})</span><span class="neg">-${rp(emp.potE)}</span></div>` : ""}
              ${(emp.myKasbonList && emp.myKasbonList.length > 0) ? emp.myKasbonList.map(k => `<div class="slip-subrow"><span>• ${k.note || "Kasbon"} (${k.date})</span><span class="neg">-${rp(k.amount)}</span></div>`).join("") : ""}
              ${emp.potong > 0 ? `<div class="slip-row"><span>-Potongan Lain</span><span class="neg">-${rp(emp.potong)}</span></div>` : ""}
              <div class="slip-total neg"><span>Total Potongan</span><span>-${rp(emp.potT + emp.potE + emp.myK + emp.potong)}</span></div>
            </div>
          </div>
          <div class="slip-foot"><span>GAJI BERSIH</span><span class="pos">${rp(emp.bersih)}</span></div>
        </div>`;
      }).join("");
      const titleBlock = isFirstPage ? `<div class="page-title">
        <div class="page-title-main">REKAPITULASI SLIP GAJI BULANAN</div>
        <div class="page-title-sub">HR System — ${MONTHS[nd.getMonth()]} ${nd.getFullYear()}</div>
        <div class="page-title-info">${totalSlips} karyawan — ${outlets.length} outlet — Halaman ${p + 1} / ${totalPages}</div>
      </div>` : `<div class="page-header">Halaman ${p + 1} / ${totalPages}</div>`;
      pagesHtml.push(`<div class="page"${isLastPage ? "" : ""}>
        ${titleBlock}
        <div class="slip-grid">${slipsOnPage}</div>
      </div>`);
    }
    const printWin = window.open("", "_blank", "width=900,height=700");
    if (!printWin) { alert("Pop-up diblokir. Izinkan pop-up untuk situs ini lalu coba lagi."); return; }
    printWin.document.write(`<!DOCTYPE html><html><head><title>Slip Gaji ${mp}</title>
      <script>
        window.addEventListener('load', function() {
          setTimeout(function() { window.focus(); window.print(); }, 250);
        });
      <\/script>
      <style>
        @page { size: A4; margin: 10mm; }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #fff; font-family: 'Courier New', monospace; color: #000; }
        .page { width: 190mm; min-height: 277mm; padding: 6mm 8mm; page-break-after: always; display: flex; flex-direction: column; }
        .page:last-child { page-break-after: avoid; }
        .page-title { text-align: center; margin-bottom: 6mm; padding-bottom: 3mm; border-bottom: 2px solid #000; }
        .page-title-main { font-size: 16pt; font-weight: 900; letter-spacing: -0.5px; }
        .page-title-sub { font-size: 9pt; color: #555; margin-top: 1mm; }
        .page-title-info { font-size: 8pt; color: #888; margin-top: 0.5mm; }
        .page-header { text-align: right; font-size: 8pt; color: #888; margin-bottom: 3mm; }
        .slip-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 4mm; flex: 1; }
        .slip-card { border: 1px solid #999; border-radius: 3mm; padding: 3mm 4mm; background: #fff; display: flex; flex-direction: column; overflow: hidden; }
        .slip-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2mm; padding-bottom: 2mm; border-bottom: 1px solid #ccc; gap: 2mm; }
        .slip-head-l { flex: 1; min-width: 0; }
        .slip-head-r { background: #000; color: #fff; border-radius: 1.5mm; padding: 1.5mm 3mm; text-align: right; flex-shrink: 0; }
        .slip-name { font-size: 10pt; font-weight: 800; line-height: 1.15; }
        .slip-meta { font-size: 7pt; color: #555; line-height: 1.3; }
        .slip-bersih-label { font-size: 6pt; font-weight: 600; letter-spacing: 0.5px; opacity: .75; color: #ccc; }
        .slip-bersih-val { font-size: 11pt; font-weight: 800; }
        .slip-cols { display: flex; gap: 2mm; flex: 1; }
        .slip-col { flex: 1; border: 1px solid #ddd; border-radius: 1.5mm; padding: 1.5mm 2mm; min-width: 0; }
        .slip-col-title { font-size: 7pt; color: #777; margin-bottom: 1mm; font-weight: 700; letter-spacing: 0.3px; }
        .slip-row { display: flex; justify-content: space-between; font-size: 8pt; line-height: 1.4; gap: 2mm; }
        .slip-row span:first-child { flex: 1; min-width: 0; }
        .slip-row span:last-child { font-weight: 600; white-space: nowrap; }
        .slip-sub { font-size: 6pt; color: #888; margin-bottom: 0.5mm; }
        .slip-subrow { display: flex; justify-content: space-between; font-size: 6.5pt; color: #555; line-height: 1.3; gap: 2mm; }
        .slip-subrow span:first-child { flex: 1; min-width: 0; }
        .slip-subrow span:last-child { white-space: nowrap; }
        .slip-total { display: flex; justify-content: space-between; font-weight: 700; border-top: 1px solid #ddd; padding-top: 1mm; margin-top: 1mm; font-size: 8pt; gap: 2mm; }
        .slip-total span:first-child { flex: 1; }
        .slip-total span:last-child { white-space: nowrap; }
        .pos { color: #006644; }
        .neg { color: #c00; }
        .slip-foot { display: flex; justify-content: space-between; font-weight: 800; font-size: 9pt; padding: 1.5mm 0 0; border-top: 1.5px solid #000; margin-top: 2mm; gap: 2mm; }
        .slip-foot span:first-child { flex: 1; }
        .slip-foot span:last-child { white-space: nowrap; }
      </style>
    </head><body>${pagesHtml.join("")}</body></html>`);
    printWin.document.close();
  };

  // Load adjustments from API
  useEffect(() => {
    fetch("/api/adjustments")
      .then(r => r.json())
      .then(j => { if (j.success) setAdjustments(j.data.map(a => ({ ...a, empId: a.userId }))); })
      .catch(() => { });
  }, []);

  // Load saved payroll data from API (for detail display after publish)
  useEffect(() => {
    if (!generated || !generatedMonth) return;
    fetch(`/api/payroll?month=${generatedMonth}`)
      .then(r => r.json())
      .then(j => { if (j.success) setSavedPayrollData(j.data); })
      .catch(() => { });
  }, [generated, generatedMonth]);

  const outletEmps = employees.filter(e => e.outletId === selOutlet && e.role === "karyawan");

  // Combine DB adjustments with locally added ones
  const allAdjs = adjustments;

  const calcPayrollRow = (emp, attData) => {
    const allAtts = (attData || attendance).filter(a => a.empId === emp.id && a.date.startsWith(mp));
    // Hadir di server: status "hadir" ATAU "terlambat" (override ke-3+ tetap dihitung hari kerja)
    const hadir = allAtts.filter(a => a.status === "hadir" || a.status === "terlambat").length;
    const alpha = allAtts.filter(a => a.status === "alpa").length;

    // Late days: telat izin ke-3+ (status "terlambat") dihitung, sesuai calculatePayroll() server
    // Rule: izin terlambat gratis max 2x/bulan; ke-3+ kena potong.
    // - izin (lateWithPermission=true, lateMins=0, status="hadir") → tidak dihitung
    // - over-limit (status="terlambat" atau keterangan="terlambat") → dihitung
    // - telat biasa tanpa override (status="hadir", lateMins>15, !lateWithPermission) → dihitung
    const lateDays = allAtts.filter(a =>
      (a.lateMins > 15 && !a.lateWithPermission) ||
      a.status === "terlambat" ||
      a.keterangan === "terlambat"
    ).length;
    const totalOTKali = allAtts.reduce((s, a) => s + (a.overtimeCount || 0), 0);
    const totalEarly = allAtts.reduce((s, a) => s + (a.earlyMins || 0), 0);

    // Kasbon aktif bulan ini
    const myKasbonList = kasbon.filter(k => k.empId === emp.id && k.status === "aktif" && k.date.startsWith(mp));
    const myK = myKasbonList.reduce((s, k) => s + k.amount, 0);

    // Adjustments bulan ini
    const myAdj = allAdjs.filter(a => a.empId === emp.id && a.date.startsWith(mp));
    const adjTambah = myAdj.filter(a => a.type === "tambah");
    const adjPotong = myAdj.filter(a => a.type === "potong");
    const tambah = adjTambah.reduce((s, a) => s + (a.amount || 0), 0);
    const potong = adjPotong.reduce((s, a) => s + (a.amount || 0), 0);

    const tarifOT = tarifLembur[emp.dept] || 25000;
    const plusL = totalOTKali * tarifOT;
    const potT = lateDays * TARIF_TERLAMBAT;
    const potE = totalEarly * TARIF_EARLY;

    // Gaji pokok prorate mengikuti logika server: totalHadir + min(latePermissionCount,2) - latePermissionOverLimit
    // Untuk UI preview yang ringkas, pakai hadir + lateDays sebagai pendekatan (sudah mencakup record terlambat).
    const gajiPokok = Math.round((emp.gaji / 30) * (hadir + lateDays));
    const bersih = gajiPokok + plusL + tambah - potT - potE - myK - potong;

    return {
      ...emp, hadir, alpha, lateDays, totalOTKali, totalEarly,
      myK, myKasbonList,
      adjTambah, adjPotong, tambah, potong,
      plusL, potT, potE, tarifOT, gajiPokok, bersih
    };
  };

  const payrollData = useMemo(() => {
    // Include locally added adjustments in the calculation
    const localAdjs = adjustments.filter(a => a.date.startsWith(mp));
    return outletEmps.map(emp => calcPayrollRow(emp, null));
  }, [outletEmps, attendance, kasbon, adjustments, mp, tarifLembur]);

  const allPayrollData = useMemo(() => {
    return employees.filter(e => e.role === "karyawan").map(emp => calcPayrollRow(emp, null));
  }, [employees, attendance, kasbon, adjustments, mp, tarifLembur]);

  // When publishing: save adjustments to DB, then POST to payroll API
  const handlePublish = async () => {
    if (!confirm(`Terbitkan slip gaji bulan ${mp}?\n\n- Semua penyesuaian manual akan disimpan ke database\n- Record alpha akan dibuat otomatis untuk shift tidak hadir\n- Kasbon aktif akan ditandai LUNAS`)) return;

    setLoading(true);
    setSyncMsg("Menyimpan penyesuaian...");

    try {
      // 1. Save all locally-added adjustments to DB
      const localAdjs = adjustments.filter(a => a.by && String(a.by).startsWith(Date.now().toString().slice(0, 6)));
      for (const adj of adjustments) {
        if (adj.id && String(adj.id).length > 6 && !String(adj.id).match(/^\d{10,}$/)) continue;
        await fetch("/api/adjustments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: adj.empId, type: adj.type, amount: adj.amount, note: adj.note })
        });
      }
      setSyncMsg("Menghitung & menyimpan payroll...");

      // 2. POST to payroll API (saves to DB + creates alpha records)
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: mp, outletId: viewMode === "perOutlet" ? selOutlet : "" })
      });
      const json = await res.json();

      if (!json.success) {
        alert("Gagal: " + json.error);
        setLoading(false);
        return;
      }

      setSyncMsg(json.data?.message || "Selesai!");
      setGenerated(true);
      setGeneratedMonth(mp);

      // Refresh adjustments from DB
      const adjRes = await fetch("/api/adjustments");
      const adjJson = await adjRes.json();
      if (adjJson.success) setAdjustments(adjJson.data.map(a => ({ ...a, empId: a.userId })));

      // Refresh kasbon
      const kbRes = await fetch("/api/kasbon");
      const kbJson = await kbRes.json();
      if (kbJson.success) setKasbon(kbJson.data.map(k => ({ ...k, empId: k.userId })));

    } catch (e) {
      alert("Error: " + e.message);
    }
    setLoading(false);
    setTimeout(() => setSyncMsg(""), 3000);
  };

  // Get saved payroll record for a user (after publish)
  const getSavedPayroll = (empId) => savedPayrollData.find(p => p.user?.id === empId);

  const perOutletTotals = useMemo(() => outlets.map(o => {
    const emps = allPayrollData.filter(e => e.outletId === o.id);
    const totalGaji = emps.reduce((s, e) => s + e.bersih, 0);
    const totalLembur = emps.reduce((s, e) => s + e.plusL, 0);
    const totalOTKali = emps.reduce((s, e) => s + e.totalOTKali, 0);
    const count = emps.length;
    return { outlet: o, totalGaji, totalLembur, totalOTKali, count };
  }), [outlets, allPayrollData]);

  const grand = viewMode === "allOutlets" ? allPayrollData.reduce((s, e) => s + e.bersih, 0) : payrollData.reduce((s, e) => s + e.bersih, 0);
  const displayedEmps = viewMode === "allOutlets" ? allPayrollData : payrollData;

  // Save adjustment to DB via API
  const saveAdj = async () => {
    if (!showAdj || !adjForm.amount) return;
    try {
      const res = await fetch("/api/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: showAdj, type: adjForm.type, amount: parseInt(adjForm.amount), note: adjForm.note })
      });
      const json = await res.json();
      if (json.success) {
        // Refresh from DB
        const allAdjRes = await fetch("/api/adjustments");
        const allAdjJson = await allAdjRes.json();
        if (allAdjJson.success) setAdjustments(allAdjJson.data.map(a => ({ ...a, empId: a.userId })));
      } else {
        alert("Gagal simpan: " + json.error);
      }
    } catch (e) { alert("Error: " + e.message); }
    setShowAdj(null);
    setAdjForm({ type: "tambah", amount: "", note: "" });
  };

  // Hapus adjustment (tidak diizinkan kalau sudah applied)
  const delAdj = async (a) => {
    if (a.appliedToPayrollId) {
      alert("Adjustment ini sudah dipakai di payroll. Klik ↺ Unapply dulu untuk membuat ulang payroll tanpa adjustment ini.");
      return;
    }
    if (!confirm(`Hapus adjustment ${a.type} Rp${rp(a.amount)} untuk ${employees.find(e => e.id === a.empId)?.name}?`)) return;
    try {
      const res = await fetch(`/api/adjustments/${a.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setAdjustments(pr => pr.filter(x => x.id !== a.id));
      } else {
        alert("Gagal hapus: " + json.error);
      }
    } catch (e) { alert("Error: " + e.message); }
  };

  // Unapply: hapus payroll, regenerate ulang tanpa adjustment ini
  const unapplyAdj = async (a) => {
    if (!confirm(`Adjustment ini dipakai di payroll ${a.appliedToPayrollId}.\n\nKlik OK untuk:\n1. Menghapus payroll lama (status: ${payrolls.find(p => p.id === a.appliedToPayrollId)?.status})\n2. Mengatur ulang adjustment agar kembali ke Draft\n3. Anda bisa terbitkan payroll baru tanpa adjustment ini\n\nLanjutkan?`)) return;
    try {
      // 1. Hapus payroll
      const delRes = await fetch(`/api/payroll/${a.appliedToPayrollId}`, { method: "DELETE" });
      const delJson = await delRes.json();
      if (!delJson.success) { alert("Gagal hapus payroll: " + delJson.error); return; }

      // 2. Clear appliedToPayrollId di adjustment
      const updRes = await fetch(`/api/adjustments/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appliedToPayrollId: null, status: "draft" })
      });
      const updJson = await updRes.json();
      if (!updJson.success) { alert("Adjustment update gagal: " + updJson.error); return; }

      // 3. Refresh adjustments & payrolls state
      setAdjustments(pr => pr.map(x => x.id === a.id ? { ...x, appliedToPayrollId: null, status: "draft" } : x));
      setPayrolls(pr => pr.filter(p => p.id !== a.appliedToPayrollId));

      alert("✓ Berhasil unapply. Sekarang klik 'Terbitkan & Simpan' untuk buat payroll baru tanpa adjustment ini.");
    } catch (e) { alert("Error: " + e.message); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <PageTitle sub={`Kalkulasi gaji otomatis — ${MONTHS[nd.getMonth()]} ${nd.getFullYear()}`}>Payroll Bulanan</PageTitle>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {syncMsg && <Pill color={T.blue} bg={T.blueD}>{syncMsg}</Pill>}
          {generated && <Pill color={T.em} bg={T.emD}>✓ Slip Diterbitkan {generatedMonth}</Pill>}
          <SBtn variant="blue" onClick={() => setShowTarifModal(true)}>⚙️ Tarif</SBtn>
          <SBtn variant="secondary" onClick={saveAllPdf}>💾 Save as PDF (Semua)</SBtn>
          <SBtn variant="amber" onClick={handlePublish} disabled={loading}>{loading ? "⏳..." : "🖨 Terbitkan & Simpan"}</SBtn>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, background: T.bg3, borderRadius: 8, padding: 4 }}>
          <button onClick={() => setViewMode("perOutlet")} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: viewMode === "perOutlet" ? T.em : "transparent", color: viewMode === "perOutlet" ? "#fff" : T.t2, cursor: "pointer", fontFamily: T.fS, fontWeight: 600, fontSize: 12 }}>Per Outlet</button>
          <button onClick={() => setViewMode("allOutlets")} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: viewMode === "allOutlets" ? T.em : "transparent", color: viewMode === "allOutlets" ? "#fff" : T.t2, cursor: "pointer", fontFamily: T.fS, fontWeight: 600, fontSize: 12 }}>Semua Outlet</button>
        </div>
        {viewMode === "perOutlet" && outlets.map(o => <SBtn key={o.id} variant={selOutlet === o.id ? "primary" : "secondary"} onClick={() => { setSelOutlet(o.id); setGenerated(false); }}>{o.name}</SBtn>)}
      </div>
      <div className="hr-stat-grid hr-row-4" style={{ marginBottom: 20 }}>
        <StatCard label="Total Pengeluaran" value={rp(grand)} color={T.em} icon="💰" sub={viewMode === "allOutlets" ? `${allPayrollData.length} karyawan` : `${outletEmps.length} karyawan`} />
        <StatCard label="Total Kasbon Dipotong" value={rp(displayedEmps.reduce((s, e) => s + e.myK, 0))} color={T.red} icon="💳" sub="bulan ini" />
        <StatCard label="Total Lembur" value={`${displayedEmps.reduce((s, e) => s + e.totalOTKali, 0)}×`} color={T.purple} icon="⚡" sub={`Rp${rp(displayedEmps.reduce((s, e) => s + e.plusL, 0))}`} />
        <StatCard label="Alpha / Tidak Hadir" value={displayedEmps.reduce((s, e) => s + e.alpha, 0)} sub="hari alfa bulan ini" color={T.red} icon="🚫" />
      </div>
      {/* Bulk lunas — mark kasbon aktif bulan ini sbg lunas setelah payroll */}
      {displayedEmps.some(e => e.myK > 0) && (
        <div style={{ marginBottom: 14 }}>
          <SBtn variant="primary" onClick={async () => {
            if (!confirm("Yakin gaji bulan ini sudah diterima? Semua kasbon aktif akan ditandai LUNAS.")) return;
            const activeKasbon = kasbon.filter(k => k.empId && displayedEmps.some(e => e.id === k.empId) && k.status === "aktif" && k.date.startsWith(mp));
            for (const k of activeKasbon) {
              await fetch("/api/kasbon", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: k.id, status: "lunas" }) });
            }
            const res = await fetch("/api/kasbon");
            const json = await res.json();
            if (json.success) setKasbon(json.data.map(k => ({ ...k, empId: k.userId })));
          }}>
            ✓ Tandai Semua Kasbon Aktif Bulan Ini = LUNAS
          </SBtn>
          <div style={{ fontSize: 11, color: T.t2, marginTop: 6 }}>Klik SETELAH payroll dicetak &amp; gaji diterima — semua kasbon aktif bulan ini berubah menjadi LUNAS</div>
        </div>
      )}
      {/* Info tarif */}
      <div style={{ background: T.purpleD, border: `1px solid ${T.purple}33`, borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 12, color: T.purple }}>
        💡 Tarif lembur per dept: <b>{Object.entries(tarifLembur).map(([d, t]) => `${d}: ${rp(t)}`).join(" | ")}</b> &nbsp;|&nbsp; Potongan terlambat: <b>Rp 10.000/kejadian</b> &nbsp;|&nbsp; Potongan pulang cepat: <b>Rp 500/menit</b>
      </div>

      {viewMode === "allOutlets" && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontFamily: T.fM, letterSpacing: 1.5, color: T.t2, marginBottom: 14 }}>RINGKASAN PER OUTLET</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {perOutletTotals.map(({ outlet, totalGaji, totalLembur, totalOTKali, count }) => {
              const oEmps = allPayrollData.filter(e => e.outletId === outlet.id);
              return (
                <Card key={outlet.id} p="16px" style={{ background: T.bg3 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.t0 }}>{outlet.name}</div>
                    <SBtn size="sm" variant="secondary" onClick={() => setPrintOutlet({ outlet, employees: oEmps, grand: totalGaji })}>🖨 Cetak</SBtn>
                  </div>
                  <div style={{ fontSize: 11, color: T.t2, marginBottom: 4 }}>{count} karyawan</div>
                  <div style={{ fontSize: 11, color: T.t2, marginBottom: 8 }}>{totalOTKali}× lembur = {rp(totalLembur)}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.em, fontFamily: T.fM }}>{rp(totalGaji)}</div>
                </Card>
              );
            })}
          </div>
        </Card>
      )}

      <Card style={{ overflow: "auto" }}>
        <table className="hr-payroll-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
          <thead><tr>
            <Th>Karyawan</Th><Th>Dept</Th>{viewMode === "allOutlets" && <Th>Outlet</Th>}
            <Th right>Hadir</Th><Th right>Alpha</Th><Th right>Telat</Th><Th right>Lembur</Th>
            <Th right>Gaji Pokok</Th><Th right>+Lembur</Th><Th right>+Tambahan</Th>
            <Th right>-Telat</Th><Th right>-Kasbon</Th><Th right>-Potong</Th>
            <Th right>= Bersih</Th><Th>Cetak</Th><Th>Adj</Th>
          </tr></thead>
          <tbody>
            {displayedEmps.map(emp => {
              const empOutlet = outlets.find(o => o.id === emp.outletId); return (
                <tr key={emp.id}>
                  <Td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={emp.name} size={24} /><span style={{ fontWeight: 600, color: T.t0, fontSize: 12 }}>{emp.name}</span></div></Td>
                  <Td><DeptBadge dept={emp.dept} /></Td>
                  {viewMode === "allOutlets" && <Td>{empOutlet?.name || "—"}</Td>}
                  <Td right mono color={T.em}>{emp.hadir}h</Td>
                  <Td right mono color={emp.alpha > 0 ? T.red : T.t2}>{emp.alpha > 0 ? emp.alpha + "×" : "—"}</Td>
                  <Td right mono color={emp.lateDays > 0 ? T.amber : T.t2}>{emp.lateDays}×</Td>
                  <Td right mono color={emp.totalOTKali > 0 ? T.purple : T.t2}>{emp.totalOTKali > 0 ? `${emp.totalOTKali}×` : "—"}</Td>
                  <Td right mono>{rp(emp.gaji)}</Td>
                  <Td right mono color={T.purple}>{emp.plusL > 0 ? "+" + rp(emp.plusL) : "—"}</Td>
                  <Td right mono color={T.em}>{emp.tambah > 0 ? "+" + rp(emp.tambah) : "—"}</Td>
                  <Td right mono color={emp.potT > 0 ? T.red : T.t2}>{emp.potT > 0 ? "-" + rp(emp.potT) : "—"}</Td>
                  <Td right mono color={emp.myK > 0 ? T.red : T.t2}>{emp.myK > 0 ? "-" + rp(emp.myK) : "—"}</Td>
                  <Td right mono color={emp.potong > 0 ? T.red : T.t2}>{emp.potong > 0 ? "-" + rp(emp.potong) : "—"}</Td>
                  <Td right bold color={emp.bersih >= emp.gaji ? T.em : T.amber}><span style={{ fontFamily: T.fM, fontSize: 13 }}>{rp(emp.bersih)}</span></Td>
                  <Td><SBtn size="sm" variant="ghost" onClick={() => setPrintSlip(emp)}>🖨 Slip</SBtn></Td>
                  <Td><SBtn size="sm" variant="ghost" onClick={() => { setShowAdj(emp.id); setAdjForm({ type: "tambah", amount: "", note: "" }); }}>± Adj</SBtn></Td>
                </tr>
              );
            })}
            <tr style={{ background: T.bg3, borderTop: `2px solid ${T.lineL}` }}>
              <td colSpan={viewMode === "allOutlets" ? 13 : 12} style={{ padding: "12px 13px", fontFamily: T.fS, fontWeight: 800, color: T.t0, fontSize: 13 }}>TOTAL{viewMode === "allOutlets" ? "" : ` — ${outlets.find(o => o.id === selOutlet)?.name}`}</td>
              <Td right bold color={T.em}><span style={{ fontFamily: T.fM, fontSize: 15 }}>{rp(grand)}</span></Td>
              <Td></Td><Td></Td>
            </tr>
          </tbody>
        </table>
      </Card>

      {/* PRINT SLIP — Individual + Bulk */}
      {printSlip && (
        <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setPrintSlip(null)}>
          <div className="hr-print-panel" style={{ background: "#fff", borderRadius: 12, padding: "40px 36px", width: printSlip.__bulk ? 720 : 600, maxHeight: printSlip.__bulk ? "none" : "90vh", overflowY: printSlip.__bulk ? "visible" : "auto", boxShadow: "0 32px 80px #000", fontFamily: "'Courier New', monospace", maxWidth: "100%" }} onClick={e => e.stopPropagation()}>
            <style>{`
              @page { size: A4; margin: 18mm; }
              @media print {
                body * { visibility: hidden !important; }
                #print-root, #print-root * { visibility: visible !important; }
                #print-root { position: absolute; left: 0; top: 0; width: 100%; background: #fff !important; color: #000 !important; }
                #print-root > div { max-height: none !important; overflow: visible !important; background: #fff !important; color: #000 !important; }
                .slip-card { page-break-before: auto; page-break-after: always; page-break-inside: avoid; }
                .slip-card:last-child { page-break-after: auto; }
                #print-root * { color: #000 !important; background-color: #fff !important; fill: #000 !important; border-color: #ccc !important; }
                .print-header { page-break-after: avoid; }
              }
            `}</style>
            <div style={{ textAlign: "right", marginBottom: 16 }}>
              <button onClick={() => {
                if (printSlip.__bulk) {
                  // Build a standalone print window with ALL slip data (no overflow truncation)
                  const slipsHtml = displayedEmps.map((emp, idx) => {
                    const empOutlet = outlets.find(o => o.id === emp.outletId);
                    const isLast = idx === displayedEmps.length - 1;
                    return `<div style="page-break-after:${isLast ? 'avoid' : 'always'};margin-bottom:32px;font-family:'Courier New',monospace;color:#000;background:#fff;">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #ddd;">
                        <div>
                          <div style="font-size:16px;font-weight:800;">${emp.name}</div>
                          <div style="font-size:11px;color:#555;">${emp.dept} — ${empOutlet?.name || "—"} — Hadir:${emp.hadir}h | Alpha:${emp.alpha || 0}× | Terlambat:${emp.lateDays}× | Lembur:${emp.totalOTKali}×</div>
                        </div>
                        <div style="background:#000;color:#fff;border-radius:8px;padding:10px 18px;text-align:right;">
                          <div style="font-size:9px;font-weight:600;letter-spacing:1;opacity:.7;color:#ccc;">GAJI BERSIH</div>
                          <div style="font-size:18px;font-weight:800;">${rp(emp.bersih)}</div>
                        </div>
                      </div>
                      <div style="display:flex;gap:8px;">
                        <div style="flex:1;border:1px solid #eee;border-radius:6px;padding:8px 10px;">
                          <div style="font-size:9px;color:#888;margin-bottom:4px;font-weight:700;">PENDAPATAN</div>
                          <div style="display:flex;justify-content:space-between;font-size:11px;"><span>Gaji Pokok (Prorate)</span><span style="font-weight:600;">${rp(emp.gajiPokok)}</span></div>
                          <div style="font-size:9px;color:#555;">Rp ${rp(emp.gaji)} ÷ 30 × ${emp.hadir + emp.lateDays} hari</div>
                          ${emp.totalOTKali > 0 ? `<div style="display:flex;justify-content:space-between;font-size:10px;margin-top:2px;"><span>+Lembur (${emp.totalOTKali}× × Rp${rp(emp.tarifOT)})</span><span>+${rp(emp.plusL)}</span></div>` : ""}
                          ${(emp.adjTambah && emp.adjTambah.length > 0) ? `<div style="margin-top:4px;">${emp.adjTambah.map(a => `<div style="display:flex;justify-content:space-between;font-size:9px;color:#555;"><span>• ${a.note || "Bonus"}</span><span>+${rp(a.amount)}</span></div>`).join("")}</div>` : ""}
                          <div style="display:flex;justify-content:space-between;font-weight:700;border-top:1px solid #ddd;padding-top:4px;margin-top:4px;font-size:11px;"><span>Total Pendapatan</span><span style="color:#006644;">${rp(emp.gajiPokok + emp.plusL + emp.tambah)}</span></div>
                        </div>
                        <div style="flex:1;border:1px solid #eee;border-radius:6px;padding:8px 10px;">
                          <div style="font-size:9px;color:#888;margin-bottom:4px;font-weight:700;">POTONGAN</div>
                          ${emp.potT > 0 ? `<div style="display:flex;justify-content:space-between;font-size:10px;"><span>-Terlambat (${emp.lateDays}×)</span><span style="color:#c00">-${rp(emp.potT)}</span></div>` : ""}
                          ${emp.potE > 0 ? `<div style="display:flex;justify-content:space-between;font-size:10px;margin-top:2px;"><span>-Pulang Cepat (${formatMins(emp.totalEarly)})</span><span style="color:#c00">-${rp(emp.potE)}</span></div>` : ""}
                          ${(emp.myKasbonList && emp.myKasbonList.length > 0) ? emp.myKasbonList.map(k => `<div style="display:flex;justify-content:space-between;font-size:9px;color:#555;"><span>• ${k.note || "Kasbon"} (${k.date})</span><span>-${rp(k.amount)}</span></div>`).join("") : ""}
                          ${emp.potong > 0 ? `<div style="display:flex;justify-content:space-between;font-size:10px;margin-top:2px;"><span>-Potongan Lain</span><span style="color:#c00">-${rp(emp.potong)}</span></div>` : ""}
                          <div style="display:flex;justify-content:space-between;font-weight:700;border-top:1px solid #ddd;padding-top:4px;margin-top:4px;font-size:11px;"><span>Total Potongan</span><span style="color:#c00">-${rp(emp.potT + emp.potE + emp.myK + emp.potong)}</span></div>
                        </div>
                      </div>
                      <div style="display:flex;justify-content:space-between;font-weight:800;font-size:13px;padding:8px 0;border-top:2px solid #000;margin-top:6px;"><span>GAJI BERSIH</span><span style="color:#006644;">${rp(emp.bersih)}</span></div>
                    </div>`;
                  }).join("");
                  const titleHtml = `<div style="text-align:center;margin-bottom:24px;border-bottom:3px solid #000;padding-bottom:16px;font-family:'Courier New',monospace;color:#000;background:#fff;">
                    <div style="font-size:22px;font-weight:900;letter-spacing:-1;margin-bottom:4px;">REKAPITULASI SLIP GAJI BULANAN</div>
                    <div style="font-size:13px;color:#555;">HR System — ${MONTHS[nd.getMonth()]} ${nd.getFullYear()}</div>
                    <div style="font-size:11px;color:#888;margin-top:4px;">${displayedEmps.length} karyawan — ${outlets.length} outlet</div>
                  </div>`;
                  const printWin = window.open("", "_blank", "width=800,height=600");
                  printWin.document.write(`<!DOCTYPE html><html><head><title>Slip Gaji ${mp}</title><style>
                    @page { size: A4; margin: 18mm; }
                    body { margin: 0; padding: 20mm; background: #fff; font-family: 'Courier New', monospace; color: #000; }
                    .slip-card { page-break-after: always; margin-bottom: 32px; }
                    .slip-card:last-child { page-break-after: avoid; }
                  </style></head><body>${titleHtml}${slipsHtml}</body></html>`);
                  printWin.document.close();
                  printWin.onload = () => { printWin.focus(); printWin.print(); };
                } else {
                  window.print();
                }
              }} style={{ background: "#000", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontFamily: "sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🖨 Cetak / Save PDF</button>
            </div>
            <div id="print-root" style={{ color: "#000", background: "#fff" }}>
              {printSlip.__bulk ? (
                /* BULK PRINT — all employees in one go */
                <>
                  <div style={{ textAlign: "center", marginBottom: 24, borderBottom: "3px solid #000", paddingBottom: 16, color: "#000" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1, marginBottom: 4, color: "#000" }}>REKAPITULASI SLIP GAJI BULANAN</div>
                    <div style={{ fontSize: 13, color: "#555" }}>HR System — {MONTHS[nd.getMonth()]} {nd.getFullYear()}</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{displayedEmps.length} karyawan — {outlets.length} outlet</div>
                  </div>
                  {displayedEmps.map((emp, idx) => {
                    const empOutlet = outlets.find(o => o.id === emp.outletId);
                    return (
                      <div key={emp.id} className="slip-card" style={{ pageBreakAfter: idx < displayedEmps.length - 1 ? "always" : "avoid", marginBottom: 32, color: "#000" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #ddd" }}>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "#000" }}>{emp.name}</div>
                            <div style={{ fontSize: 11, color: "#555" }}>{emp.dept} — {empOutlet?.name || "—"} — Hadir: {emp.hadir}h | Alpha: {emp.alpha || 0}× | Terlambat: {emp.lateDays}× | Lembur: {emp.totalOTKali}×</div>
                          </div>
                          <div style={{ background: "#000", color: "#fff", borderRadius: 8, padding: "10px 18px", textAlign: "right" }}>
                            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, opacity: 0.7, color: "#ccc" }}>GAJI BERSIH</div>
                            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>{rp(emp.bersih)}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 11 }}>
                          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                            {/* PENDAPATAN */}
                            <div style={{ flex: 1, border: "1px solid #eee", borderRadius: 6, padding: "8px 10px" }}>
                              <div style={{ fontSize: 9, color: "#888", marginBottom: 4, fontWeight: 700 }}>💰 PENDAPATAN</div>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                                <span>Gaji Pokok (Prorate)</span>
                                <span style={{ fontWeight: 600 }}>{rp(emp.gajiPokok)}</span>
                              </div>
                              <div style={{ fontSize: 9, color: "#555", marginBottom: 4 }}>Rp {rp(emp.gaji)} ÷ 30 × {emp.hadir + emp.lateDays} hari</div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                                <span>+Lembur ({emp.totalOTKali}× × Rp{rp(emp.tarifOT)})</span>
                                <span>+{rp(emp.plusL)}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, borderTop: "1px dotted #ccc", paddingTop: 2, marginTop: 2 }}>
                                <span>Subtotal Bonus</span>
                                <span style={{ color: "#006644", fontWeight: 700, fontSize: 15 }}>+ {rp(printSlip.tambah)}</span>
                                {/* <span>+{rp(emp.tambah)}</span> */}
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid #ddd", paddingTop: 4, marginTop: 4 }}>
                                <span>Total Pendapatan</span>
                                <span style={{ color: "#006644", fontWeight: 900 }}>{rp(emp.gajiPokok + emp.plusL + emp.tambah)}</span>
                              </div>
                            </div>
                            {/* POTONGAN */}
                            <div style={{ flex: 1, border: "1px solid #eee", borderRadius: 6, padding: "8px 10px" }}>
                              <div style={{ fontSize: 9, color: "#888", marginBottom: 4, fontWeight: 700 }}>➖ POTONGAN</div>
                              {emp.potT > 0 ? (
                                <div style={{ marginBottom: 4 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                                    <span>-Terlambat ({emp.lateDays}×)</span>
                                    <span style={{ color: "#c00" }}>-{rp(emp.potT)}</span>
                                  </div>
                                  <div style={{ fontSize: 9, color: "#555" }}>Rp 10.000 × {emp.lateDays} event</div>
                                </div>
                              ) : null}
                              {emp.potE > 0 ? (
                                <div style={{ marginBottom: 4 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                                    <span>-Pulang Cepat ({formatMins(emp.totalEarly)})</span>
                                    <span style={{ color: "#c00" }}>-{rp(emp.potE)}</span>
                                  </div>
                                  <div style={{ fontSize: 9, color: "#555" }}>Rp 500 × {emp.totalEarly} menit</div>
                                </div>
                              ) : null}
                              {emp.myKasbonList && emp.myKasbonList.length > 0 ? (
                                <div style={{ marginBottom: 4 }}>
                                  <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>-Kasbon Aktif</div>
                                  {emp.myKasbonList.map((k, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#555", paddingLeft: 6 }}>
                                      <span>• {k.note || "Kasbon"} ({k.date})</span>
                                      <span>-{rp(k.amount)}</span>
                                    </div>
                                  ))}
                                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px dotted #ccc", paddingTop: 2, marginTop: 2 }}>
                                    <span>Subtotal Kasbon</span>
                                    <span style={{ color: "#c00", fontSize: 15, fontWeight: 600 }}>-{rp(emp.myK)}</span>
                                  </div>
                                </div>
                              ) : emp.myK > 0 ? (
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                                  <span>-Kasbon</span><span style={{ color: "#c00" }}>-{rp(emp.myK)}</span>
                                </div>
                              ) : null}
                              {emp.adjPotong && emp.adjPotong.length > 0 ? (
                                <div style={{ marginBottom: 4 }}>
                                  <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>-Potongan Lain</div>
                                  {emp.adjPotong.map((a, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#555", paddingLeft: 6 }}>
                                      <span>• {a.note || "Potongan"}</span>
                                      <span>-{rp(a.amount)}</span>
                                    </div>
                                  ))}
                                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px dotted #ccc", paddingTop: 2, marginTop: 2 }}>
                                    <span>Subtotal Potongan</span>
                                    <span style={{ color: "#c00", fontSize: 15, fontWeight: 600 }}>-{rp(emp.potong)}</span>
                                  </div>
                                </div>
                              ) : emp.potong > 0 ? (
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                                  <span>-Potongan</span><span style={{ color: "#c00" }}>-{rp(emp.potong)}</span>
                                </div>
                              ) : null}
                              {(emp.potT + emp.potE + emp.myK + emp.potong) === 0 && <div style={{ color: "#555", fontSize: 10 }}>Tidak ada potongan</div>}
                              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid #ddd", paddingTop: 4, marginTop: 4 }}>
                                <span>Total Potongan</span>
                                <span style={{ color: "#c00" }}>-{rp(emp.potT + emp.potE + emp.myK + emp.potong)}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 13, padding: "8px 0", borderTop: "2px solid #000" }}>
                            <span>GAJI BERSIH</span>
                            <span style={{ color: "#006644" }}>{rp(emp.bersih)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                /* SINGLE EMPLOYEE SLIP */
                <>
                  <div style={{ textAlign: "center", marginBottom: 24, borderBottom: "3px solid #000", paddingBottom: 16, color: "#000" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1, marginBottom: 4, color: "#000" }}>SLIP GAJI KARYAWAN</div>
                    <div style={{ fontSize: 12, color: "#555" }}>HR System — {MONTHS[nd.getMonth()]} {nd.getFullYear()}</div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Nama</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#000" }}>{printSlip.name}</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Dept / Outlet</div>
                      <div style={{ fontSize: 13, color: "#000" }}>{printSlip.dept} — {outlets.find(o => o.id === printSlip.outletId)?.name || "—"}</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8 }}>
                      <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Tanggal</div>
                      <div style={{ fontSize: 13, color: "#000" }}>{todayStr()}</div>
                    </div>
                  </div>

                  {/* Kehadiran summary */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20, padding: "12px 14px", background: "#f5f5f5", borderRadius: 8 }}>
                    {[["Hadir", printSlip.hadir + " hari", "#006644"], ["Alpha / Alpa", (printSlip.alpha || 0) + "×", "#c00"], ["Terlambat", printSlip.lateDays + "×", "#d97706"], ["Lembur", printSlip.totalOTKali + "×", "#7c3aed"]].map(([l, v, c]) => (
                      <div key={l} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* PENDAPATAN */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#006644", marginBottom: 8, borderTop: "2px solid #000", paddingTop: 10 }}>💰 PENDAPATAN</div>

                    {/* Gaji Pokok prorate */}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #eee" }}>
                      <div>
                        <div>Gaji Pokok (Prorate)</div>
                        <div style={{ fontSize: 10, color: "#666" }}>Rp {rp(printSlip.gaji)} ÷ 30 × {printSlip.hadir + printSlip.lateDays} hari</div>
                      </div>
                      <span style={{ color: "#006644", fontWeight: 700 }}>{rp(printSlip.gajiPokok)}</span>
                    </div>

                    {/* Lembur sub-items */}
                    {printSlip.totalOTKali > 0 && (
                      <div style={{ padding: "7px 0", borderBottom: "1px solid #eee" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>+Lembur ({printSlip.totalOTKali}× × Rp{rp(printSlip.tarifOT)}/kali)</span>
                          <span style={{ color: "#555", fontWeight: 600, fontSize: 15 }}>+ {rp(printSlip.plusL)}</span>
                        </div>
                        <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>Subtotal Lembur</div>
                      </div>
                    )}

                    {/* Bonus / Tambahan sub-items */}
                    {printSlip.adjTambah && printSlip.adjTambah.length > 0 ? (
                      <div style={{ padding: "7px 0", borderBottom: "1px solid #eee" }}>
                        <div style={{ marginBottom: 4, fontWeight: 600 }}>+Bonus / Tambahan</div>
                        {printSlip.adjTambah.map((a, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 11, color: "#555" }}>
                            <span>{a.note || "Bonus"}</span>
                            <span>+ {rp(a.amount)}</span>
                          </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, fontWeight: 700, borderTop: "1px dotted #ccc", marginTop: 4 }}>
                          <span>Subtotal Bonus</span>
                          <span style={{ color: "#006644", fontWeight: 700, fontSize: 15 }}>+ {rp(printSlip.tambah)}</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #eee" }}>
                        <span>+Bonus / Tambahan</span><span style={{ color: "#555" }}>—</span>
                      </div>
                    )}

                    {/* Total Pendapatan */}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", fontWeight: 800, borderBottom: "2px solid #000" }}>
                      <span>Total Pendapatan</span>
                      <span style={{ fontWeight: 900 }}> {rp(printSlip.gajiPokok + printSlip.plusL + printSlip.tambah)}</span>
                    </div>
                  </div>

                  {/* POTONGAN */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#c00", marginBottom: 8 }}>➖ POTONGAN</div>

                    {/* Terlambat */}
                    {printSlip.lateDays > 0 ? (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #eee" }}>
                        <div>
                          <div>-Terlambat ({printSlip.lateDays}×)</div>
                          <div style={{ fontSize: 10, color: "#aaa" }}>Rp 10.000 × {printSlip.lateDays} event</div>
                        </div>
                        <span style={{ color: "#c00", fontWeight: 600 }}>- {rp(printSlip.potT)}</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #eee" }}>
                        <span>-Terlambat</span><span style={{ color: "#aaa" }}>—</span>
                      </div>
                    )}

                    {/* Pulang Cepat */}
                    {printSlip.totalEarly > 0 ? (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #eee" }}>
                        <div>
                          <div>-Pulang Cepat ({formatMins(printSlip.totalEarly)})</div>
                          <div style={{ fontSize: 10, color: "#aaa" }}>Rp 500 × {printSlip.totalEarly} menit</div>
                        </div>
                        <span style={{ color: "#c00", fontWeight: 600 }}>- {rp(printSlip.potE)}</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #eee" }}>
                        <span>-Pulang Cepat</span><span style={{ color: "#aaa" }}>—</span>
                      </div>
                    )}

                    {/* Kasbon sub-items */}
                    {printSlip.myKasbonList && printSlip.myKasbonList.length > 0 ? (
                      <div style={{ padding: "7px 0", borderBottom: "1px solid #eee" }}>
                        <div style={{ marginBottom: 4, fontWeight: 600 }}>-Kasbon Aktif</div>
                        {printSlip.myKasbonList.map((k, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 11, color: "#555" }}>
                            <span>{k.note || "Kasbon"} (tgl {k.date})</span>
                            <span>- {rp(k.amount)}</span>
                          </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 10, fontWeight: 700, borderTop: "1px dotted #ccc", marginTop: 4 }}>
                          <span>Subtotal Kasbon</span>
                          <span style={{ color: "#c00", fontSize: 15, fontWeight: 600 }}>- {rp(printSlip.myK)}</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #eee" }}>
                        <span>-Kasbon Aktif</span><span style={{ color: "#aaa" }}>—</span>
                      </div>
                    )}

                    {/* Potongan Lain sub-items */}
                    {printSlip.adjPotong && printSlip.adjPotong.length > 0 ? (
                      <div style={{ padding: "7px 0", borderBottom: "1px solid #eee" }}>
                        <div style={{ marginBottom: 4, fontWeight: 600 }}>-Potongan Lain</div>
                        {printSlip.adjPotong.map((a, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 11, color: "#555" }}>
                            <span>{a.note || "Potongan"}</span>
                            <span>- {rp(a.amount)}</span>
                          </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 10, fontWeight: 700, borderTop: "1px dotted #ccc", marginTop: 4 }}>
                          <span>Subtotal Potongan Lain</span>
                          <span style={{ color: "#c00", fontSize: 15, fontWeight: 600 }}>- {rp(printSlip.potong)}</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #eee" }}>
                        <span>-Potongan Lain</span><span style={{ color: "#aaa" }}>—</span>
                      </div>
                    )}

                    {/* Total Potongan */}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", fontWeight: 800, borderBottom: "2px solid #c00", color: "#c00" }}>
                      <span>Total Potongan</span>
                      <span>- {rp(printSlip.potT + printSlip.potE + printSlip.myK + printSlip.potong)}</span>
                    </div>
                  </div>

                  <div style={{ background: "#000", color: "#fff", borderRadius: 10, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#fff" }}>GAJI BERSIH</div>
                    <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1, color: "#fff" }}>{rp(printSlip.bersih)}</div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, fontSize: 11 }}>
                    <div style={{ textAlign: "center" }}><div style={{ height: 4, borderTop: "1px solid #000", width: 120, margin: "0 auto 4px" }} /><div>Karyawan</div></div>
                    <div style={{ textAlign: "center" }}><div style={{ height: 4, borderTop: "1px solid #000", width: 120, margin: "0 auto 4px" }} /><div>Manager</div></div>
                    <div style={{ textAlign: "center" }}><div style={{ height: 4, borderTop: "1px solid #000", width: 120, margin: "0 auto 4px" }} /><div>HR / Admin</div></div>
                  </div>
                </>
              )}</div>
            <div style={{ display: "flex", gap: 10, marginTop: 28, justifyContent: "flex-end", borderTop: "1px solid #ddd", paddingTop: 20 }}>
              <SBtn variant="secondary" onClick={() => setPrintSlip(null)}>Tutup</SBtn>
              <SBtn variant="primary" onClick={() => { window.print(); }}>🖨 Cetak Sekarang</SBtn>
            </div>
          </div>
        </div>
      )
      }

      {/* PRINT OUTLET — Summary */}
      {
        printOutlet && (
          <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setPrintOutlet(null)}>
            <div className="hr-print-panel" style={{ background: "#fff", borderRadius: 12, padding: "40px 36px", width: 720, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 80px #000" }} onClick={e => e.stopPropagation()}>
              <style>{`
              @media print {
                body * { visibility: hidden; }
                #print-outlet-root, #print-outlet-root * { visibility: visible; }
                #print-outlet-root { position: absolute; left: 0; top: 0; width: 100%; max-height: 100vh; overflow: visible; }
                #print-outlet-root button, #print-outlet-root .no-print { display: none !important; }
              }
            `}</style>
              <div id="print-outlet-root" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                <div style={{ textAlign: "center", marginBottom: 24, borderBottom: "2px solid #000", paddingBottom: 16 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1, marginBottom: 4, color: "#000" }}>REKAP PAYROLL PER OUTLET</div>
                  <div style={{ fontSize: 14, color: "#555" }}>HR System — {MONTHS[nd.getMonth()]} {nd.getFullYear()}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#000", marginTop: 6 }}>{printOutlet.outlet.name}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{printOutlet.employees.length} karyawan</div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#f0f0f0" }}>
                      <th style={{ padding: "8px 10px", textAlign: "left", borderBottom: "2px solid #000", fontWeight: 700, color: "#000" }}>Nama</th>
                      <th style={{ padding: "8px 10px", textAlign: "left", borderBottom: "2px solid #000", fontWeight: 700, color: "#000" }}>Dept</th>
                      <th style={{ padding: "8px 10px", textAlign: "right", borderBottom: "2px solid #000", fontWeight: 700, color: "#000" }}>Gaji Pokok</th>
                      <th style={{ padding: "8px 10px", textAlign: "right", borderBottom: "2px solid #000", fontWeight: 700, color: "#000" }}>+Lembur</th>
                      <th style={{ padding: "8px 10px", textAlign: "right", borderBottom: "2px solid #000", fontWeight: 700, color: "#000" }}>+Tambah</th>
                      <th style={{ padding: "8px 10px", textAlign: "right", borderBottom: "2px solid #000", fontWeight: 700, color: "#000" }}>-Potong</th>
                      <th style={{ padding: "8px 10px", textAlign: "right", borderBottom: "2px solid #000", fontWeight: 700, color: "#000" }}>= Bersih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printOutlet.employees.map((emp, i) => (
                      <tr key={emp.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                        <td style={{ padding: "7px 10px", borderBottom: "1px solid #eee", color: "#000" }}>{emp.name}</td>
                        <td style={{ padding: "7px 10px", borderBottom: "1px solid #eee", color: "#000" }}>{emp.dept}</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", borderBottom: "1px solid #eee", color: "#000" }}>{rp(emp.gaji)}</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", borderBottom: "1px solid #eee", color: "#000" }}>{emp.plusL > 0 ? "+" + rp(emp.plusL) : "—"}</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", borderBottom: "1px solid #eee", color: "#000" }}>{emp.tambah > 0 ? "+" + rp(emp.tambah) : "—"}</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", borderBottom: "1px solid #eee", color: "#c00" }}>- {rp(emp.potT + emp.potE + emp.myK + emp.potong)}</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", borderBottom: "1px solid #eee", fontWeight: 700, color: "#000" }}>{rp(emp.bersih)}</td>
                      </tr>
                    ))}
                    <tr style={{ background: "#000" }}>
                      <td colSpan={2} style={{ padding: "10px 12px", fontWeight: 800, color: "#fff" }}>TOTAL</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 800, color: "#fff" }}>{rp(printOutlet.employees.reduce((s, e) => s + e.gaji, 0))}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 800, color: "#fff" }}>{rp(printOutlet.employees.reduce((s, e) => s + e.plusL, 0))}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 800, color: "#fff" }}>{rp(printOutlet.employees.reduce((s, e) => s + e.tambah, 0))}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 800, color: "#fff" }}>- {rp(printOutlet.employees.reduce((s, e) => s + e.potT + e.potE + e.myK + e.potong, 0))}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 800, fontSize: 14, color: "#fff" }}>{rp(printOutlet.grand)}</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, fontSize: 11, color: "#000" }}>
                  <div style={{ textAlign: "center" }}><div style={{ height: 4, borderTop: "1px solid #000", width: 120, margin: "0 auto 4px" }} /><div>Manager Outlet</div></div>
                  <div style={{ textAlign: "center" }}><div style={{ height: 4, borderTop: "1px solid #000", width: 120, margin: "0 auto 4px" }} /><div>HR / Admin</div></div>
                  <div style={{ textAlign: "center" }}><div style={{ height: 4, borderTop: "1px solid #000", width: 120, margin: "0 auto 4px" }} /><div>Finance</div></div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
                <SBtn variant="secondary" onClick={() => setPrintOutlet(null)}>Tutup</SBtn>
                <SBtn variant="primary" onClick={() => { window.print(); }}>🖨 Cetak Sekarang</SBtn>
              </div>
            </div>
          </div>
        )
      }

      {
        adjustments.filter(a => displayedEmps.some(e => e.id === a.empId)).length > 0 && (
          <Card style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontFamily: T.fM, letterSpacing: 1.5, color: T.t2 }}>LOG PENYESUAIAN MANUAL</div>
              <div style={{ fontSize: 11, color: T.t2 }}>Bulan aktif: <b style={{ color: T.t0 }}>{mp}</b></div>
            </div>
            <table className="hr-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Tanggal</Th><Th>Karyawan</Th><Th>Tipe</Th><Th right>Jumlah</Th><Th>Keterangan</Th><Th>Status</Th><Th>Aksi</Th></tr></thead>
              <tbody>
                {adjustments.filter(a => displayedEmps.some(e => e.id === a.empId)).map(a => {
                  const emp = employees.find(e => e.id === a.empId);
                  const isApplied = !!a.appliedToPayrollId;
                  const sameMonth = a.date && a.date.startsWith(mp);
                  return (
                    <tr key={a.id} style={{ opacity: isApplied ? 0.55 : 1 }}>
                      <Td mono>{a.date}</Td>
                      <Td>{emp?.name}</Td>
                      <Td><Pill color={a.type === "tambah" ? "#006644" : "#c00"} bg={a.type === "tambah" ? "#002218" : "#280808"}>{a.type === "tambah" ? "Tambahan" : "Potongan"}</Pill></Td>
                      <Td right bold color={a.type === "tambah" ? "#006644" : "#c00"}>{a.type === "tambah" ? "+" : "-"}{rp(a.amount)}</Td>
                      <Td>{a.note}</Td>
                      <Td>
                        {isApplied ? (
                          <Pill color={T.t2} bg={T.bg3}>🔒 Sudah dipotong di payroll</Pill>
                        ) : sameMonth ? (
                          <Pill color={T.em} bg="#002218">Draft</Pill>
                        ) : (
                          <Pill color={T.t2} bg={T.bg3}>Bulan lain</Pill>
                        )}
                      </Td>
                      <Td>
                        <div style={{ display: "flex", gap: 4 }}>
                          {isApplied && sameMonth && (
                            <button onClick={() => unapplyAdj(a)} title="Buat ulang payroll tanpa adjustment ini" style={{ padding: "4px 8px", fontSize: 11, background: "transparent", color: T.amber, border: `1px solid ${T.amber}`, borderRadius: 4, cursor: "pointer" }}>↺ Unapply</button>
                          )}
                          <button onClick={() => delAdj(a)} title="Hapus" style={{ padding: "4px 8px", fontSize: 11, background: "transparent", color: T.red, border: `1px solid ${T.red}`, borderRadius: 4, cursor: "pointer" }}>🗑</button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )
      }

      <Modal open={!!showAdj} onClose={() => setShowAdj(null)} title="Penyesuaian Gaji Manual" width={440}>
        <div style={{ background: T.bg3, borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: T.t1 }}>Karyawan: <b style={{ color: T.t0 }}>{employees.find(e => e.id === showAdj)?.name}</b></div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[{ t: "tambah", l: "+ Tambahan", c: T.em }, { t: "potong", l: "− Potongan", c: T.red }].map(({ t, l, c }) => (
            <button key={t} onClick={() => setAdjForm(p => ({ ...p, type: t }))} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${adjForm.type === t ? c : T.line}`, background: adjForm.type === t ? c + "22" : T.bg3, color: adjForm.type === t ? c : T.t2, cursor: "pointer", fontFamily: T.fS, fontWeight: 600, fontSize: 13 }}>{l}</button>
          ))}
        </div>
        <FInput label="Jumlah (Rp)" type="number" value={adjForm.amount} onChange={v => setAdjForm(p => ({ ...p, amount: v }))} placeholder="50000" />
        <FInput label="Keterangan" value={adjForm.note} onChange={v => setAdjForm(p => ({ ...p, note: v }))} placeholder="Pecah gelas / Apresiasi terbaik..." />
        <div style={{ display: "flex", gap: 10 }}>
          <SBtn onClick={saveAdj} style={{ flex: 1, justifyContent: "center" }}>Simpan</SBtn>
          <SBtn variant="secondary" onClick={() => setShowAdj(null)} style={{ flex: 1, justifyContent: "center" }}>Batal</SBtn>
        </div>
      </Modal>

      <Modal open={showTarifModal} onClose={() => setShowTarifModal(false)} title="⚙️ Pengaturan Tarif Lembur" width={420}>
        <div style={{ fontSize: 12, color: T.t2, marginBottom: 16, lineHeight: 1.6 }}>
          Atur tarif lembur per kali (×) untuk setiap departemen. Nilai disimpan selama sesi ini dan bisa diedit kapan saja.
        </div>
        {DEPT_LIST.map(dept => (
          <div key={dept} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 10, marginBottom: 12, alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: DEPT_COLOR[dept] || T.t0 }}>{dept}</div>
            <FInput label={false} type="number" value={tarifLembur[dept]} onChange={v => setTarifLembur(p => ({ ...p, [dept]: parseInt(v) || 0 }))} placeholder="25000" />
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <SBtn onClick={() => setShowTarifModal(false)} style={{ flex: 1, justifyContent: "center" }}>Simpan & Tutup</SBtn>
        </div>
      </Modal>
    </div >
  );
}
