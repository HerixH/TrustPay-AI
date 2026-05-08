/**
 * Prints exp:// URL for Expo Go (LAN). Use the same port Metro shows
 * ("Waiting on http://localhost:PORT"). Default: 8081.
 *
 * Usage: node scripts/print-expo-url.js [port]
 *    or: EXPO_METRO_PORT=8085 node scripts/print-expo-url.js
 */
const os = require('os');

function pickLanIp() {
  const nets = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      const fam = net.family;
      if (fam !== 'IPv4' && fam !== 4) continue;
      if (net.internal) continue;
      const addr = net.address;
      if (addr.startsWith('169.254.')) continue;
      candidates.push({ addr, name });
    }
  }
  const score = (a) => {
    let s = 50;
    const n = a.name.toLowerCase();
    if (a.addr.startsWith('192.168.56.')) return 0;
    if (n.includes('virtualbox') || n.includes('vethernet')) return 1;
    if (n.includes('wi-fi') || n.includes('wlan') || n.includes('wireless'))
      s += 25;
    if (n.includes('ethernet') && !n.includes('wi-fi')) s -= 8;
    if (a.addr.startsWith('172.20.10.')) s += 40;
    if (a.addr.startsWith('192.168.')) s += 30;
    if (a.addr.startsWith('10.')) s += 20;
    return s;
  };
  candidates.sort((x, y) => score(y) - score(x));
  return candidates[0]?.addr ?? '127.0.0.1';
}

const port =
  process.env.EXPO_METRO_PORT || process.argv[2] || '8081';
const ip = pickLanIp();

console.log('');
console.log('Expo Go on iPhone: open the app, tap "Enter URL", paste:');
console.log('');
console.log(`  exp://${ip}:${port}`);
console.log('');
console.log('Metro must be running in this project. Port must match Metro');
console.log('(see "Waiting on http://localhost:PORT" in that terminal).');
console.log('If this fails on Wi‑Fi, use: npm run start:tunnel');
console.log('');
