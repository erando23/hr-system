"use client";
import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════
   SHARED THEME TOKENS (must match HRApp.js)
══════════════════════════════════════════════ */
const T = {
  bg: "#07090F", bg1: "#0C1018", bg2: "#111826", bg3: "#172030",
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

/* ══════════════════════════════════════════════
   UTILITIES
═════════════════════════���════════════════════ */
const rp = n => "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(Math.abs(n || 0)));

/* ══════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════ */
function Avatar({ name, color = T.em, bg = T.emD, size = 48 }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, border: `2px solid ${color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.28, fontFamily: T.fM, fontWeight: 700, color,
      flexShrink: 0,
    }}>{initials}</div>
  );
}

/* ══════════════════════════════════════════════
   PIN INPUT — 6 separate boxes
══════════════════════════════════════════════ */
function PinInput({ value, onChange, error, loading }) {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs[i - 1].current?.focus();
    }
    if (e.key === "Enter") onChange("ENTER");
  };

  const handleChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const next = value.slice(0, i) + v.slice(-1) + value.slice(i + 1);
    onChange(next);
    if (v && i < 5) refs[i + 1].current?.focus();
  };

  return (
    <div className="hr-pin-input" style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={refs[i]}
          type="password"
          maxLength={1}
          value={value[i] || ""}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          disabled={loading}
          autoFocus={i === 0}
          style={{
            width: 44, height: 54,
            textAlign: "center",
            fontFamily: T.fM,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 0,
            background: T.bg3,
            border: `2px solid ${error ? T.red : value[i] ? T.em : T.lineL}`,
            borderRadius: 10,
            color: value[i] ? T.t0 : T.t2,
            outline: "none",
            transition: "border-color 0.2s, background 0.2s",
            cursor: loading ? "not-allowed" : "text",
            opacity: loading ? 0.5 : 1,
            caretColor: T.em,
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   EMPLOYEE SELECT
══════════════════════════════════════════════ */
function EmployeeSelect({ employees, selected, onSelect }) {
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.dept.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = { karyawan: T.em, manager: T.amber };
  const roleBg = { karyawan: T.emD, manager: T.amberD };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama atau departemen..."
          autoFocus
          style={{
            width: "100%", boxSizing: "border-box",
            background: T.bg3, border: `1px solid ${T.lineL}`,
            borderRadius: 8, padding: "10px 13px",
            color: T.t0, fontFamily: T.fS, fontSize: 13, outline: "none",
          }}
        />
      </div>
      <div className="hr-emp-list" style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: T.t2, fontSize: 13, padding: "20px 0" }}>
            Tidak ada karyawan ditemukan
          </div>
        )}
        {filtered.map(emp => {
          const isSelected = selected?.id === emp.id;
          const rc = roleColor[emp.role] || T.em;
          return (
            <button
              key={emp.id}
              onClick={() => onSelect(emp)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                width: "100%", padding: "10px 12px",
                background: isSelected ? `${rc}22` : T.bg3,
                border: `1px solid ${isSelected ? rc + "66" : T.line}`,
                borderRadius: 10, cursor: "pointer", textAlign: "left",
                transition: "all .15s",
              }}
            >
              <Avatar name={emp.name} color={rc} bg={rc + "22"} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontFamily: T.fS, fontWeight: 600, color: T.t0 }}>
                  {emp.name}
                </div>
                <div style={{ fontSize: 10, fontFamily: T.fM, color: T.t2 }}>
                  {emp.dept}
                </div>
              </div>
              <div style={{
                padding: "2px 8px", borderRadius: 20,
                background: rc + "22", color: rc,
                fontSize: 9, fontFamily: T.fM, fontWeight: 700,
              }}>
                {emp.role === "karyawan" ? "KARYAWAN" : "MANAGER"}
              </div>
              {isSelected && (
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.em }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SUCCESS ANIMATION
══════════════════════════════════════════════ */
function SuccessView({ user, loginData, onComplete }) {
  const [progress, setProgress] = useState(0);

  const roleColor = { superadmin: T.purple, manager: T.amber, karyawan: T.em };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => p >= 100 ? 100 : p + 4);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      onComplete(loginData);
    }
  }, [progress, onComplete, loginData]);

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 24px" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: `${roleColor[user.role] || T.em}22`,
          border: `3px solid ${roleColor[user.role] || T.em}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Avatar name={user.name} color={roleColor[user.role]} bg={`${roleColor[user.role]}33`} size={48} />
        </div>
        <div style={{
          position: "absolute", bottom: -4, right: -4,
          width: 28, height: 28, borderRadius: "50%",
          background: T.em, border: `3px solid ${T.bg2}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
        }}>✓</div>
      </div>

      <div style={{ fontFamily: T.fS, fontWeight: 700, fontSize: 18, color: T.t0, marginBottom: 4 }}>
        Selamat datang, {user.name.split(" ")[0]}!
      </div>
      <div style={{ fontFamily: T.fS, fontSize: 13, color: T.t2, marginBottom: 24 }}>
        {user.dept} · {user.role}
      </div>

      <div style={{ background: T.bg3, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ height: 4, background: T.line }}>
          <div style={{
            height: "100%", background: T.em, width: `${progress}%`,
            transition: "width 0.05s linear",
          }} />
        </div>
      </div>

      <div style={{ fontFamily: T.fS, fontSize: 12, color: T.t2 }}>
        Memuat dashboard...
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN LOGINSCREEN
══════════════════════════════════════════════ */
export default function LoginScreen({ onLogin }) {
  const [step, setStep] = useState("select"); // "select" | "pin" | "success"
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loadingEmps, setLoadingEmps] = useState(true);
  const shakeRef = useRef(null);

  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION_MS = 5 * 60 * 1000;

  // Load employees list
  useEffect(() => {
    fetch("/api/employees/list")
      .then(r => r.json())
      .then(json => {
        if (json.success) setEmployees(json.data);
      })
      .catch(() => {})
      .finally(() => setLoadingEmps(false));
  }, []);

  // Check lock status
  useEffect(() => {
    const stored = localStorage.getItem("hr_login_lock");
    if (stored) {
      try {
        const { until } = JSON.parse(stored);
        if (Date.now() < until) {
          setLockedUntil(until);
          setTimeout(() => {
            setLockedUntil(null);
            localStorage.removeItem("hr_login_lock");
            setAttempts(0);
          }, until - Date.now());
        } else {
          localStorage.removeItem("hr_login_lock");
        }
      } catch {}
    }
  }, []);

  const doLogin = async () => {
    if (lockedUntil) return;
    if (pin.length !== 6) {
      setErr("PIN harus 6 digit");
      shakeInput();
      return;
    }

    setLoading(true);
    setErr("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedEmployee.id, pin: pin.trim() }),
      });

      const json = await res.json();

      if (!json.success) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCK_DURATION_MS;
          setLockedUntil(until);
          localStorage.setItem("hr_login_lock", JSON.stringify({ until }));
          setTimeout(() => {
            setLockedUntil(null);
            localStorage.removeItem("hr_login_lock");
            setAttempts(0);
          }, LOCK_DURATION_MS);
          setErr(`Terlalu banyak percobaan. Coba lagi dalam 5 menit.`);
        } else {
          const remaining = MAX_ATTEMPTS - newAttempts;
          setErr(`${json.error || "Login gagal"} — ${remaining} percobaan tersisa`);
        }

        shakeInput();
        setLoading(false);
        setPin("");
        return;
      }

      localStorage.removeItem("hr_login_lock");
      setAttempts(0);
      setLoginData({
        user: json.data.user,
        outlets: json.data.outlets,
        employees: json.data.employees,
        schedules: json.data.schedules,
        kasbon: json.data.kasbon,
        attendances: json.data.attendances,
      });
      setUser(json.data.user);
      setStep("success");

    } catch {
      setErr("Koneksi gagal. Periksa jaringan Anda.");
      shakeInput();
    } finally {
      setLoading(false);
    }
  };

  const shakeInput = () => {
    if (shakeRef.current) {
      shakeRef.current.classList.remove("shake");
      void shakeRef.current.offsetWidth;
      shakeRef.current.classList.add("shake");
    }
  };

  const handlePinChange = (val) => {
    if (val === "ENTER") { doLogin(); return; }
    if (val.length <= 6) setPin(val);
  };

  // Lock countdown
  const [lockCountdown, setLockCountdown] = useState("");
  useEffect(() => {
    if (!lockedUntil) return;
    const tick = () => {
      const left = Math.max(0, lockedUntil - Date.now());
      const mins = Math.floor(left / 60000);
      const secs = Math.floor((left % 60000) / 1000);
      setLockCountdown(`${mins}:${String(secs).padStart(2, "0")}`);
      if (left <= 0) setLockCountdown("");
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  if (step === "success" && user) return (
    <div className="hr-page-bg" style={{
      minHeight: "100vh", background: T.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: T.fS, padding: 20,
    }}>
      <div className="hr-success-card" style={{
        background: T.bg1, border: `1px solid ${T.line}`,
        borderRadius: 24, padding: "48px 40px", width: 400, maxWidth: "100%",
      }}>
        <SuccessView user={user} loginData={loginData} onComplete={(data) => {
          if (data) onLogin(data.user, data.outlets, data.employees, data.schedules, data.kasbon, data.attendances);
        }} />
      </div>
    </div>
  );

  const isLocked = !!lockedUntil;

  const roleColor = { superadmin: T.purple, manager: T.amber, karyawan: T.em };

  return (
    <div className="hr-page-bg" style={{
      minHeight: "100vh", background: `radial-gradient(ellipse at 50% 0%, #0A1C2E 0%, ${T.bg} 70%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: T.fS, padding: 20, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${T.em}08 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -150, right: -150, width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${T.em}05 0%, transparent 70%)`, pointerEvents: "none" }} />

      <div className="hr-login-card" style={{
        background: T.bg1, border: `1px solid ${T.line}`,
        borderRadius: 28, padding: "44px 40px", width: 480, maxWidth: "100%",
        position: "relative", zIndex: 1,
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
          .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
          @keyframes shake { 10%,90% { transform: translateX(-2px); } 20%,80% { transform: translateX(4px); } 30%,50%,70% { transform: translateX(-6px); } 40%,60% { transform: translateX(6px); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInDelay { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          .fade-in { animation: fadeIn 0.5s ease-out both; }
          .fade-in-d1 { animation: fadeInDelay 0.5s ease-out 0.1s both; }
          .fade-in-d2 { animation: fadeInDelay 0.5s ease-out 0.2s both; }
          .fade-in-d3 { animation: fadeInDelay 0.5s ease-out 0.3s both; }
          .loading-spin { animation: spin 1s linear infinite; }
          .float { animation: float 3s ease-in-out infinite; }
          @media (max-width: 520px) {
            .hr-login-card { width: 100% !important; max-width: 100% !important; border-radius: 18px !important; padding: 28px 18px !important; }
            .hr-pin-input { gap: 5px !important; }
            .hr-pin-input input { width: 36px !important; height: 46px !important; font-size: 18px !important; border-radius: 8px !important; }
            .hr-emp-list { max-height: 220px !important; }
            .hr-success-card { width: 100% !important; max-width: 100% !important; padding: 36px 22px !important; }
            .hr-page-bg { padding: 14px !important; align-items: flex-start !important; padding-top: 36px !important; }
          }
          @media (max-width: 360px) {
            .hr-pin-input { gap: 3px !important; }
            .hr-pin-input input { width: 30px !important; height: 42px !important; font-size: 16px !important; }
            .hr-login-card { padding: 22px 12px !important; }
          }
        `}</style>

        {/* Header */}
        <div className="fade-in" style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div className="float" style={{
              width: 64, height: 64, borderRadius: 18,
              background: `linear-gradient(135deg, ${T.emD}, ${T.bg3})`,
              border: `2px solid ${T.em}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30,
              boxShadow: `0 8px 32px ${T.em}22`,
            }}>⬡</div>
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: T.t0, letterSpacing: -1 }}>
            HR<span style={{ color: T.em }}>System</span>
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: T.t2 }}>
            Sistem Manajemen SDM Terpadu
          </p>
        </div>

        <div className="fade-in-d1" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: T.line }} />
          <div style={{ fontSize: 10, fontFamily: T.fM, letterSpacing: 2, color: T.t2 }}>
            {step === "select" ? "PILIH KARYAWAN" : "MASUKKAN PIN"}
          </div>
          <div style={{ flex: 1, height: 1, background: T.line }} />
        </div>

        {/* Step 1: Select Employee */}
        {step === "select" && (
          <div className="fade-in-d2">
            {loadingEmps ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div className="loading-spin" style={{ width: 24, height: 24, border: `2px solid ${T.line}`, borderTopColor: T.em, borderRadius: "50%", margin: "0 auto 12px" }} />
                <div style={{ fontSize: 13, color: T.t2 }}>Memuat daftar karyawan...</div>
              </div>
            ) : (
              <EmployeeSelect
                employees={employees}
                selected={selectedEmployee}
                onSelect={(emp) => {
                  setSelectedEmployee(emp);
                  setStep("pin");
                  setPin("");
                  setErr("");
                }}
              />
            )}
          </div>
        )}

        {/* Step 2: Enter PIN */}
        {step === "pin" && (
          <div className="fade-in-d2">
            {/* Selected employee card */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              background: `${T.em}11`, border: `1px solid ${T.em}33`,
              borderRadius: 12, padding: "12px 14px",
              marginBottom: 20,
            }}>
              <Avatar name={selectedEmployee.name} color={T.em} bg={T.emD} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontFamily: T.fS, fontWeight: 600, color: T.t0 }}>
                  {selectedEmployee.name}
                </div>
                <div style={{ fontSize: 11, fontFamily: T.fM, color: T.t2 }}>
                  {selectedEmployee.dept}
                </div>
              </div>
              <button
                onClick={() => { setStep("select"); setSelectedEmployee(null); setPin(""); }}
                style={{
                  background: "transparent", border: "none",
                  color: T.t2, cursor: "pointer", fontSize: 11,
                  fontFamily: T.fS, textDecoration: "underline",
                }}
              >
                Ganti
              </button>
            </div>

            {/* Lock screen */}
            {isLocked && (
              <div style={{
                background: `${T.red}15`, border: `1px solid ${T.red}44`,
                borderRadius: 14, padding: "20px 24px", textAlign: "center",
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.red, marginBottom: 4 }}>Akun Terkunci</div>
                <div style={{ fontFamily: T.fM, fontSize: 22, color: T.red, fontWeight: 700, letterSpacing: 2 }}>
                  {lockCountdown}
                </div>
                <div style={{ fontSize: 12, color: T.t2, marginTop: 6 }}>
                  Terlalu banyak percobaan login gagal
                </div>
              </div>
            )}

            {/* PIN Input */}
            {!isLocked && (
              <div ref={shakeRef}>
                <div style={{ marginBottom: 8, fontSize: 12, color: T.t2, textAlign: "center" }}>
                  Masukkan PIN 6 digit Anda
                </div>
                <PinInput
                  value={pin}
                  onChange={handlePinChange}
                  error={!!err}
                  loading={loading}
                />
                {err && (
                  <div style={{
                    marginTop: 12, fontSize: 12, color: T.red,
                    textAlign: "center", fontFamily: T.fS, fontWeight: 500,
                  }}>
                    {err}
                  </div>
                )}
              </div>
            )}

            {/* Submit */}
            {!isLocked && (
              <div style={{ marginTop: 20 }}>
                <button
                  onClick={doLogin}
                  disabled={loading || pin.length !== 6}
                  style={{
                    width: "100%", padding: "15px",
                    background: pin.length === 6 && !loading ? T.em : T.bg3,
                    color: pin.length === 6 && !loading ? "#001810" : T.t2,
                    border: "none", borderRadius: 14,
                    fontFamily: T.fS, fontWeight: 700, fontSize: 15,
                    cursor: pin.length === 6 && !loading ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    opacity: loading ? 0.7 : 1,
                    boxShadow: pin.length === 6 ? `0 4px 20px ${T.em}44` : "none",
                  }}
                >
                  {loading ? (
                    <>
                      <div className="loading-spin" style={{ width: 18, height: 18, border: `2px solid ${T.em}44`, borderTopColor: T.em, borderRadius: "50%" }} />
                      Memvalidasi...
                    </>
                  ) : "Masuk →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <div style={{ fontSize: 9, fontFamily: T.fM, letterSpacing: 1.5, color: T.t2 + "66" }}>
            HRSystem v4.0 · Data tersimpan di server
          </div>
        </div>
      </div>
    </div>
  );
}