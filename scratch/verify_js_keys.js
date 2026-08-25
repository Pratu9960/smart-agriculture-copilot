const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sandbox = { window: {}, document: { addEventListener: () => {} }, localStorage: { getItem: () => null, setItem: () => {} } };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('frontend/js/language.js', 'utf8'), sandbox);

const translations = sandbox.window.LanguageModule.translations;
const langs = ['en', 'mr', 'hi', 'ta', 'te'];

const jsFiles = [
  'frontend/js/weather.js',
  'frontend/js/schemes.js',
  'frontend/js/app.js',
  'frontend/js/market.js',
  'frontend/js/history.js',
  'frontend/js/profile.js',
  'frontend/js/camera.js',
  'frontend/js/offline.js',
  'frontend/js/api.js'
];

const jsKeys = new Set();
const keyRegex = /(?:\.t|\bi18n\.t|LanguageModule\.t)\s*\(\s*['"]([a-zA-Z0-9_.]+)['"]/g;

for (const f of jsFiles) {
  if (fs.existsSync(f)) {
    const code = fs.readFileSync(f, 'utf8');
    let m;
    while ((m = keyRegex.exec(code)) !== null) {
      jsKeys.add(m[1]);
    }
  }
}

console.log(`Found ${jsKeys.size} distinct i18n keys called directly in JS:`);
const missing = [];
for (const key of jsKeys) {
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
  console.log('SUCCESS: All ' + jsKeys.size + ' JS translation keys exist across all 5 languages!');
} else {
  console.error('ERROR: Missing JS keys found:', JSON.stringify(missing, null, 2));
  process.exit(1);
}
