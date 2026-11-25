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
  let started = false;
  while (Date.now() - t0 < 900000) {
    await p.waitForTimeout(1500);
    const busy = await p.getByRole('button', {name: /abort/i}).isVisible().catch(() => false);
    if (busy) started = true;
    if (started && !busy) break;
    if (!started && Date.now() - t0 > 20000) break;
  }
  await p.waitForTimeout(3000); // let the FFmpeg exporter finalise the file
  await b.close();
  if (!fs.existsSync(out) || fs.statSync(out).mtimeMs <= before || fs.statSync(out).size < 10000) { console.error('render failed'); process.exit(1); }
  console.log('rendered', out);
})();
