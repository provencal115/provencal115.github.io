const fs = require("fs");
fetch("http://127.0.0.1:9333/json")
  .then((r) => r.json())
  .then(async (list) => {
    const page = list.find((t) => t.type === "page");
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let id = 0;
    const pending = new Map();
    const send = (method, params = {}) => {
      const msgId = ++id;
      return new Promise((res) => {
        pending.set(msgId, res);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    };
    ws.addEventListener("message", (ev) => {
      const data = JSON.parse(ev.data);
      if (data.id && pending.has(data.id)) {
        pending.get(data.id)(data);
        pending.delete(data.id);
      }
    });
    await new Promise((r) => ws.addEventListener("open", r));
    const width = Number(process.argv[2] || 1280);
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width < 800,
    });
    await send("Page.navigate", { url: "http://localhost/personalprofile/?scan=1" });
    await new Promise((r) => setTimeout(r, 1200));
    const expression = `(() => {
      const text = document.body.innerText;
      const lines = text.split(/\\n/).map(l => l.trim()).filter(Boolean);
      const bad = lines.filter(l => /svg|SWWaste|localhost|^\\d+\\.\\s/i.test(l));
      const buttons = [...document.querySelectorAll('a.btn, button')].map(el => el.innerText.replace(/\\s+/g,' ').trim());
      const covers = [...document.querySelectorAll('.project-cover')].map(el => el.innerText.replace(/\\s+/g,' ').trim());
      const markers = [...document.querySelectorAll('#experience ol > li, #education ol > li')].map(li => getComputedStyle(li, '::marker').content);
      const local = [...document.querySelectorAll('a')].map(a => a.getAttribute('href')).filter(h => h && /localhost/i.test(h));
      const hidden = [...document.querySelectorAll('.sr-only')].map(el => {
        const r = el.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height), t: el.textContent.trim().slice(0, 40) };
      });
      const icons = [...document.querySelectorAll('a.btn svg, .icon-btn svg')].map(el => {
        const r = el.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height), text: el.textContent.trim() };
      });
      return { bad, buttons, covers, markers, local, hidden, icons };
    })()`;
    const res = await send("Runtime.evaluate", { expression, returnByValue: true });
    console.log(JSON.stringify(res.result.result.value, null, 2));
    const h = await send("Runtime.evaluate", {
      expression: "document.documentElement.scrollHeight",
      returnByValue: true,
    });
    const full = Math.min(h.result.result.value, 9000);
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: full,
      deviceScaleFactor: 1,
      mobile: width < 800,
    });
    const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
    fs.writeFileSync(process.argv[4] || "_shot.png", Buffer.from(shot.result.data, "base64"));
    ws.close();
  })
  .catch((e) => { console.error(e); process.exit(1); });
