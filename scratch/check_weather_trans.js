const fs = require('fs');
const vm = require('vm');
const sandbox = {
  window: { dispatchEvent: () => {} },
  document: { documentElement: { lang: 'en' }, addEventListener: () => {}, dispatchEvent: () => {}, querySelectorAll: () => [], querySelector: () => null, getElementById: () => null },
  localStorage: { getItem: () => null, setItem: () => {} },
  navigator: { onLine: true },
  CustomEvent: class CustomEvent { constructor(name, opts) { this.detail = opts ? opts.detail : {}; } },
  console
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('frontend/js/language.js', 'utf8'), sandbox);
vm.runInContext(fs.readFileSync('frontend/js/weather.js', 'utf8'), sandbox);

const langs = ['en', 'mr', 'hi', 'ta', 'te'];
for (const lang of langs) {
  sandbox.window.LanguageModule.setLanguage(lang);
  console.log(`Lang: ${lang}`);
  console.log('  Condition (Clear Sky):', sandbox.window.WeatherModule.translateCondition('Clear Sky'));
  console.log('  Advisory Rain Likely:', sandbox.window.WeatherModule.t('weather.advisoryRainLikelyHeadline'));
  console.log('  Advisory Recommendation:', sandbox.window.WeatherModule.t('weather.advisoryRainLikelyRec'));
}
