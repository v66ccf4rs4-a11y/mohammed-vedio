// Headless Motion Canvas render: opens the editor in Chromium and presses "Render".
// Usage: node tools/render.cjs [port]   -> output/project.mp4
const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const port = process.argv[2] || '9000';
  const out = path.join(__dirname, '..', 'output', 'project.mp4');
  const before = fs.existsSync(out) ? fs.statSync(out).mtimeMs : 0;
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 1600, height: 1000}});
  p.on('pageerror', e => console.log('page error:', e.message));
  await p.goto(`http://localhost:${port}/`, {waitUntil: 'networkidle'});
  await p.waitForTimeout(2500);
  const render = p.getByRole('button', {name: 'Render', exact: true});
  if (!(await render.isVisible())) await p.click('button[title="Video Settings"]');
  await render.click();
  const t0 = Date.now();
  let started = false, lastSize = -1, stable = 0;
  while (Date.now() - t0 < 900000) {
    await new Promise(r => setTimeout(r, 1500));
    const busy = await Promise.race([
      p.getByRole('button', {name: /abort/i}).isVisible().catch(() => false),
      new Promise(r => setTimeout(() => r(null), 3000)),
    ]);
    if (busy) started = true;
    // finished when the exported file is new and its size has stopped changing
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs > before) {
      const size = fs.statSync(out).size;
      stable = size === lastSize && size > 10000 ? stable + 1 : 0;
      lastSize = size;
      if (stable >= 3 && busy !== true) break;
    }
    if (!started && Date.now() - t0 > 60000 && !fs.existsSync(out)) break;
  }
  await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]);
  if (!fs.existsSync(out) || fs.statSync(out).mtimeMs <= before || fs.statSync(out).size < 10000) { console.error('render failed'); process.exit(1); }
  console.log('rendered', out);
  process.exit(0);
})();
