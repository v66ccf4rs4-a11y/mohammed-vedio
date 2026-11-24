const { chromium } = require('playwright');
const out = process.argv[2], F = '/tmp/claude-0/fonts';
const css = `
@font-face{font-family:Amiri;src:url(file://${F}/f1.ttf)}
@font-face{font-family:Amiri;font-weight:700;src:url(file://${F}/f2.ttf)}
@font-face{font-family:Kufi;font-weight:500;src:url(file://${F}/f3.ttf)}
@font-face{font-family:Kufi;font-weight:700;src:url(file://${F}/f4.ttf)}
html,body{margin:0;width:1080px;height:1920px;background:transparent;overflow:hidden}
body{position:relative;color:#fff;direction:rtl}
.gold{color:#E9B630}
.shadow{text-shadow:0 4px 30px rgba(0,0,0,.65)}
`;
const cards = {
 title: `<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;width:900px">
   <div style="margin:0 auto 70px;width:120px;height:170px;border:14px solid #E9B630;box-sizing:border-box"></div>
   <div class="shadow" style="font:700 150px/1.2 Amiri">حكايةُ البرّية</div>
   <div style="margin:36px auto;width:260px;height:3px;background:#E9B630"></div>
   <div class="shadow gold" style="font:500 46px/1 Kufi;letter-spacing:4px">فيلمٌ وثائقي</div></div>`,
 end: `<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;width:900px">
   <div style="margin:0 auto 60px;width:84px;height:120px;border:10px solid #E9B630;box-sizing:border-box"></div>
   <div class="shadow" style="font:700 120px/1.2 Amiri">النهاية</div>
   <div style="margin:30px auto;width:200px;height:3px;background:#E9B630"></div>
   <div class="shadow" style="font:500 40px/1.6 Kufi;opacity:.9">حكايةُ البرّية</div></div>`,
};
const chapters = [['١','الترقُّب'],['٢','حيث يولد الماء'],['٣','طائرُ الجنّة'],['٤','سادةُ السماء'],['٥','حين تغيبُ الشمس']];
chapters.forEach(([n,t],i)=>{
 cards['ch'+(i+1)] = `<div style="position:absolute;right:80px;bottom:300px;display:flex;align-items:stretch;gap:28px">
   <div style="width:12px;background:#E9B630"></div>
   <div><div class="shadow gold" style="font:500 34px/1 Kufi;letter-spacing:3px;margin-bottom:22px">الفصل ${n}</div>
   <div class="shadow" style="font:700 92px/1.15 Amiri">${t}</div></div></div>`;
});
(async()=>{
 const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1080,height:1920}});
 for (const [k,html] of Object.entries(cards)) {
   await p.setContent(`<style>${css}</style>${html}`); await p.evaluate(()=>document.fonts.ready);
   await p.screenshot({path:`${out}/${k}.png`, omitBackground:true});
 }
 await b.close();
})();
