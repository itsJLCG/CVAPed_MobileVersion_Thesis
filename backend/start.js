const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

process.on('uncaughtException', (err) => {
  if (err.code === 'EBADF' || err.message?.includes('not a socket')) {
    return;
  }
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

const backendDir = __dirname;

console.log('\n========================================');
console.log('  CVACare Backend Services');
console.log('  Starting 3 Services...');
console.log('========================================\n');

const currentDir = process.cwd();
if (!currentDir.endsWith('backend')) {
  console.log('ERROR: Please run this script from the backend directory');
  console.log('Current directory:', currentDir);
  console.log('Run: cd backend');
  process.exit(1);
}

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
          addresses.push({ name, address: iface.address });
        }
      }
    }
  }
  
  // Prefer Wi-Fi or Ethernet interfaces
  for (const addr of addresses) {
    const lowerName = addr.name.toLowerCase();
    if (lowerName.includes('wi-fi') || lowerName.includes('wifi') || 
        lowerName.includes('ethernet') || lowerName.includes('lan')) {
      return addr.address;
    }
  }
  
  // Return first matching address
  if (addresses.length > 0) {
    return addresses[0].address;
  }
  
  // Fallback
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return '127.0.0.1';
}

const localIP = getLocalIP();
console.log('Local IP Address:', localIP);
console.log('Make sure your .env URLs match this IP!\n');

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  
  const envVars = [
    { key: 'GAIT_ANALYSIS_URL', match: envContent.match(/GAIT_ANALYSIS_URL=(.+)/), port: 5001 },
    { key: 'THERAPY_URL', match: envContent.match(/THERAPY_URL=(.+)/), port: 5002 },
  ];
  
  for (const { key, match, port } of envVars) {
    if (match) {
      const url = match[1].trim();
      console.log('Current ' + key + ':', url);
      if (url.includes('localhost')) {
        console.log('[WARN] Using localhost won\'t work on mobile devices!');
        console.log('  Update .env to: ' + key + '=http://' + localIP + ':' + port);
      }
    }
  }
  console.log('');
}

function runCommand(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      cwd,
      shell: true,
      stdio: 'inherit'
    });
    proc.on('close', (code) => resolve(code));
    proc.on('error', reject);
  });
}

function quotePath(p) {
  return '"' + p + '"';
}

async function setupVenv(venvPath, requirementsPath, name) {
  const venvPython = path.join(venvPath, 'Scripts', 'python.exe');
  const venvPip = path.join(venvPath, 'Scripts', 'pip.exe');
  const cacheFile = path.join(venvPath, '.dep_cache');
  
  if (!fs.existsSync(venvPython)) {
    console.log('[WARN] ' + name + ' venv not found. Creating it...');
    await runCommand('python', ['-m', 'venv', quotePath(venvPath)], backendDir);
    console.log('[OK] ' + name + ' venv created');
    
    console.log('  Installing dependencies...');
    await runCommand(quotePath(venvPip), ['install', '--upgrade', 'pip'], backendDir);
    await runCommand(quotePath(venvPip), ['install', '-r', quotePath(requirementsPath)], backendDir);
    
    // Write cache
    fs.writeFileSync(cacheFile, Date.now().toString());
    console.log('[OK] ' + name + ' dependencies installed');
  } else {
    console.log('[OK] ' + name + ' venv found');
    
    // Check cache (skip verification if done within 30 minutes)
    const skipVerify = process.argv.includes('--skip-verify');
    if (skipVerify) {
      console.log('  [SKIP] Dependency verification skipped');
      return;
    }
    
    try {
      const cacheAge = fs.existsSync(cacheFile) ? Date.now() - parseInt(fs.readFileSync(cacheFile, 'utf8')) : Infinity;
      if (cacheAge < 30 * 60 * 1000) {
        console.log('  [SKIP] Dependencies verified recently (cache)');
        return;
      }
    } catch {}
    
    console.log('  Verifying dependencies...');
    try {
      const required = fs.readFileSync(requirementsPath, 'utf8')
        .split('\n')
        .map(line => line.trim().split('==')[0].split('>=')[0].split('<=')[0])
        .filter(line => line && !line.startsWith('#'));
      
      // Batch check all packages at once
      const pkgCheck = required.map(pkg => {
        try {
          execSync(quotePath(venvPip) + ' show ' + pkg, { cwd: backendDir, stdio: 'ignore' });
          return null;
        } catch {
          return pkg;
        }
      }).filter(Boolean);
      
      if (pkgCheck.length > 0) {
        console.log('    Installing missing: ' + pkgCheck.join(', '));
        await runCommand(quotePath(venvPip), ['install', ...pkgCheck], backendDir);
      }
      
      // Update cache
      fs.writeFileSync(cacheFile, Date.now().toString());
      console.log('  [OK] Dependencies verified');
    } catch (e) {
      console.log('  [WARN] Could not verify dependencies');
    }
  }
}

async function checkPorts() {
  console.log('[4/5] Checking ports...');
  const net = require('net');
  
  const checkPort = (port) => new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
  
  const results = await Promise.all([
    checkPort(5000),
    checkPort(5001),
    checkPort(5002)
  ]);
  
  const ports = [5000, 5001, 5002];
  for (let i = 0; i < ports.length; i++) {
    if (!results[i]) {
      console.log('[WARN] Port ' + ports[i] + ' is already in use');
    }
  }
  console.log('[OK] Ports checked\n');
}

const services = [
  { name: 'Gait Analysis', cwd: path.join(backendDir, 'gait-analysis'), port: 5001, venv: path.join(backendDir, 'gait-analysis', 'venv') },
  { name: 'Therapy', cwd: path.join(backendDir, 'therapy-exercises'), port: 5002, venv: path.join(backendDir, 'therapy-exercises', 'venv') },
  { name: 'Node API', cwd: backendDir, port: 5000 },
];

async function startServices() {
  console.log('[5/5] Starting services...\n');
  
  const isWindows = process.platform === 'win32';
  const spawnOpts = isWindows ? { 
    cwd: backendDir, 
    stdio: 'inherit',
    detached: false,
    windowsHide: true
  } : { 
    cwd: backendDir, 
    stdio: 'inherit',
    detached: true
  };
  
  const ps = services.map(s => {
    console.log('  -> Starting ' + s.name + ' (Port ' + s.port + ')...');
    
    if (s.venv) {
      const venvScripts = path.join(s.venv, 'Scripts');
      const appPath = path.join(s.cwd, 'app.py');
      
      const env = { 
        ...process.env, 
        PATH: venvScripts + path.delimiter + process.env.PATH,
        PYTHONUNBUFFERED: '1',
        FLASK_ENV: 'production'
      };
      
      const port = s.port;
      const patch = `
import sys, os
sys.path.insert(0, r'${appPath.replace(/\\/g, '\\\\')}')
import app as _app
_run = _app.app.run
def patched_run(*a, **kw):
    kw.setdefault('threaded', False)
    kw.setdefault('use_reloader', False)
    kw.setdefault('debug', False)
    kw.setdefault('host', '0.0.0.0')
    kw.setdefault('port', ${port})
    _run(*a, **kw)
_app.app.run = patched_run
_app.app.run()
`;
      
      return spawn('python', ['-c', patch], {
        cwd: s.cwd,
        env: env,
        stdio: 'inherit',
        detached: false,
        windowsHide: true
      });
    }
    
    return spawn('npm', ['run', 'dev'], {
      cwd: s.cwd,
      shell: true,
      stdio: 'inherit',
      windowsHide: true
    });
  });

  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const servicesInfo = [
    { name: 'Node API', port: 5000 },
    { name: 'Gait Analysis', port: 5001 },
    { name: 'Therapy', port: 5002 },
  ];
  
  console.log('\n========================================');
  console.log('  All Services Running!');
  console.log('========================================');
  for (const s of servicesInfo) {
    console.log('  ' + s.name + ':       http://localhost:' + s.port);
  }
  console.log('\n  Network IPs:');
  for (const s of servicesInfo) {
    console.log('    http://' + localIP + ':' + s.port);
  }
  console.log('\nPress Ctrl+C to stop all services\n');

  const cleanup = () => {
    console.log('\nStopping services...');
    
    ps.forEach(p => {
      try {
        p.kill('SIGTERM');
      } catch {}
    });
    
    setTimeout(() => {
      process.exit(0);
    }, 500);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

async function main() {
  console.log('[1/5] Checking Node.js dependencies...');
  try {
    execSync('npm list axios', { cwd: backendDir, stdio: 'ignore' });
    console.log('[OK] axios installed');
  } catch {
    console.log('[WARN] axios not found. Installing...');
    await runCommand('npm', ['install', 'axios'], backendDir);
    console.log('[OK] axios installed');
  }
  console.log('');

  console.log('[2/5] Checking Python environments (parallel)...');
  await Promise.all([
    setupVenv(
      path.join(backendDir, 'gait-analysis', 'venv'),
      path.join(backendDir, 'gait-analysis', 'requirements.txt'),
      'Gait Analysis'
    ),
    setupVenv(
      path.join(backendDir, 'therapy-exercises', 'venv'),
      path.join(backendDir, 'therapy-exercises', 'requirements.txt'),
      'Therapy'
    )
  ]);
  console.log('');

  await checkPorts();
  await startServices();
}

main();
