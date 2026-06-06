// scripts/smoke-test.js
// Test login & basic API calls against the production URL.
// Login sebagai superadmin (sa1 / 000001) — endpoint butuh userId + pin.

const BASE = process.env.SMOKE_URL || "https://hr-system-gold-beta.vercel.app";

function getCookies(headers) {
  const cookies = headers.getSetCookie?.() ?? [];
  if (cookies.length === 0) {
    // Fallback: read raw set-cookie header
    const raw = headers.get("set-cookie");
    if (raw) return raw.split(/,(?=\s*[A-Za-z0-9_]+=)/);
  }
  return cookies.map((c) => c.split(";")[0]);
}

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    redirect: "manual",
  });
  return { res, cookies: getCookies(res.headers) };
}

async function get(path, cookie) {
  const res = await fetch(BASE + path, {
    headers: cookie ? { Cookie: cookie } : {},
    redirect: "manual",
  });
  return res;
}

async function testLogin(userId, pin) {
  const { res, cookies } = await post("/api/auth/login", { userId, pin });
  console.log(`POST /api/auth/login  userId=${userId}  pin=${pin}`);
  console.log(`  status: ${res.status}`);
  if (res.status !== 200) {
    const text = await res.text();
    console.log(`  body:   ${text.slice(0, 200)}`);
    return null;
  }
  const json = await res.json();
  console.log(`  success: ${json.success}, user.role: ${json.data?.user?.role}, name: ${json.data?.user?.name}`);
  console.log(`  cookies: ${cookies.length} received`);
  return cookies.join("; ");
}

async function testMe(cookie) {
  const res = await get("/api/auth/me", cookie);
  console.log(`\nGET /api/auth/me`);
  console.log(`  status: ${res.status}`);
  if (res.status === 200) {
    const json = await res.json();
    console.log(`  user:   ${json.data?.name} (${json.data?.role})`);
  } else {
    console.log(`  body:   ${(await res.text()).slice(0, 200)}`);
  }
}

async function testEmployees(cookie) {
  const res = await get("/api/employees", cookie);
  console.log(`\nGET /api/employees`);
  console.log(`  status: ${res.status}`);
  if (res.status === 200) {
    const json = await res.json();
    const users = json.data?.employees ?? json.data ?? [];
    console.log(`  count:  ${Array.isArray(users) ? users.length : "?"} employees`);
  } else {
    console.log(`  body:   ${(await res.text()).slice(0, 200)}`);
  }
}

async function testWrongPin() {
  const { res } = await post("/api/auth/login", { userId: "sa1", pin: "999999" });
  console.log(`\nPOST /api/auth/login (wrong pin)`);
  console.log(`  status: ${res.status} (expected 401)`);
}

console.log(`Smoke test against: ${BASE}\n`);

const cookie = await testLogin("sa1", "000001");
if (cookie) {
  await testMe(cookie);
  await testEmployees(cookie);
}
await testWrongPin();

console.log("\nDone.");
