// storyline-geo — first-visit language hint from the local GeoLite2 Postgres database.
// Serves GET /geo/lang  →  { lang: "fr" | null, country, subdivision }
// French-speaking places get "fr"; everyone else gets null (their browser language decides client-side).
const http = require("http");
const { Client } = require("pg");

const PORT = 3025;
const HOST = "127.0.0.1";
const DB_URL = process.env.STORYLINE_GEO_DB_URL ||
  "postgresql://big_data:PlqaokwS303999!@127.0.0.1:5432/geoip_database";

// French-speaking places (per founder's instruction, 2026-09-21):
// France, Belgium (all), Monaco, Luxembourg, Québec, Suisse romande.
const FR_COUNTRIES = new Set(["FR", "BE", "MC", "LU"]);
const FR_SUBDIVISIONS = new Set(["CA|QC", "CH|GE", "CH|VD", "CH|NE", "CH|FR", "CH|JU"]);

const CACHE = new Map();          // ip -> { lang, country, subdivision, expires }
const CACHE_TTL = 24 * 3600 * 1000;
const CACHE_MAX = 20000;

const pool = new Client({ connectionString: DB_URL });

function isPrivate(ip) {
  return ip === "::1" || ip === "127.0.0.1" || ip.startsWith("10.") ||
    ip.startsWith("192.168.") || ip.startsWith("172.16.") ||
    ip.startsWith("169.254.") || ip.startsWith("fc") || ip.startsWith("fd") ||
    ip === "::" || !ip;
}

async function lookup(ip) {
  const table = ip.includes(":") ? "city_blocks_ipv6" : "city_blocks_ipv4";
  const ctable = ip.includes(":") ? "country_blocks_ipv6" : "country_blocks_ipv4";
  // city first (gives subdivision → Québec / Romandie); fall back to country-only block
  let res = await pool.query(
    `SELECT l.country_iso_code AS country, l.subdivision_1_iso_code AS sub
       FROM ${table} b JOIN city_locations l
         ON l.geoname_id = b.geoname_id AND l.locale_code = 'en'
      WHERE b.network >> $1::inet LIMIT 1`, [ip]);
  if (!res.rows.length) {
    res = await pool.query(
      `SELECT l.country_iso_code AS country, NULL AS sub
         FROM ${ctable} b JOIN country_locations l
           ON l.geoname_id = b.geoname_id AND l.locale_code = 'en'
        WHERE b.network >> $1::inet LIMIT 1`, [ip]);
  }
  if (!res.rows.length) return { lang: null, country: null, subdivision: null };
  const { country, sub } = res.rows[0];
  const lang = (FR_COUNTRIES.has(country) || FR_SUBDIVISIONS.has(`${country}|${sub}`)) ? "fr" : null;
  return { lang, country, subdivision: sub || null };
}

function clientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return xff.split(",")[0].trim();
  return req.socket.remoteAddress || "";
}

const server = http.createServer(async (req, res) => {
  if (req.url.split("?")[0] !== "/geo/lang") {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end('{"error":"not found"}');
  }
  try {
    const ip = clientIp(req);
    let entry = CACHE.get(ip);
    if (!entry || entry.expires < Date.now()) {
      const data = isPrivate(ip) ? { lang: null, country: null, subdivision: null }
                                 : await lookup(ip);
      if (CACHE.size > CACHE_MAX) CACHE.clear();
      entry = { ...data, expires: Date.now() + CACHE_TTL };
      CACHE.set(ip, entry);
    }
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "https://storyline.voipclaw.com",
    });
    res.end(JSON.stringify({ lang: entry.lang, country: entry.country, subdivision: entry.subdivision }));
  } catch (e) {
    res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end('{"lang":null,"country":null,"subdivision":null}');
  }
});

pool.connect().then(() => {
  server.listen(PORT, HOST, () =>
    console.log(`storyline-geo listening on http://${HOST}:${PORT} (GeoLite2 via Postgres)`));
}).catch(e => { console.error("DB connect failed:", e.message); process.exit(1); });
