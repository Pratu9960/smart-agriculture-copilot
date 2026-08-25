
const fs = require('fs');
const content = fs.readFileSync('frontend/js/language.js', 'utf8');
const vm = require('vm');
const sandbox = { window: {}, document: { addEventListener: () => {} }, localStorage: { getItem: () => null, setItem: () => {} } };
vm.createContext(sandbox);
vm.runInContext(content, sandbox);
const t = sandbox.LanguageModule.translations;
const langs = ['en', 'mr', 'hi', 'ta', 'te'];
const report = {};
for (const l of langs) {
    report[l] = {
        weather_keys: Object.keys(t[l].weather || {}),
        schemes_keys: Object.keys(t[l].schemes || {})
    };
}
console.log(JSON.stringify(report, null, 2));
