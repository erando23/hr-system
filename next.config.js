/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["better-sqlite3", "@libsql/client"],
};

module.exports = nextConfig;