const PORT = parseInt(Deno.env.get("PORT") ?? "3000");
const NAME = Deno.env.get("SERVICE_NAME") ?? "Nellyx Service";

const DEFAULTS = new Set([
  "index.js", "package.json", "package-lock.json",
  "main.py", "requirements.txt",
  "main.go", "go.mod", "go.sum",
  "main.ts", "deno.json",
  "index.html", "index.php",
  ".env.example", "welcome.html",
  "node_modules", ".npm", "__pycache__",
]);

function hasUserFiles(): boolean {
  try {
    for (const entry of Deno.readDirSync(".")) {
      if (entry.name.startsWith(".") || DEFAULTS.has(entry.name)) continue;
      if (entry.isFile || entry.isDirectory) return true;
    }
  } catch {
    // ignore
  }
  return false;
}

function selfDestruct(): void {
  if (hasUserFiles()) {
    console.log("  📦 User files detected — keeping defaults in place");
    return;
  }
  console.log("  🧹 Cleaning up default template files...");
  for (const file of DEFAULTS) {
    try {
      const stat = Deno.statSync(file);
      if (stat.isDirectory) {
        Deno.removeSync(file, { recursive: true });
      } else {
        Deno.removeSync(file);
      }
      console.log("     ✓ removed " + file);
    } catch {
      // file doesn't exist, skip
    }
  }
  console.log("  ✨ Defaults cleaned up");
}

const WELCOME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${NAME}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
    background:linear-gradient(135deg,#0f0f1a 0%,#1a1a2e 50%,#16213e 100%);
    color:#e0e0e0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .container{text-align:center;padding:2rem}
  .logo{font-size:4rem;font-weight:800;background:linear-gradient(135deg,#00d4ff,#7b2ff7);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:0.5rem}
  .tagline{font-size:1.2rem;color:#8888aa;margin-bottom:2rem}
  .card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
    border-radius:12px;padding:2rem;max-width:500px;margin:0 auto 1.5rem;backdrop-filter:blur(10px)}
  .card h2{color:#00d4ff;margin-bottom:1rem;font-size:1.1rem}
  .card p{color:#a0a0c0;line-height:1.6;font-size:0.95rem}
  .info{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-top:1.5rem;text-align:left}
  .info-item{background:rgba(255,255,255,0.03);border-radius:8px;padding:0.75rem}
  .info-item .label{color:#6666aa;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px}
  .info-item .value{color:#c0c0e0;font-size:0.9rem;margin-top:0.25rem;font-weight:500}
  .badge{display:inline-block;background:rgba(0,212,255,0.15);color:#00d4ff;
    padding:0.35rem 1rem;border-radius:20px;font-size:0.8rem;font-weight:600;margin-bottom:1rem}
  .footer{color:#444466;font-size:0.8rem;margin-top:2rem}
  a{color:#7b2ff7;text-decoration:none}
  a:hover{text-decoration:underline}
</style>
</head>
<body>
<div class="container">
  <div class="logo">&#x25B3; Nellyx</div>
  <div class="tagline">Your Cloud Development Hub</div>
  <div class="card">
    <div class="badge">SERVICE DEFAULTS</div>
    <h2>Welcome to your new service</h2>
    <p>This is the default template for <strong>${NAME}</strong>.
    Deploy your code via SFTP, Git, or the Nellyx Console to replace these defaults.</p>
    <div class="info">
      <div class="info-item">
        <div class="label">Runtime</div>
        <div class="value">Deno ${Deno.version.deno}</div>
      </div>
      <div class="info-item">
        <div class="label">Port</div>
        <div class="value">${PORT}</div>
      </div>
      <div class="info-item">
        <div class="label">Service</div>
        <div class="value">${NAME}</div>
      </div>
      <div class="info-item">
        <div class="label">Health</div>
        <div class="value"><a href="/health">/health</a></div>
      </div>
    </div>
  </div>
  <div class="footer">
    Nellyx &mdash; <a href="https://nellyx.xyz" target="_blank">nellyx.xyz</a>
  </div>
</div>
</body>
</html>`;

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/health" || url.pathname === "/healthz") {
    return new Response(
      JSON.stringify({
        status: "ok",
        runtime: "deno",
        version: Deno.version.deno,
        service: NAME,
        port: PORT,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(WELCOME_HTML, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

console.log("");
console.log("  ╔══════════════════════════════════════════════╗");
console.log("  ║        🚀  Nellyx Service Defaults          ║");
console.log("  ╠══════════════════════════════════════════════╣");
console.log(`  ║  Service: ${NAME.padEnd(37)}║`);
console.log(`  ║  Runtime: Deno ${Deno.version.deno.padEnd(28)}║`);
console.log(`  ║  Port:    ${String(PORT).padEnd(36)}║`);
console.log("  ║  Health:  /health" + "                                ║");
console.log("  ╚══════════════════════════════════════════════╝");
console.log("");

Deno.serve({ port: PORT, hostname: "0.0.0.0", onListen: () => {} }, handler);

function shutdown() {
  console.log("\n  ╔══════════════════════════════════════════════╗");
  console.log("  ║        🛑  Shutting down (SIGTERM)          ║");
  console.log("  ╚══════════════════════════════════════════════╝\n");
  selfDestruct();
  Deno.exit(0);
}

Deno.addSignalListener("SIGINT", shutdown);
Deno.addSignalListener("SIGTERM", shutdown);
