const { FAMILIES, decodeSerial } = require('./rules.js');
let bad = 0;
for (const f of FAMILIES) for (const [s, y, m] of f.tests) {
  const r = decodeSerial(s, f.id, 2026)[0];
  const ok = r && r.dates.some(d => d.year === y && d.month === m);
  if (!ok) { bad++; console.log('FAIL', f.id, s, y, m, JSON.stringify(r && r.dates)); }
}
console.log(bad ? bad + ' failures' : 'all pass');
process.exit(bad ? 1 : 0);
