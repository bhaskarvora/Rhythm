// import express from "express";
// import dotenv from "dotenv";
// import { sql } from "./config/db.js";
// import adminRoutes from "./route.js";
// import cloudinary from 'cloudinary';
// import redis from "redis";
// dotenv.config();

// export const redisClient = redis.createClient({
//   password: process.env.Redis_Password,
//   socket:{
//     host: "redis-17645.c276.us-east-1-2.ec2.redns.redis-cloud.com",
//     port:17645,
//   },
// });


// cloudinary.v2.config({
//     cloud_name:process.env.Cloud_Name,
//     api_key:process.env.Cloud_Api_Key,
//     api_secret:process.env.Cloud_Api_Secret,
// })

// const app = express();

// app.use(express.json());
// const port = process.env.PORT ?? 7000;

// async function initDB() {
//   try {
//     await sql`
//     CREATE TABLE IF NOT EXISTS albums(
//       id SERIAL PRIMARY KEY,
//       title VARCHAR(255) NOT NULL,
//       description VARCHAR(255) NOT NULL,
//       thumbnail VARCHAR(255) NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )`;

//     await sql`
//     CREATE TABLE IF NOT EXISTS songs(
//       id SERIAL PRIMARY KEY,
//       title VARCHAR(255) NOT NULL,
//       description VARCHAR(255) NOT NULL,
//       thumbnail VARCHAR(255),
//       audio VARCHAR(255) NOT NULL,
//       album_id INTEGER,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       CONSTRAINT fk_songs_album
//         FOREIGN KEY (album_id)
//         REFERENCES albums(id)
//         ON DELETE SET NULL
//     )`;

//     console.log("Database initialized successfully");
//   } catch (error) {
//     console.log("Error initDb", error);
//     throw error; // rethrow so we don't start the server on failure
//   }
// }


// app.use("/api/v1", adminRoutes) 

// initDB()
//   .then(() => {
//     app.listen(port, () => {
//       console.log(`server is running on port ${port}`);
//     });
//   })
//   .catch(() => {
//     // optional: process.exit(1);
//   });



// index.ts
// import express from "express";
// import dotenv from "dotenv";
// import cloudinary from "cloudinary";
// import redis from "redis";
// import { sql } from "./config/db.js";

// // Controllers
// import {
//   addAlbum,
//   addSong,
//   addThumbnail,
//   deleteAlbum,
//   deleteSong,
// } from "./controller.js";

// dotenv.config();

// /** ===========================
//  *        Redis Client
//  * =========================== */
// export const redisClient = redis.createClient({
//   password: process.env.Redis_Password,
//   socket: {
//     host:
//       process.env.Redis_Host ||
//       "redis-17645.c276.us-east-1-2.ec2.redns.redis-cloud.com",
//     port: Number(process.env.Redis_Port) || 17645,
//     tls: true, // Redis Cloud typically requires TLS
//   },
// });

// redisClient.on("error", (err) => {
//   console.error("❌ Redis error:", err);
// });

// /** ===========================
//  *      Cloudinary Config
//  * =========================== */
// cloudinary.v2.config({
//   cloud_name: process.env.Cloud_Name,
//   api_key: process.env.Cloud_Api_Key,
//   api_secret: process.env.Cloud_Api_Secret,
// });

// /** ===========================
//  *     Express + Routes
//  * =========================== */
// const app = express();
// app.use(express.json());

// /**
//  * Simple GET routes with caching
//  * - Key names match invalidation in controllers
//  * - Adjust TTL as needed (EX seconds)
//  */
// const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 60);

// app.get("/api/v1/albums", async (req, res) => {
//   try {
//     const cached = await redisClient.get("albums");
//     if (cached) {
//       return res.json({ source: "cache", albums: JSON.parse(cached) });
//     }

//     const rows = await sql`SELECT * FROM albums ORDER BY created_at DESC`;
//     await redisClient.set("albums", JSON.stringify(rows), { EX: CACHE_TTL_SECONDS });
//     return res.json({ source: "db", albums: rows });
//   } catch (e) {
//     console.error("GET /albums error", e);
//     return res.status(500).json({ message: "Internal error" });
//   }
// });

// app.get("/api/v1/albums/:id", async (req, res) => {
//   try {
//     const { id } = req.params as { id: string };
//     const key = `album:${id}`;

//     const cached = await redisClient.get(key);
//     if (cached) {
//       return res.json({ source: "cache", album: JSON.parse(cached) });
//     }

//     const rows = await sql`SELECT * FROM albums WHERE id = ${id} LIMIT 1`;
//     if (rows.length === 0) {
//       return res.status(404).json({ message: "Album not found" });
//     }

//     await redisClient.set(key, JSON.stringify(rows[0]), { EX: CACHE_TTL_SECONDS });
//     return res.json({ source: "db", album: rows[0] });
//   } catch (e) {
//     console.error("GET /albums/:id error", e);
//     return res.status(500).json({ message: "Internal error" });
//   }
// });

// app.get("/api/v1/albums/:id/songs", async (req, res) => {
//   try {
//     const { id } = req.params as { id: string };
//     const key = `album:${id}:songs`;

//     const cached = await redisClient.get(key);
//     if (cached) {
//       return res.json({ source: "cache", songs: JSON.parse(cached) });
//     }

//     const rows =
//       await sql`SELECT * FROM songs WHERE album_id = ${id} ORDER BY created_at DESC`;

//     await redisClient.set(key, JSON.stringify(rows), { EX: CACHE_TTL_SECONDS });
//     return res.json({ source: "db", songs: rows });
//   } catch (e) {
//     console.error("GET /albums/:id/songs error", e);
//     return res.status(500).json({ message: "Internal error" });
//   }
// });

// app.get("/api/v1/songs", async (req, res) => {
//   try {
//     const cached = await redisClient.get("songs");
//     if (cached) {
//       return res.json({ source: "cache", songs: JSON.parse(cached) });
//     }

//     const rows = await sql`SELECT * FROM songs ORDER BY created_at DESC`;
//     await redisClient.set("songs", JSON.stringify(rows), { EX: CACHE_TTL_SECONDS });
//     return res.json({ source: "db", songs: rows });
//   } catch (e) {
//     console.error("GET /songs error", e);
//     return res.status(500).json({ message: "Internal error" });
//   }
// });

// /** Write routes (admin) */
// import multer from "multer";
// const upload = multer(); // configure storage as you prefer

// app.post("/api/v1/albums", upload.single("file"), addAlbum);
// app.delete("/api/v1/albums/:id", deleteAlbum);

// app.post("/api/v1/songs", upload.single("file"), addSong);
// app.patch("/api/v1/songs/:id/thumbnail", upload.single("file"), addThumbnail);
// app.delete("/api/v1/songs/:id", deleteSong);

// /** ===========================
//  *        DB bootstrap
//  * =========================== */
// async function initDB() {
//   await sql`
//     CREATE TABLE IF NOT EXISTS albums(
//       id SERIAL PRIMARY KEY,
//       title VARCHAR(255) NOT NULL,
//       description VARCHAR(255) NOT NULL,
//       thumbnail VARCHAR(255) NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )`;

//   await sql`
//     CREATE TABLE IF NOT EXISTS songs(
//       id SERIAL PRIMARY KEY,
//       title VARCHAR(255) NOT NULL,
//       description VARCHAR(255) NOT NULL,
//       thumbnail VARCHAR(255),
//       audio VARCHAR(255) NOT NULL,
//       album_id INTEGER,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       CONSTRAINT fk_songs_album
//         FOREIGN KEY (album_id)
//         REFERENCES albums(id)
//         ON DELETE SET NULL
//     )`;
//   console.log("Database initialized successfully");
// }

// /** ===========================
//  *         Bootstrap
//  * =========================== */
// const port = Number(process.env.PORT) || 7000;

// async function bootstrap() {
//   try {
//     await redisClient.connect();
//     console.log("✅ Redis connected:", await redisClient.ping());

//     await initDB();

//     app.listen(port, () => {
//       console.log(`server is running on port ${port}`);
//     });
//   } catch (error) {
//     console.error("Fatal startup error:", error);
//     process.exit(1);
//   }
// }

// bootstrap();


// // index.ts
// import express from "express";
// import dotenv from "dotenv";
// import cloudinary from "cloudinary";
// import multer from "multer";
// import { neon } from "@neondatabase/serverless";
// import { createClient } from "redis";

// dotenv.config();

// /** ===========================
//  *        Redis Client
//  * =========================== */
// const REDIS_URL = process.env.REDIS_URL;
// if (!REDIS_URL) {
//   throw new Error(
//     "REDIS_URL is not set in .env (use redis:// for non-TLS or rediss:// for TLS)"
//   );
// }

// // node-redis automatically enables TLS if the url starts with rediss://
// export const redisClient = createClient({ url: REDIS_URL });

// redisClient.on("error", (err) => {
//   console.error("❌ Redis error:", err);
// });

// /** ===========================
//  *        Database (Neon)
//  * =========================== */
// const DB_URL = process.env.DB_URL as string;
// if (!DB_URL) throw new Error("DB_URL is not set in .env");
// export const sql = neon(DB_URL);

// /** ===========================
//  *      Cloudinary Config
//  * =========================== */
// cloudinary.v2.config({
//   cloud_name: process.env.Cloud_Name,
//   api_key: process.env.Cloud_Api_Key,
//   api_secret: process.env.Cloud_Api_Secret,
// });

// /** ===========================
//  *     Express + Middleware
//  * =========================== */
// const app = express();
// app.use(express.json());

// /** File upload (memory) */
// const upload = multer();

// /** Cache TTL */
// const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 60);

// /** ===========================
//  *  Import controllers AFTER redisClient export
//  *  (prevents circular import issues)
//  * =========================== */
// import {
//   addAlbum,
//   addSong,
//   addThumbnail,
//   deleteAlbum,
//   deleteSong,
// } from "./controller.js";

// /** ===========================
//  *         Read Routes
//  * =========================== */
// app.get("/api/v1/albums", async (req, res) => {
//   try {
//     const cached = await redisClient.get("albums");
//     if (cached) {
//       return res.json({ source: "cache", albums: JSON.parse(cached) });
//     }

//     const rows = await sql`SELECT * FROM albums ORDER BY created_at DESC`;
//     await redisClient.set("albums", JSON.stringify(rows), { EX: CACHE_TTL_SECONDS });
//     return res.json({ source: "db", albums: rows });
//   } catch (e) {
//     console.error("GET /albums error", e);
//     return res.status(500).json({ message: "Internal error" });
//   }
// });

// app.get("/api/v1/albums/:id", async (req, res) => {
//   try {
//     const { id } = req.params as { id: string };
//     const key = `album:${id}`;

//     const cached = await redisClient.get(key);
//     if (cached) {
//       return res.json({ source: "cache", album: JSON.parse(cached) });
//     }

//     const rows = await sql`SELECT * FROM albums WHERE id = ${id} LIMIT 1`;
//     if (rows.length === 0) {
//       return res.status(404).json({ message: "Album not found" });
//     }

//     await redisClient.set(key, JSON.stringify(rows[0]), { EX: CACHE_TTL_SECONDS });
//     return res.json({ source: "db", album: rows[0] });
//   } catch (e) {
//     console.error("GET /albums/:id error", e);
//     return res.status(500).json({ message: "Internal error" });
//   }
// });

// app.get("/api/v1/albums/:id/songs", async (req, res) => {
//   try {
//     const { id } = req.params as { id: string };
//     const key = `album:${id}:songs`;

//     const cached = await redisClient.get(key);
//     if (cached) {
//       return res.json({ source: "cache", songs: JSON.parse(cached) });
//     }

//     const rows =
//       await sql`SELECT * FROM songs WHERE album_id = ${id} ORDER BY created_at DESC`;

//     await redisClient.set(key, JSON.stringify(rows), { EX: CACHE_TTL_SECONDS });
//     return res.json({ source: "db", songs: rows });
//   } catch (e) {
//     console.error("GET /albums/:id/songs error", e);
//     return res.status(500).json({ message: "Internal error" });
//   }
// });

// app.get("/api/v1/songs", async (req, res) => {
//   try {
//     const cached = await redisClient.get("songs");
//     if (cached) {
//       return res.json({ source: "cache", songs: JSON.parse(cached) });
//     }

//     const rows = await sql`SELECT * FROM songs ORDER BY created_at DESC`;
//     await redisClient.set("songs", JSON.stringify(rows), { EX: CACHE_TTL_SECONDS });
//     return res.json({ source: "db", songs: rows });
//   } catch (e) {
//     console.error("GET /songs error", e);
//     return res.status(500).json({ message: "Internal error" });
//   }
// });

// /** ===========================
//  *        Write Routes
//  * =========================== */
// app.post("/api/v1/albums", upload.single("file"), addAlbum);
// app.delete("/api/v1/albums/:id", deleteAlbum);

// app.post("/api/v1/songs", upload.single("file"), addSong);
// app.patch("/api/v1/songs/:id/thumbnail", upload.single("file"), addThumbnail);
// app.delete("/api/v1/songs/:id", deleteSong);

// /** ===========================
//  *        DB bootstrap
//  * =========================== */
// async function initDB() {
//   await sql`
//     CREATE TABLE IF NOT EXISTS albums(
//       id SERIAL PRIMARY KEY,
//       title VARCHAR(255) NOT NULL,
//       description VARCHAR(255) NOT NULL,
//       thumbnail VARCHAR(255) NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )`;

//   await sql`
//     CREATE TABLE IF NOT EXISTS songs(
//       id SERIAL PRIMARY KEY,
//       title VARCHAR(255) NOT NULL,
//       description VARCHAR(255) NOT NULL,
//       thumbnail VARCHAR(255),
//       audio VARCHAR(255) NOT NULL,
//       album_id INTEGER,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       CONSTRAINT fk_songs_album
//         FOREIGN KEY (album_id)
//         REFERENCES albums(id)
//         ON DELETE SET NULL
//     )`;
//   console.log("Database initialized successfully");
// }

// /** ===========================
//  *         Bootstrap
//  * =========================== */

// src/index.ts


// src/index.ts
import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";
import adminRoutes from "./route.js";
import cloudinary from "cloudinary";
import { createClient } from "redis";
import cors from "cors";

dotenv.config();

/** --------------------------
 * Redis config (reads username from .env)
 * -------------------------- */
const redisHost = process.env.Redis_Host!;
const redisPortNum = Number(process.env.Redis_Port || "0");
const redisUsername = (process.env.Redis_Username || "default").trim(); // <-- NEW
const redisPassword = (process.env.Redis_Password || "").trim();
const redisDisabled = process.env.DISABLE_REDIS === "true";              // <-- NEW

const CONNECT_TIMEOUT_MS = 7000;

function required(name: string, val?: string | number) {
  if (!val && val !== 0) throw new Error(`Missing env: ${name}`);
}

if (!redisDisabled) {
  required("Redis_Host", redisHost);
  required("Redis_Port", redisPortNum);
  required("Redis_Password", redisPassword);
}

console.log("🔌 Redis config:", {
  host: redisHost,
  port: redisPortNum,
  username: redisUsername,
  disabled: redisDisabled,
  note: redisDisabled ? "Redis disabled via DISABLE_REDIS=true" : "Will try PLAINTEXT first, then TLS",
});

// Exported so controllers can check readiness
export let redisClient: any = undefined;

/** Build a client for TLS or non-TLS */
function buildClient(useTLS: boolean) {
  return createClient({
    username: redisUsername,
    password: redisPassword,
    socket: {
      host: redisHost,
      port: redisPortNum,
      tls: useTLS ? ({ servername: redisHost } as any) : undefined,
      connectTimeout: CONNECT_TIMEOUT_MS,
      // fail fast during bootstrap so we see a clear error instead of infinite retries
      reconnectStrategy: () => new Error("No reconnect during bootstrap"),
    },
  });
}

async function tryConnect(useTLS: boolean) {
  console.log(`⏳ Trying Redis (TLS=${useTLS})...`);
  const client = buildClient(useTLS);
  client.on("error", () => {/* let connect() throw; keep logs clean */});
  await client.connect();
  const pong = await client.ping();
  if (pong !== "PONG") {
    await client.quit().catch(() => {});
    throw new Error(`Unexpected PING: ${pong}`);
  }
  console.log(`✅ Redis PING OK (TLS=${useTLS})`);
  return client;
}

async function initRedis() {
  if (redisDisabled) {
    console.warn("⚠️  Skipping Redis: DISABLE_REDIS=true");
    return;
  }

  // 1) PLAINTEXT
  try {
    redisClient = await tryConnect(false);
    console.log("✅ Redis connected (PLAINTEXT)");
    return;
  } catch (errPlain: any) {
    console.warn("⚠️ PLAINTEXT failed:", String(errPlain?.message || errPlain));
  }

  // 2) TLS
  try {
    redisClient = await tryConnect(true);
    console.log("✅ Redis connected (TLS)");
  } catch (errTLS: any) {
    const msg = String(errTLS?.message || errTLS);
    if (/WRONGPASS/i.test(msg)) {
      console.error("❌ Redis auth failed: WRONGPASS invalid username-password pair.");
      console.error("   → Use a DATABASE (ACL) user assigned to this DB. Console users will NOT work.");
      console.error("   → Update .env: Redis_Username + Redis_Password from the DB's Users/ACL page.");
    } else if (/ssl3_get_record:wrong version number/i.test(msg)) {
      console.error("❌ TLS handshake failed: wrong version number. This port is likely PLAINTEXT-only.");
    } else if (/ETIMEDOUT|EAI_AGAIN|ECONNREFUSED/i.test(msg)) {
      console.error("❌ Network/connect error:", msg);
    } else {
      console.error("❌ Redis connect error:", msg);
    }
    throw errTLS;
  }
}

/** --------------------------
 * Cloudinary
 * -------------------------- */
cloudinary.v2.config({
  cloud_name: process.env.Cloud_Name,
  api_key: process.env.Cloud_Api_Key,
  api_secret: process.env.Cloud_Api_Secret,
});

/** --------------------------
 * Express app
 * -------------------------- */
const app = express();
app.use(cors());
app.use(express.json());

/** --------------------------
 * DB bootstrap
 * -------------------------- */
async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS albums(
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        thumbnail VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS songs(
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        thumbnail VARCHAR(255),
        audio VARCHAR(255) NOT NULL,
        album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error initDb", error);
  }
}

/** --------------------------
 * Routes
 * -------------------------- */
app.use("/api/v1", adminRoutes);

const serverPort = process.env.PORT || 7000;

async function bootstrap() {
  try {
    await initRedis();  // will skip if DISABLE_REDIS=true
    await initDB();
    app.listen(serverPort, () => {
      console.log(`server is running on port ${serverPort}`);
    });
  } catch (e) {
    console.error("Fatal startup error:", e);
    process.exit(1);
  }
}

bootstrap();
