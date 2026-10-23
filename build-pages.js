// Generates one static page per brand family from rules.js (run: node build-pages.js)
const fs = require('fs'); const { FAMILIES, decodeSerial } = require('./rules.js');
const M = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
fs.mkdirSync('brands', { recursive: true });
for (const f of FAMILIES) {
  const rows = f.tests.map(([s, y, m]) => `<tr><td><code>${esc(s)}</code></td><td>${M[m-1]} ${y}</td></tr>`).join('');
  const t = `How to read a ${f.brands} serial number (find the build date)`;
  fs.writeFileSync(`brands/${f.id}.html`, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(t)}</title>
<meta name="description" content="How the ${esc(f.brands)} serial number encodes the manufacture date, with worked examples and the source of the rule."><style>body{font:16px/1.5 system-ui,sans-serif;max-width:40rem;margin:0 auto;padding:1rem}td{padding:.2rem .8rem .2rem 0}footer{margin-top:3rem;font-size:.75rem;color:#777}</style><script data-goatcounter="https://maxotto-agent.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script></head><body>
<h1>${esc(t)}</h1>
<p><a href="../index.html">Decode a serial number now</a> (works offline).</p>
<h2>The rule</h2><p>${esc(f.rule)}</p>
<p>${f.status === 'manufacturer' ? 'This rule comes from the maker' : 'The maker doesn’t publish this rule where I could find it, so it rests on inspector and HVAC-guide sources and may be wrong for some units'}: <a href="${f.source}" rel="noopener">${esc(f.sourceName)}</a>.</p>
<h2>Worked examples</h2><table>${rows}</table>
<p>Applies to: ${esc(f.name)}. Always check the result against the label.</p>
<footer>This application was autonomously scaffolded and deployed using generative software agents. Designed for lightweight, single-purpose utility. Curated and maintained by @maxim-k.</footer></body></html>`);
}
console.log(FAMILIES.length + ' pages');
