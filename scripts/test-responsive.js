const { chromium } = require("playwright");

const VIEWPORTS = [
  { name: "iphone-se", width: 375, height: 667 },
  { name: "iphone-14", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const PINS = {
  karyawan: "100001",
  manager: "200001",
  superadmin: "300001",
};

async function loginAs(page, pin) {
  await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(async (pin) => {
    const list = await fetch("/api/employees/list").then((r) => r.json());
    const employees = list?.data?.employees || list?.employees || [];
    const candidates = [
      pin,
      pin.replace(/^0+/, ""),
      String(Number(pin)),
    ];
    let user = null;
    for (const c of candidates) {
      user = employees.find((e) => String(e.pin) === c || String(e.pin) === String(pin));
      if (user) break;
    }
    if (!user) {
      const found = employees.slice(0, 5);
      console.log("Could not find PIN", pin, "tried candidates", candidates, "have employees:", employees.length, found.map((e) => ({ id: e.id, name: e.name, pin: e.pin, role: e.role })));
      throw new Error("PIN lookup failed");
    }
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, pin: String(user.pin) }),
    });
    const json = await res.json();
    if (!json.success) throw new Error("Login failed: " + JSON.stringify(json));
    return json.data?.user || json.user;
  }, pin);
}

async function shoot(page, path, name) {
  await page.screenshot({ path, fullPage: true });
  console.log("Saved", name, "->", path);
}

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  for (const role of ["karyawan", "manager"]) {
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
      const page = await ctx.newPage();
      page.on("pageerror", (e) => errors.push(`[${role}@${vp.name}] pageerror: ${e.message}`));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(`[${role}@${vp.name}] console.error: ${msg.text()}`);
      });
      try {
        await loginAs(page, PINS[role]);
        await page.waitForTimeout(800);
        await shoot(page, `screenshots/${role}-${vp.name}-home.png`, `${role}@${vp.name} home`);
        // Click each nav item
        const navLabels = role === "karyawan"
          ? ["Absensi", "Dashboard", "Jadwal Saya", "Kasbon"]
          : ["Dashboard", "Karyawan", "Kelola Jadwal", "Override Absensi", "Kasbon"];
        for (const label of navLabels) {
          const btn = await page.$(`text="${label}"`);
          if (btn) {
            await btn.click();
            await page.waitForTimeout(500);
            await shoot(page, `screenshots/${role}-${vp.name}-${label.replace(/\W+/g, "-").toLowerCase()}.png`, `${role}@${vp.name} ${label}`);
          }
        }
      } catch (e) {
        errors.push(`[${role}@${vp.name}] navigation failed: ${e.message}`);
      }
      await ctx.close();
    }
  }
  await browser.close();
  if (errors.length) {
    console.log("ERRORS:");
    errors.forEach((e) => console.log(" -", e));
    process.exit(1);
  } else {
    console.log("All viewports rendered with no JS errors.");
  }
})();
