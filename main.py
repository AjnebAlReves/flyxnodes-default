import os
import sys
import json
import signal
import http.server
import time
from datetime import datetime, timezone

PORT = int(os.environ.get("PORT", "3000"))
NAME = os.environ.get("SERVICE_NAME", "Nellyx Service")
ROOT = os.path.dirname(os.path.abspath(__file__))

DEFAULTS = {
    "index.js", "package.json", "package-lock.json",
    "main.py", "requirements.txt",
    "main.go", "go.mod", "go.sum",
    "main.ts", "deno.json",
    "index.html", "index.php",
    ".env.example", "welcome.html",
    "node_modules", ".npm", "__pycache__"
}

WELCOME_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>%s</title>
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
    <p>This is the default template for <strong>%s</strong>.
    Deploy your code via SFTP, Git, or the Nellyx Console to replace these defaults.</p>
    <div class="info">
      <div class="info-item">
        <div class="label">Runtime</div>
        <div class="value">Python %s</div>
      </div>
      <div class="info-item">
        <div class="label">Port</div>
        <div class="value">%s</div>
      </div>
      <div class="info-item">
        <div class="label">Service</div>
        <div class="value">%s</div>
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
</html>"""


def has_user_files():
    try:
        for entry in os.listdir(ROOT):
            if entry.startswith(".") or entry in DEFAULTS:
                continue
            entry_path = os.path.join(ROOT, entry)
            if os.path.isfile(entry_path) or os.path.isdir(entry_path):
                return True
    except OSError:
        pass
    return False


def self_destruct():
    if has_user_files():
        print("  📦 User files detected — keeping defaults in place")
        return
    print("  🧹 Cleaning up default template files...")
    for file_name in DEFAULTS:
        fp = os.path.join(ROOT, file_name)
        try:
            if not os.path.exists(fp):
                continue
            if os.path.isdir(fp):
                import shutil
                shutil.rmtree(fp, ignore_errors=True)
            else:
                os.unlink(fp)
            print("     ✓ removed " + file_name)
        except Exception as e:
            print("     ✗ " + file_name + ": " + str(e))
    print("  ✨ Defaults cleaned up")


class HealthHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ("/health", "/healthz"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            body = json.dumps({
                "status": "ok",
                "runtime": "python",
                "version": sys.version.split()[0],
                "service": NAME,
                "port": PORT,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            self.wfile.write(body.encode())
            return

        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        py_ver = sys.version.split()[0]
        html = WELCOME_HTML % (NAME, NAME, py_ver, PORT, NAME)
        self.wfile.write(html.encode())

    def log_message(self, fmt, *args):
        print(f"  {args[0]} {args[1]} {args[2]}")


def shutdown_handler(signum, frame):
    print("\n  ╔══════════════════════════════════════════════╗")
    print("  ║        🛑  Shutting down (SIGTERM)          ║")
    print("  ╚══════════════════════════════════════════════╝\n")
    server.shutdown()
    self_destruct()
    sys.exit(0)


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, shutdown_handler)
    signal.signal(signal.SIGINT, shutdown_handler)

    server = http.server.HTTPServer(("0.0.0.0", PORT), HealthHandler)
    print("")
    print("  ╔══════════════════════════════════════════════╗")
    print("  ║        🚀  Nellyx Service Defaults          ║")
    print("  ╠══════════════════════════════════════════════╣")
    print("  ║  Service: " + NAME.ljust(37) + "║")
    print("  ║  Runtime: Python " + sys.version.split()[0].ljust(26) + "║")
    print("  ║  Port:    " + str(PORT).ljust(36) + "║")
    print("  ║  Health:  /health" + " ".ljust(32) + "║")
    print("  ╚══════════════════════════════════════════════╝")
    print("")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        shutdown_handler(None, None)
