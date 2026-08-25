const fs = require('fs');
const html = fs.readFileSync('frontend/index.html', 'utf8');
const vm = require('vm');
const sandbox = { window: {}, document: { addEventListener: () => {} }, localStorage: { getItem: () => null, setItem: () => {} } };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('frontend/js/language.js', 'utf8'), sandbox);

const translations = sandbox.window.LanguageModule.translations;
const langs = ['en', 'mr', 'hi', 'ta', 'te'];

// Match all data-i18n="..."
const matches = [];
const regex = /data-i18n=["']([^"']+)["']/g;
let m;
while ((m = regex.exec(html)) !== null) {
  matches.push(m[1]);
}

console.log('Found ' + matches.length + ' data-i18n attributes in index.html');

const missing = [];
for (const key of matches) {
  const parts = key.split('.');
  for (const lang of langs) {
    let cur = translations[lang];
    for (const p of parts) {
      cur = cur ? cur[p] : undefined;
    }
    if (cur === undefined) {
      missing.push({ lang, key });
    }
  }
}

if (missing.length === 0) {
  console.log('SUCCESS: All ' + matches.length + ' data-i18n keys exist across all 5 languages (en, mr, hi, ta, te)!');
} else {
  console.error('ERROR: Missing keys found:', JSON.stringify(missing, null, 2));
  process.exit(1);
}
