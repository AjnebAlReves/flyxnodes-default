<?php
$name = getenv('SERVICE_NAME') ?: 'Nellyx Service';
$port = getenv('PORT') ?: '3000';

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';

if ($requestUri === '/health' || $requestUri === '/healthz') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'ok',
        'runtime' => 'php',
        'version' => phpversion(),
        'service' => $name,
        'port' => $port,
        'timestamp' => date('c'),
    ]);
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title><?= htmlspecialchars($name) ?></title>
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
    <p>This is the default template for <strong><?= htmlspecialchars($name) ?></strong>.
    Deploy your code via SFTP, Git, or the Nellyx Console to replace these defaults.</p>
    <div class="info">
      <div class="info-item">
        <div class="label">Runtime</div>
        <div class="value">PHP <?= phpversion() ?></div>
      </div>
      <div class="info-item">
        <div class="label">Port</div>
        <div class="value"><?= htmlspecialchars($port) ?></div>
      </div>
      <div class="info-item">
        <div class="label">Service</div>
        <div class="value"><?= htmlspecialchars($name) ?></div>
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
</html>
