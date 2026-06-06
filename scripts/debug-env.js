// scripts/debug-env.js
// Quick debug: print env values (masked) to verify format.

const url = process.env.DATABASE_URL;
const tok = process.env.DATABASE_AUTH_TOKEN;

console.log("DATABASE_URL:", url);
console.log("URL length:", url ? url.length : 0);
console.log("URL starts with libsql://:", url?.startsWith("libsql://"));
console.log("URL starts with https://:", url?.startsWith("https://"));
console.log();
console.log("DATABASE_AUTH_TOKEN length:", tok ? tok.length : 0);
console.log("TOKEN first 20:", tok?.slice(0, 20));
console.log("TOKEN last 20:", tok?.slice(-20));
console.log("TOKEN has whitespace:", /\s/.test(tok ?? ""));
console.log("TOKEN has newline:", /[\r\n]/.test(tok ?? ""));
