package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"runtime"
	"syscall"
	"time"
)

var (
	port   = getEnv("PORT", "3000")
	name   = getEnv("SERVICE_NAME", "Nellyx Service")
	root   = getRootDir()
)

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getRootDir() string {
	exe, err := os.Executable()
	if err != nil {
		return "."
	}
	return filepath.Dir(exe)
}

var defaults = map[string]bool{
	"index.js": true, "package.json": true, "package-lock.json": true,
	"main.py": true, "requirements.txt": true,
	"main.go": true, "go.mod": true, "go.sum": true,
	"main.ts": true, "deno.json": true,
	"index.html": true, "index.php": true,
	".env.example": true, "welcome.html": true,
	"node_modules": true, ".npm": true, "__pycache__": true,
}

func hasUserFiles() bool {
	entries, err := os.ReadDir(root)
	if err != nil {
		return false
	}
	for _, e := range entries {
		name := e.Name()
		if name[0] == '.' || defaults[name] {
			continue
		}
		return true
	}
	return false
}

func selfDestruct() {
	if hasUserFiles() {
		fmt.Println("  📦 User files detected — keeping defaults in place")
		return
	}
	fmt.Println("  🧹 Cleaning up default template files...")
	for f := range defaults {
		fp := filepath.Join(root, f)
		info, err := os.Stat(fp)
		if os.IsNotExist(err) {
			continue
		}
		if info.IsDir() {
			os.RemoveAll(fp)
		} else {
			os.Remove(fp)
		}
		fmt.Println("     ✓ removed " + f)
	}
	fmt.Println("  ✨ Defaults cleaned up")
}

const welcomeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>%s</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
    background:linear-gradient(135deg,#0f0f1a 0%%,#1a1a2e 50%%,#16213e 100%%);
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
        <div class="value">Go %s</div>
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
</html>`

func healthJSON() string {
	b, _ := json.Marshal(map[string]interface{}{
		"status":    "ok",
		"runtime":   "go",
		"version":   runtime.Version(),
		"service":   name,
		"port":      port,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
	return string(b)
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, healthJSON())
	})
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, healthJSON())
	})
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, welcomeHTML, name, name, runtime.Version(), port, name)
	})

	fmt.Println("")
	fmt.Println("  ╔══════════════════════════════════════════════╗")
	fmt.Println("  ║        🚀  Nellyx Service Defaults          ║")
	fmt.Println("  ╠══════════════════════════════════════════════╣")
	fmt.Printf("  ║  Service: %-37s║\n", name)
	fmt.Printf("  ║  Runtime: Go %-30s║\n", runtime.Version())
	fmt.Printf("  ║  Port:    %-36s║\n", port)
	fmt.Println("  ║  Health:  /health" + "                                ║")
	fmt.Println("  ╚══════════════════════════════════════════════╝")
	fmt.Println("")

	srv := &http.Server{Addr: ":" + port, Handler: mux}

	go func() {
		sig := make(chan os.Signal, 1)
		signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
		<-sig
		fmt.Println("\n  ╔══════════════════════════════════════════════╗")
		fmt.Println("  ║        🛑  Shutting down (SIGTERM)          ║")
		fmt.Println("  ╚══════════════════════════════════════════════╝\n")
		srv.Close()
		selfDestruct()
		os.Exit(0)
	}()

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
