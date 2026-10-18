// Serial-number date rules. Each decode(serial, nowYear) returns [{year, month|null, week|null, note}] or [] if no fit.
const BW_YEARS = 'ABCDEFGHJKLMNPSTWXYZ'; // 20 letters: skips I O Q R U V
const BW_MONTHS = 'ABCDEFGHJKLM';        // A=Jan .. M=Dec, skips I
const weekToMonth = w => Math.min(12, Math.floor((w - 1) * 7 / 30.44) + 1);

const FAMILIES = [
  {
    id: 'bradford', name: 'Bradford White water heaters', brands: 'Bradford White',
    status: 'manufacturer', rule: 'First character = year letter (A = 2004 or 2024, one letter per year, skipping I, O, Q, R, U, V; the cycle repeats every 20 years). Second character = month letter (A = January … M = December, skipping I).',
    source: 'https://www.bradfordwhite.com/my-water-heater/', sourceName: "Bradford White, \"My Water Heater\"",
    tests: [['AB1234567', 2004, 2], ['CM0001', 2006, 12], ['KJ99', 2013, 9]],
    decode(s, now) {
      const y = BW_YEARS.indexOf(s[0]), m = BW_MONTHS.indexOf(s[1]);
      if (y < 0 || m < 0) return [];
      const out = [];
      for (let yr = 2004 + y; yr <= now; yr += 20) out.push({ year: yr, month: m + 1, hi: [0, 2], note: yr + 20 <= now ? '' : '' });
      return out.map(o => ({ year: o.year, month: o.month, hi: [0, 2], note: out.length > 1 ? 'The letter repeats every 20 years; check the unit’s condition and any install paperwork to choose.' : '' }));
    }
  },
  {
    id: 'aosmith', name: 'A. O. Smith, State, American and Reliance water heaters', brands: 'A. O. Smith, State, American, Reliance',
    status: 'manufacturer', rule: 'Digits 1–2 = year, digits 3–4 = week of the year (01–53). Example: 1719… = week 19 of 2017.',
    source: 'https://assets.hotwater.com/damroot/Original/10009/ServiceWarrantyGuide.pdf', sourceName: 'A. O. Smith Service and Warranty Guide (Dec 2018), p. 10',
    tests: [['1719106145074', 2017, 5], ['0852A1234', 2008, 12], ['2301XXXX', 2023, 1]],
    decode(s, now) {
      const m = /^(\d\d)(\d\d)/.exec(s); if (!m) return [];
      const yr = 2000 + +m[1], wk = +m[2];
      if (wk < 1 || wk > 53 || yr > now) return [];
      return [{ year: yr, month: weekToMonth(wk), week: wk, note: yr < 2005 ? 'The guide documents this format for current units; very old serials may use another scheme.' : '' }];
    }
  },
  {
    id: 'carrier', name: 'Carrier, Bryant and Payne furnaces and air conditioners', brands: 'Carrier, Bryant, Payne',
    status: 'community', rule: 'Digits 1–2 = week (01–53), digits 3–4 = year. Used for roughly the last 20+ years; older units use letters and single digits.',
    source: 'https://forum.nachi.org/t/need-help-with-an-age-of-a-bryant/9895', sourceName: 'InterNACHI inspectors’ forum (not the maker)',
    tests: [['3298A12345', 1998, 8], ['1020E54321', 2020, 3]],
    decode(s, now) {
      const m = /^(\d\d)(\d\d)/.exec(s); if (!m) return [];
      const wk = +m[1], yy = +m[2]; if (wk < 1 || wk > 53) return [];
      const yr = yy >= 90 ? 1900 + yy : 2000 + yy; if (yr > now) return [];
      return [{ year: yr, month: weekToMonth(wk), week: wk, note: 'Community-documented rule; not confirmed by the maker.' }];
    }
  },
  {
    id: 'goodman', name: 'Goodman and Amana furnaces and air conditioners', brands: 'Goodman, Amana',
    status: 'community', rule: 'Digits 1–2 = year, digits 3–4 = month (01–12). Serials are 10 digits long on current units.',
    source: 'https://www.pickhvac.com/hvac/age-serial-number/goodman/', sourceName: 'Third-party HVAC guide (not the maker)',
    tests: [['0408523981', 2004, 8], ['1811000001', 2018, 11]],
    decode(s, now) {
      const m = /^(\d\d)(\d\d)/.exec(s); if (!m) return [];
      const yy = +m[1], mo = +m[2]; if (mo < 1 || mo > 12) return [];
      const yr = yy >= 90 ? 1900 + yy : 2000 + yy; if (yr > now) return [];
      return [{ year: yr, month: mo, note: 'Community-documented rule; not confirmed by the maker.' }];
    }
  },
  {
    id: 'lennox', name: 'Lennox furnaces and air conditioners', brands: 'Lennox',
    status: 'community', rule: 'Digits 1\u20132 = plant code, digits 3\u20134 = year, character 5 = month letter (A = January \u2026 M = December, skipping I). Ten-character serials, in use since 1973.',
    source: 'https://forum.nachi.org/t/lennox-age/7123', sourceName: 'InterNACHI forum and HVAC guides (not the maker)',
    tests: [['1606B13871', 2006, 2], ['5899L17212', 1999, 11], ['5621M99989', 2021, 12]],
    decode(s, now) {
      const m = /^\d\d(\d\d)([A-HJ-M])/.exec(s); if (!m) return [];
      const yy = +m[1], yr = yy >= 73 ? 1900 + yy : 2000 + yy; if (yr > now) return [];
      return [{ year: yr, month: BW_MONTHS.indexOf(m[2]) + 1, note: 'Community-documented rule; not confirmed by the maker.' }];
    }
  },
  {
    id: 'rheem', name: 'Rheem and Ruud water heaters', brands: 'Rheem, Ruud',
    status: 'manufacturer', rule: 'Digits 1\u20132 = month (01\u201312), digits 3\u20134 = year, then a plant-line letter and the sequence number. Example: 1209D01234 = December 2009. Rheem\u2019s page covers current serials only.',
    source: 'https://www.rheem.com/how-to-locate-and-read-your-rheem-water-heating-serial-numbers/', sourceName: 'Rheem, "How to Locate and Read your Rheem Water Heating Serial Numbers"',
    tests: [['1209D01234', 2009, 12], ['0514A55555', 2014, 5]],
    decode(s, now) {
      const m = /^(\d\d)(\d\d)/.exec(s); if (!m) return [];
      const mo = +m[1], yy = +m[2]; if (mo < 1 || mo > 12) return [];
      const yr = yy >= 90 ? 1900 + yy : 2000 + yy; if (yr > now) return [];
      return [{ year: yr, month: mo, note: yr < 2000 ? 'This format is documented for current units; a 1990s date may mean an older scheme.' : '' }];
    }
  }
];

function decodeSerial(raw, brandId, now) {
  const s = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (s.length < 4) return [];
  const res = [];
  for (const f of FAMILIES) {
    if (brandId && brandId !== 'any' && brandId !== f.id) continue;
    const d = f.decode(s, now);
    if (d.length) res.push({ family: f, dates: d });
  }
  return res;
}
if (typeof module !== 'undefined') module.exports = { FAMILIES, decodeSerial, weekToMonth };
