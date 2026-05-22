const https = require("https");
const crypto = require("crypto");

// =======================
// CONFIG
// =======================

const REPO_URL = "https://github.com/guerthyaxel-dot/Al-bbt";
const INSTALL_COMMAND = "npm install --legacy-peer-deps";
const START_COMMAND = "npm start";
const API_BASE = "duck.opik.net";

// =======================
// RANDOM
// =======================

function randomString(length = 8) {
  return crypto
    .randomBytes(length)
    .toString("hex")
    .slice(0, length);
}

// =======================
// API REQUEST
// =======================

function apiRequest(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {

    const data = body
      ? JSON.stringify(body)
      : undefined;

    const options = {
      hostname: API_BASE,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (data) {
      options.headers["Content-Length"] =
        Buffer.byteLength(data);
    }

    const req = https.request(options, (res) => {

      let chunks = "";

      res.on("data", (c) => {
        chunks += c;
      });

      res.on("end", () => {

        try {

          resolve({
            status: res.statusCode,
            data: JSON.parse(chunks),
          });

        } catch {

          resolve({
            status: res.statusCode,
            data: chunks,
          });
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

// =======================
// MAIN
// =======================

async function main() {

  const rand = randomString(6);

  const email =
    `alya-${rand}@gmail.com`;

  const username =
    `Alya${rand}`;

  const password =
    randomString(12);

  // =====================
  // REGISTER
  // =====================

  console.log("\n=== REGISTER ===");

  console.log("Email:", email);
  console.log("Username:", username);
  console.log("Password:", password);

  const reg =
    await apiRequest(
      "POST",
      "/api/auth/register",
      {
        email,
        username,
        password,
      }
    );

  console.log(
    "\nRegister Status:",
    reg.status
  );

  console.log(
    JSON.stringify(
      reg.data,
      null,
      2
    )
  );

  if (
    reg.status !== 200 ||
    !reg.data.token
  ) {

    console.error(
      "\n❌ Registration failed"
    );

    process.exit(1);
  }

  const token =
    reg.data.token;

  const authHeader = {
    Authorization:
      `Bearer ${token}`,
  };

  // =====================
  // CREATE SERVER
  // =====================

  console.log(
    "\n=== CREATING SERVER ==="
  );

  const server =
    await apiRequest(
      "POST",
      "/api/servers",
      {
        name:
          `Alya-${rand}`,

        repoUrl:
          REPO_URL,

        installCommand:
          INSTALL_COMMAND,

        startCommand:
          START_COMMAND,

        gitToken: "",
      },
      authHeader
    );

  console.log(
    "\nCreate Server Status:",
    server.status
  );

  console.log(
    JSON.stringify(
      server.data,
      null,
      2
    )
  );

  if (
    server.status !== 201 ||
    !server.data.server
  ) {

    console.error(
      "\n❌ Server creation failed"
    );

    process.exit(1);
  }

  const serverId =
    server.data.server.id;

  // =====================
  // START SERVER
  // =====================

  console.log(
    "\n=== STARTING SERVER ==="
  );

  const start =
    await apiRequest(
      "POST",
      `/api/servers/${serverId}/start`,
      null,
      authHeader
    );

  console.log(
    "\nStart Status:",
    start.status
  );

  console.log(
    JSON.stringify(
      start.data,
      null,
      2
    )
  );

  // =====================
  // WAIT
  // =====================

  console.log(
    "\n=== WAITING LOGS ==="
  );

  await new Promise(
    (r) =>
      setTimeout(r, 30000)
  );

  // =====================
  // LOGS
  // =====================

  const logs =
    await apiRequest(
      "GET",
      `/api/servers/${serverId}/logs?limit=200`,
      null,
      authHeader
    );

  console.log(
    "\nLogs Status:",
    logs.status
  );

  console.log(
    JSON.stringify(
      logs.data,
      null,
      2
    )
  );

  console.log(
    "\n✅ BOT ONLINE 24/7"
  );
}

// =======================
// START
// =======================

main().catch(console.error);
