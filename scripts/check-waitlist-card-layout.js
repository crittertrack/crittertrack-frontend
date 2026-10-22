// Renders a waitlist card (matching ReservationsPage.jsx) in Chromium and measures
// the gap between the last action button and the card's right edge.
// Run with: node scripts/check-waitlist-card-layout.js
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Grab ALL compiled CSS (Tailwind utilities live in main.*.css) so utility classes resolve.
const cssFiles = fs.readdirSync(path.join(__dirname, '..', 'build', 'static', 'css'))
    .filter(f => f.endsWith('.css'));
const css = cssFiles.map(f => fs.readFileSync(path.join(__dirname, '..', 'build', 'static', 'css', f), 'utf8')).join('\n');

const CARD = `
<style>${css}</style>
<div id="wrapper" style="background:#e5e7eb;padding:16px">
  <div id="card" class="bg-white dark:bg-dark-card-bg rounded-xl shadow-lg overflow-hidden" style="width:320px">
    <div class="p-3 sm:p-4 space-y-2.5">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-start gap-2 min-w-0 flex-1">
          <span class="text-xs font-bold text-gray-500 shrink-0 rounded-md px-1.5 py-0.5 bg-gray-100">#1</span>
          <div class="font-semibold text-gray-800 min-w-0 break-words">Alexandra Featherstonehaugh</div>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button class="flex items-center gap-1 text-xs text-gray-500 px-2 py-1.5 rounded-lg">Up</button>
          <button class="flex items-center gap-1 text-xs text-gray-500 px-2 py-1.5 rounded-lg">Down</button>
        </div>
      </div>
      <div class="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">Fulfilled</span>
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-xs font-medium text-gray-700">Species:</span>
            <span class="text-xs text-gray-600">Fancy Rat</span>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 pt-2 border-t border-gray-100">
          <span class="inline-flex items-center gap-1"><span class="font-medium text-amber-700">$25</span><span class="text-gray-500">deposit due</span></span>
          <span class="inline-flex items-center gap-1"><span class="font-medium text-amber-700">$50</span><span class="text-gray-500">payment due</span></span>
        </div>
      </div>
      <div class="w-full min-w-0 border-t border-gray-100 mt-2 pt-2 pb-1 sm:pb-2 pr-2 sm:pr-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-1"></div>
          <div class="flex flex-wrap items-center justify-end gap-1 ml-auto">
            <button class="flex items-center gap-1 text-xs text-gray-500 px-2 py-1.5 rounded-lg">Edit</button>
            <button class="flex items-center gap-1 text-xs text-red-500 px-2 py-1.5 rounded-lg">Delete</button>
            <button id="finalize" class="flex items-center gap-1 text-xs font-medium text-white bg-green-600 px-3 py-1.5 rounded-lg">Finalize</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 420, height: 800 });
    await page.setContent(`<!doctype html><html><body>${CARD}</body></html>`);
    let card = await page.locator('#card').boundingBox();
    let finalize = await page.locator('#finalize').boundingBox();
    let gap = (card.x + card.width) - (finalize.x + finalize.width);
    console.log('[mobile 420px] Finalize gap to card edge:', gap.toFixed(2), 'px');

    // Desktop / sm breakpoint = 640px min -> p-4 + pr-3 apply.
    await page.setViewportSize({ width: 768, height: 1000 });
    card = await page.locator('#card').boundingBox();
    finalize = await page.locator('#finalize').boundingBox();
    gap = (card.x + card.width) - (finalize.x + finalize.width);
    console.log('[desktop 768px] Finalize gap to card edge:', gap.toFixed(2), 'px');

    await page.screenshot({ path: 'scripts/waitlist-card-layout.png', fullPage: true });
    await browser.close();
})();

