// scripts/test-login.js
// Test login API
const body = JSON.stringify({ userId: "sa1", pin: "000001" });

const res = await fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body,
});
console.log("Status:", res.status);
console.log("Body:", await res.text());