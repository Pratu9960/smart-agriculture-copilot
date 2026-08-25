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
vm.runInContext(fs.readFileSync('frontend/js/schemes.js', 'utf8'), sandbox);

const langs = ['en', 'mr', 'hi', 'ta', 'te'];
const testCategories = ['Direct Benefit & Income Support', 'Crop Insurance', 'Irrigation & Water', 'Soil & Fertilizer', 'Credit & Loans'];

for (const lang of langs) {
  sandbox.window.LanguageModule.setLanguage(lang);
  console.log(`\n=== Schemes in ${lang.toUpperCase()} ===`);
  console.log('  Count 8 Schemes:', sandbox.window.SchemesModule.t('schemes.countLabel', { count: 8 }));
  console.log('  All Categories:', sandbox.window.SchemesModule.translateCategory('all'));
  for (const cat of testCategories) {
    console.log(`  Category [${cat}]:`, sandbox.window.SchemesModule.translateCategory(cat));
  }
  console.log('  Question 1 (Landowner):', sandbox.window.SchemesModule.t('schemes.qLandowner'));
  console.log('  Yes / No:', `${sandbox.window.SchemesModule.t('schemes.yes')} / ${sandbox.window.SchemesModule.t('schemes.no')}`);
  console.log('  Eligible Title:', sandbox.window.SchemesModule.t('schemes.eligibleTitle'));
  console.log('  Not Eligible Title:', sandbox.window.SchemesModule.t('schemes.notEligibleTitle'));
}
