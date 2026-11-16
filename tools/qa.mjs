// QA/QC trước khi đẩy:  node tools/qa.mjs   (thoát mã 1 nếu có mục ❌)
// QA = mã & kho (cú pháp, file tham chiếu, dung lượng, lộ khoá, sw.js). QC = thành phẩm chạy thật trong Chrome headless
// (4 cỡ màn không tràn ngang · nút đủ to · không lỗi console · nhân vật + video chạy · bảng cảnh · mọi tổ hợp
// buổi×thời tiết×mùa · đèn sáng đêm tắt ngày · luật ngôn ngữ). Không cần điện thoại; fps trên máy thật vẫn phải đo riêng.
import fs from 'fs'; import path from 'path'; import http from 'http'; import { spawn, execSync } from 'child_process';
const ROOT = path.resolve(import.meta.dirname, '..'), CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = process.env.QA_PROFILE || path.resolve(ROOT, '..', '_tmp-sam', 'chrome-qa-' + Date.now()), PORT = 8771, DBG = 9571;
const res = []; const ok = (n, d = '') => res.push(['✅', n, d]), bad = (n, d = '') => res.push(['❌', n, d]), warn = (n, d = '') => res.push(['⚠️', n, d]);
const check = (c, n, d = '') => c ? ok(n) : bad(n, d);
const okList = x => Array.isArray(x) && !x.length; // đoạn kiểm văng lỗi / quá giờ trả về đối tượng, không phải danh sách → phải ĐỎ, không được xanh giả
const sh = c => { try { return execSync(c, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trimEnd(); } catch { return ''; } }; // trimEnd (không trim): dòng đầu của git status bắt đầu bằng khoảng trắng
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8'), size = f => fs.statSync(path.join(ROOT, f)).size;

// ───────── QA: mã & kho ─────────
const html = read('index.html'), mjs = fs.readdirSync(ROOT).filter(f => f.endsWith('.mjs'));
const tmp = path.join(path.dirname(PROFILE), 'qa-tmp'); fs.mkdirSync(tmp, { recursive: true });
let n = 0; for (const f of mjs) { try { execSync(`node --check "${path.join(ROOT, f)}"`, { stdio: 'pipe' }); } catch (e) { n++; bad('cú pháp ' + f, String(e.stderr).split('\n').slice(0, 3).join(' ')); } }
[...html.matchAll(/<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/g)].forEach((m, i) => {
  if (/importmap/.test(m[1])) { try { JSON.parse(m[2]); } catch { n++; bad('importmap JSON hỏng'); } return; }
  const f = path.join(tmp, `inline${i}.mjs`); fs.writeFileSync(f, m[2]);
  try { execSync(`node --check "${f}"`, { stdio: 'pipe' }); } catch (e) { n++; bad(`cú pháp script #${i} trong index.html`, String(e.stderr).split('\n').slice(0, 3).join(' ')); }
});
if (!n) ok('cú pháp: ' + mjs.join(', ') + ' + script trong index.html');

const refs = new Set(); for (const src of [html, ...mjs.map(read), read('sw.js'), read('manifest.json')])
  for (const m of src.matchAll(/['"`(]((?:\.\/)?(?:bg\/[\w\-.${}]+|data\/[\w\-.]+\.js|[\w\-]+\.(?:glb|png|jpg|mp4|mjs|json|js)))(?:\?[^'"`)]*)?['"`)]/g)) refs.add(m[1].replace(/^\.\//, ''));
const miss = [...refs].filter(r => !r.includes('${') && !r.includes('<') && !fs.existsSync(path.join(ROOT, r)) && !/^(bg\/[\w-]+\.(jpg|mp4))$/.test(r));
check(!miss.length, `file tham chiếu đều có (${refs.size})`, miss.join(', '));
for (const p of ['ngay', 'chieu', 'dem']) check(fs.existsSync(path.join(ROOT, `bg/${p}.jpg`)), `tranh tĩnh dự phòng bg/${p}.jpg`);
const bg = fs.readdirSync(path.join(ROOT, 'bg')), tot = bg.reduce((s, f) => s + size('bg/' + f), 0), big = bg.filter(f => size('bg/' + f) > 6e6);
check(tot < 22e6 && !big.length, `dung lượng bg/ ${(tot / 1e6).toFixed(1)} MB (trần 22, mỗi file ≤ 6)`, big.join(', '));
check(size('sam.glb') < 14e6, `sam.glb ${(size('sam.glb') / 1e6).toFixed(1)} MB (trần 14)`);
const files = sh('git ls-files').split('\n').filter(f => f && !/\.(png|jpg|mp4|glb|vrm)$/.test(f));
const leak = files.filter(f => /AIza[0-9A-Za-z_\-]{35}|sk-[A-Za-z0-9]{32,}|-----BEGIN [A-Z ]*PRIVATE KEY/.test(read(f)));
check(!leak.length, 'repo công khai: không lộ khoá API/khoá riêng', leak.join(', '));
const mails = files.filter(f => /[\w.]+@(pli|m2w)\.(com\.)?vn/.test(read(f))); check(!mails.length, 'repo công khai: không có email nội bộ', mails.join(', '));
// đặc tả (docs/) không được lệch: đủ 8 phần + mọi tệp `tools/...`/`bg/...` mà đặc tả nhắc phải còn tồn tại
const specDirs = ['01-engineering-intent', '02-product-requirements', '03-technical-spec', '04-api-and-data-design', '05-test-specification', '06-security-and-reliability', '07-deployment-and-monitoring', '08-maintenance-and-spec-drift'];
const noSpec = specDirs.filter(d => !fs.existsSync(path.join(ROOT, 'docs', d, 'README.md')));
const docTxt = [...specDirs.map(d => 'docs/' + d + '/README.md'), 'tasks/agent-task-list.md', 'tests/may-that.md'].filter(f => fs.existsSync(path.join(ROOT, f))).map(read).join('\n');
const ghost = [...new Set([...docTxt.matchAll(/`((?:tools|bg)\/[\w\-.]+\.\w+)`/g)].map(m => m[1]))].filter(f => !fs.existsSync(path.join(ROOT, f)));
check(!noSpec.length && !ghost.length, 'đặc tả docs/ đủ 8 phần, không nhắc tệp không tồn tại', [...noSpec, ...ghost].join(', '));
const dirty = sh('git status --porcelain').split('\n').filter(Boolean).map(l => l.slice(3)), core = dirty.filter(f => /^(index\.html|xianxia\.mjs|mocap\.mjs|sam\.glb|bg\/)/.test(f));
check(!core.length || dirty.includes('sw.js'), 'sw.js đã tăng phiên bản khi đổi mã/nội dung', 'đổi ' + core.slice(0, 3).join(', ') + ' mà chưa tăng gia-su-vNN');
const headChanged = sh('git diff-tree --no-commit-id --name-only -r HEAD').split('\n').filter(Boolean), headCore = headChanged.filter(f => /^(index\.html|xianxia\.mjs|mocap\.mjs|sam\.glb|bg\/|data\/)/.test(f));
const swHead = sh('git show HEAD:sw.js').match(/gia-su-v(\d+)/)?.[1], swPrev = sh('git show HEAD^:sw.js').match(/gia-su-v(\d+)/)?.[1];
const swWork = read('sw.js').match(/gia-su-v(\d+)/)?.[1], releaseBump = core.length ? dirty.includes('sw.js') && +swWork > +swHead : !headCore.length || (headChanged.includes('sw.js') && +swHead > +swPrev);
check(releaseBump, 'app đổi thì tăng phiên bản sw.js', `worktree ${swHead} → ${swWork}; commit ${swPrev} → ${swHead}`);
const ahead = sh('git log origin/main..HEAD --oneline'); ahead ? warn('có commit chưa đẩy', ahead.split('\n').length + ' commit') : ok('mọi commit đã đẩy');
const branch = files.filter(f => /\.(?:html|mjs|js)$/.test(f)).flatMap(f => [...read(f).matchAll(/cdn\.jsdelivr\.net\/(?:gh|npm)\/[^"'`\s]+?@(?:main|master|latest)\//g)].map(m => f + ': ' + m[0]));
check(!branch.length, 'mã nạp từ CDN khoá đúng phiên bản (không @main/@master/@latest)', branch.join(', '));
check(/addEventListener\('activate'[\s\S]*caches\.delete/.test(read('sw.js')), 'service worker xoá cache phiên bản cũ khi kích hoạt');
const cached = new Set([...read('sw.js').matchAll(/['"]((?:data|bg)\/[^'"]+|(?:index\.html|manifest\.json|sam-(?:192|512)\.png|sam\.glb|xianxia\.mjs|mocap\.mjs))['"]/g)].map(m => m[1]));
const cacheNeed = ['index.html','manifest.json','sam-192.png','sam-512.png','xianxia.mjs','mocap.mjs',...fs.readdirSync(path.join(ROOT,'data')).map(f=>'data/'+f)], cacheBig = [...cached].filter(f => f === 'sam.glb' || f.startsWith('bg/'));
check(cacheNeed.every(f => cached.has(f)) && !cacheBig.length, 'service worker lưu sẵn đủ vỏ app, không lưu sẵn tệp lớn', [...cacheNeed.filter(f => !cached.has(f)), ...cacheBig.map(f => 'lớn: ' + f)].join(', '));
const sw = read('sw.js').match(/gia-su-v(\d+)/)?.[1]; const sw0 = sh('git show HEAD:sw.js').match(/gia-su-v(\d+)/)?.[1]; if (sw && sw0 && +sw < +sw0) bad('sw.js lùi phiên bản', `${sw0} → ${sw}`);

// ───────── QC: chạy thật ─────────
const MIME = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html')); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404).end(); return; }
  const s = fs.statSync(p), m = /bytes=(\d+)-(\d*)/.exec(q.headers.range || ''), h = { 'content-type': MIME[path.extname(p)] || 'application/octet-stream', 'accept-ranges': 'bytes', 'cache-control': 'no-store' };
  if (m) { const a = +m[1], b = m[2] ? +m[2] : s.size - 1; r.writeHead(206, { ...h, 'content-range': `bytes ${a}-${b}/${s.size}`, 'content-length': b - a + 1 }); fs.createReadStream(p, { start: a, end: b }).pipe(r); }
  else { r.writeHead(200, { ...h, 'content-length': s.size }); fs.createReadStream(p).pipe(r); }
}).listen(PORT);
for (const d of fs.readdirSync(path.dirname(PROFILE)).filter(d => /^chrome-qa-\d+$/.test(d))) try { fs.rmSync(path.join(path.dirname(PROFILE), d), { recursive: true, force: true }); } catch {} // dọn hồ sơ các lần chạy trước (hồ sơ mỗi lần một thư mục riêng để khỏi vướng khoá)
const chrome = spawn(CHROME, ['--headless=new', `--user-data-dir=${PROFILE}`, `--remote-debugging-port=${DBG}`, '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let page; for (let i = 0; i < 40 && !page; i++) { await sleep(500); try { page = (await (await fetch(`http://localhost:${DBG}/json/list`)).json()).find(t => t.type === 'page'); } catch {} }
const finish = async () => {
  try { const v = await (await fetch(`http://localhost:${DBG}/json/version`)).json(); const w = new WebSocket(v.webSocketDebuggerUrl); w.onopen = () => w.send('{"id":1,"method":"Browser.close"}'); await sleep(800); } catch {}
  srv.close(); try { execSync(`taskkill /F /T /PID ${chrome.pid}`, { stdio: 'ignore' }); } catch {} chrome.kill(); // Chrome headless hay sót tiến trình con
  const w = Math.max(...res.map(r => r[1].length)); for (const [i, nme, d] of res) console.log(`${i} ${nme}${d ? '  — ' + d : ''}`);
  const f = res.filter(r => r[0] === '❌').length; console.log(`\n${f ? '❌ ' + f + ' mục hỏng' : '✅ QA/QC đạt'} · ${res.filter(r => r[0] === '⚠️').length} cảnh báo · ${res.length} mục`); process.exit(f ? 1 : 0);
};
if (!page) { bad('khởi động Chrome headless'); await finish(); }
const ws = new WebSocket(page.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = {}, errs = [];
ws.onmessage = e => { const m = JSON.parse(e.data);
  if (pend[m.id]) { pend[m.id](m.result ?? m.error); delete pend[m.id]; }
  else if (m.method === 'Runtime.exceptionThrown') errs.push('exception: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
  else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !/favicon|the server responded with a status of 404/.test(m.params.entry.text + m.params.entry.url)) errs.push('console: ' + m.params.entry.text.slice(0, 140) + ' ' + (m.params.entry.url || '').split('/').pop());
};
const send = (method, params = {}) => new Promise(r => { pend[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expr, t = 60000) => { const r = await Promise.race([send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }), sleep(t).then(() => ({ result: { value: { timeout: true } } }))]); return r?.exceptionDetails ? { error: r.exceptionDetails.exception?.description?.split('\n')[0] } : r?.result?.value; };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
const open = async (w, h) => { await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: w < 600 }); await send('Page.navigate', { url: `http://localhost:${PORT}/` }); await sleep(1500);
  for (let i = 0; i < 60 && await ev("typeof window.Avatar") !== 'object'; i++) await sleep(500); }; // chờ module + thư viện CDN nạp xong
await send('Page.navigate', { url: `http://localhost:${PORT}/` }); await sleep(1500);
await ev(`localStorage.setItem('gs_key', JSON.stringify('qa')); localStorage.setItem('wx','quang'); localStorage.setItem('dn','ngay'); localStorage.setItem('dh','1'); localStorage.removeItem('kv'); 1`);

// bố cục + nút ở 4 cỡ màn
const LAYOUT = `(()=>{const cw=document.documentElement.clientWidth,ch=document.documentElement.clientHeight,out=[];
  const vis=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
  document.querySelectorAll('header *, nav *, footer *, #call *, #chat *').forEach(e=>{if(!vis(e)||e.closest('canvas')||e.tagName==='CANVAS')return;const r=e.getBoundingClientRect();
    if(r.right>cw+1||r.left<-1)out.push('tràn ngang: '+(e.id||e.className||e.tagName)+' '+Math.round(r.left)+'..'+Math.round(r.right))});
  const small=[...document.querySelectorAll('button')].filter(b=>vis(b)&&!b.closest('dialog')&&!b.closest('#scenePanel')).filter(b=>{const r=b.getBoundingClientRect();return Math.min(r.width,r.height)<40}).map(b=>(b.id||b.textContent.trim().slice(0,12))+' '+Math.round(b.getBoundingClientRect().width)+'x'+Math.round(b.getBoundingClientRect().height));
  return {sw:document.documentElement.scrollWidth,cw,over:out.slice(0,4),small}})()`;
for (const [w, h] of [[360, 740], [393, 873], [412, 915], [1280, 800]]) {
  await open(w, h); const r = await ev(LAYOUT);
  check(r && r.sw <= r.cw && !r.over?.length, `${w}×${h}: không tràn ngang`, r ? `scrollWidth ${r.sw}>${r.cw} ${r.over?.join('; ')}` : 'không đo được');
  check(r && !r.small?.length, `${w}×${h}: nút đủ to cho ngón tay (≥40px)`, r?.small?.join('; '));
}

// nhân vật + cảnh (khổ Redmi)
await open(393, 873);
const init = await ev(`(async()=>{try{const t0=performance.now();const ok=await window.Avatar.init();return {ok,ms:Math.round(performance.now()-t0)}}catch(e){return {err:e.message}}})()`, 120000);
check(init?.ok === true, 'nhân vật 3D nạp được', JSON.stringify(init)); if (init?.ms > 25000) warn('nạp nhân vật chậm trên máy này', init.ms + ' ms');
const vw = await ev(`(async()=>{const h=window.Avatar.head,t=performance.now(),has=()=>{let c=0;h.scene.traverse(o=>{if(o.material?.map?.isVideoTexture)c++});return c};
  while(performance.now()-t<40000&&!has())await new Promise(r=>setTimeout(r,500));await new Promise(r=>setTimeout(r,1500));return +((performance.now()-t)/1000).toFixed(1)})()`, 60000);  // chờ video nền tải xong
if (vw > 15) warn('video nền tải chậm trong Chrome ngầm', vw + ' s');
const scene = await ev(`(()=>{const h=window.Avatar.head,env=h.scene.getObjectByName('xianxia'),vids=new Set();h.scene.traverse(o=>{const m=o.material?.map;if(m?.isVideoTexture)vids.add(m.image)});
  const v=[...vids].map(x=>({src:x.src.split('/').pop(),w:x.videoWidth,paused:x.paused,t:x.currentTime}));
  let plat=0,lights=0;h.scene.traverse(o=>{if(o.isMesh&&o.geometry.attributes.position.count>15000)plat++;if(o.isPointLight)lights++});
  return {env:!!env,v,plat,lights,fov:h.camera.fov,btn:document.getElementById('sceneBtn')?.textContent}})()`);
check(scene?.env, 'cảnh tiên hiệp dựng được'); check(scene?.plat >= 1, 'bục 3D (bg/buc.glb) đã nạp'); check(scene?.lights >= 1, 'đèn điểm của đèn lồng có mặt');
check(scene?.v?.length >= 1 && scene.v.every(x => !x.paused && x.w >= 1280), 'video nền chạy, ≥ 720p', JSON.stringify(scene?.v));
const t1 = await ev(`(async()=>{const h=window.Avatar.head,s=new Set();h.scene.traverse(o=>{const m=o.material?.map;if(m?.isVideoTexture)s.add(m.image)});const v=[...s][0];if(!v)return null;const a=v.currentTime;for(let i=0;i<16&&v.currentTime-a<=.3;i++)await new Promise(r=>setTimeout(r,500));return +(v.currentTime-a).toFixed(2)})()`);
check(t1 > 0.3, 'video thực sự tiến khung hình (không đứng hình)', 'tiến ' + t1 + ' s trong tối đa 8 s');

// bảng cảnh
const panel = await ev(`(async()=>{const b=document.getElementById('sceneBtn'),p=document.getElementById('scenePanel');b.click();await new Promise(r=>setTimeout(r,200));const r=p.getBoundingClientRect(),cw=innerWidth,ch=innerHeight;
  const ok=!p.hidden&&r.left>=0&&r.right<=cw&&r.bottom<=ch;const seg=document.querySelectorAll('#segDn button,#segWx button').length,kv=document.getElementById('kvSel').options.length;
  document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));await new Promise(r=>setTimeout(r,200));return {ok,seg,kv,closed:p.hidden,note:document.getElementById('seasonNote').textContent}})()`);
check(panel?.ok, 'bảng chọn cảnh mở được, nằm gọn trong màn'); check(panel?.seg === 10 && panel?.kv === 10, 'bảng cảnh đủ nút (4 buổi + 6 thời tiết) và 10 khu vực', JSON.stringify(panel)); check(panel?.closed, 'bấm ra ngoài thì bảng tự đóng');

// mọi tổ hợp buổi × thời tiết × mùa, và đèn sáng đêm / tắt ngày
const combo = await ev(`(async()=>{const x=await import('./xianxia.mjs'),env=window.Avatar.head.scene.getObjectByName('xianxia'),u=env.userData,bad=[];let n=0;
  for(const p of Object.keys(x.PHASES))for(const w of Object.keys(x.WEATHERS))for(const s of Object.keys(x.SEASONS)){try{u.setPhase(p);u.setWeather(w);u.setSeason(s);n++}catch(e){bad.push(p+'/'+w+'/'+s+': '+e.message)}}
  const lamp=()=>{let v=-1;window.Avatar.head.scene.traverse(o=>{if(o.isPointLight)v=o.intensity});return +v.toFixed(2)};
  const until=async(f,ms=20000)=>{const t=performance.now();while(performance.now()-t<ms&&!f())await new Promise(r=>setTimeout(r,250));return +((performance.now()-t)/1000).toFixed(1)};  // chờ tween xong (Chrome ngầm vẽ chậm nên không chờ cố định)
  u.setWeather('quang');u.setPhase('dem');const tn=await until(()=>lamp()>1.15);const night=lamp();
  u.setPhase('ngay');const td=await until(()=>lamp()<.05);const day=lamp();
  u.setWeather('mua');u.setPhase('dem');await new Promise(r=>setTimeout(r,500));
  return {n,bad,night,day,tn,td}})()`, 90000);
check(combo?.n === 4 * 0 + 3 * 5 * 6 && !combo?.bad?.length, `mọi tổ hợp buổi×thời tiết×mùa chạy không lỗi (${combo?.n})`, combo?.bad?.slice(0, 2).join('; '));
check(combo?.night > 1.1 && combo?.day < 0.05, 'đèn lồng: đêm sáng, ngày tắt', `đêm ${combo?.night} (${combo?.tn}s) · ngày ${combo?.day} (${combo?.td}s)`);
// toàn thân + dù: chân Sam nằm trên hàng nút; mưa/tuyết thì dù mở, nằm gọn trong màn; hết mưa thì dù đóng
const FRAME = `(async()=>{const h=window.Avatar.head,u=window.samEnv.userData,{Vector3}=await import('three');
  const until=async(f,ms=25000)=>{const t=performance.now();while(performance.now()-t<ms&&!f())await new Promise(r=>setTimeout(r,250));return f()};
  const px=(v)=>{const p=v.clone().project(h.camera);return {x:(p.x+1)/2*innerWidth,y:(1-p.y)/2*innerHeight}};
  const foot=()=>{let y=0;for(const n of ['LeftToeBase','RightToeBase','LeftFoot','RightFoot']){const b=h.armature.getObjectByName(n),v=new Vector3();b.getWorldPosition(v);y=Math.max(y,px(v).y)}return y};
  const btn=document.getElementById('callIdle').getBoundingClientRect(), r={};
  u.setWeather('quang');u.setPhase('ngay');await until(()=>u.umb<.02&&h.camera.position.z<4.4);await new Promise(r=>setTimeout(r,1500));
  r.camClear=+h.camera.position.z.toFixed(1);r.footY=Math.round(foot());r.btnTop=Math.round(btn.top);r.umbClear=+u.umb.toFixed(2);
  u.setWeather('mua');r.opened=await until(()=>u.umb>.95&&h.camera.position.z>4.6);await new Promise(r=>setTimeout(r,1500));
  r.ready=u.umbReady();const P=u.umbPts();r.apexY=Math.round(px(P[0]).y);r.footRainY=Math.round(foot());r.rimL=Math.round(px(P[1]).x);r.rimR=Math.round(px(P[2]).x);r.umbRain=+u.umb.toFixed(2);
  u.hits=0;u.leak=0;await new Promise(r=>setTimeout(r,5000));r.hits=u.hits;r.leak=u.leak;  // mưa phải CHẠM tán dù, ít lọt xuống dưới
  u.setWeather('tuyet');const s0=u.snowAmt||0;await new Promise(r=>setTimeout(r,8000));r.umbSnow=+u.umb.toFixed(2);r.snowGain=+((u.snowAmt||0)-s0).toFixed(3);  // tuyết phải đọng lên tán
  u.setWeather('suong');r.closed=await until(()=>u.umb<.02);r.umbFog=+u.umb.toFixed(2);u.setWeather('quang');
  r.w=innerWidth;return r})()`;
const fr = await ev(FRAME, 120000);
check(fr && fr.footY < fr.btnTop - 4 && fr.footY > 0, 'toàn thân: thấy chân Sam (trời quang), nằm trên hàng nút', `chân y=${fr?.footY} · nút y=${fr?.btnTop}`);
check(fr?.opened && fr.ready && fr.umbRain > .95 && fr.umbSnow > .95, 'mưa/giông/tuyết: dù Magnific lơ lửng (đã nạp, mở hết cỡ)', JSON.stringify(fr));
check(fr?.hits > 20 && fr.leak < fr.hits * .3, 'vật lý hạt: giọt mưa chạm tán dù (không xuyên qua)', `chạm ${fr?.hits} · lọt ${fr?.leak}`);
check(fr?.snowGain > .01, 'vật lý hạt: tuyết đọng dần lên tán dù', 'tăng ' + fr?.snowGain);
check(fr?.apexY > 0 && fr.rimL > -20 && fr.rimR < fr.w + 20 && fr.footRainY < fr.btnTop - 4, 'có dù: cả tán dù + chân vẫn nằm trong màn', `đỉnh dù y=${fr?.apexY} · mép ${fr?.rimL}..${fr?.rimR}/${fr?.w} · chân ${fr?.footRainY}`);
check(fr?.umbClear < .05 && fr?.closed, 'trời quang/sương mù: dù đóng', `quang ${fr?.umbClear} · sương ${fr?.umbFog}`);
const seasons = await ev(`(async()=>{const x=await import('./xianxia.mjs'),r=[];const so=x.seasonOf;
  const exp=[['hn',3,'xuan'],['hn',6,'ha'],['hn',10,'thu'],['hn',12,'dong'],['sapa',1,'dong'],['hcm',1,'kho'],['hcm',6,'mua'],['hue',10,'mua'],['dng',5,'kho']];
  for(const [k,m,e] of exp)if(so(k,m)!==e)r.push(k+' tháng '+m+': '+so(k,m)+' ≠ '+e);
  for(const [k,s] of Object.entries(x.SEASONS)){const h=await fetch('bg/v-'+s.video+'.mp4',{method:'HEAD'});if(!h.ok||+h.headers.get('content-length')<1e5)r.push('thiếu video '+k)}
  for(const [k,[,la,lo]] of Object.entries(x.REGIONS))if(!(la>8&&la<24&&lo>102&&lo<110))r.push('toạ độ '+k+' ngoài Việt Nam');
  const w=[[0,'quang'],[3,'quang'],[45,'suong'],[61,'mua'],[81,'mua'],[75,'tuyet'],[95,'bao']];for(const [c,e] of w)if(x.wmoToWeather(c)!==e)r.push('WMO '+c);
  return r})()`);
check(okList(seasons), 'mùa theo vùng + video mỗi mùa + toạ độ + mã thời tiết WMO đúng', seasons?.join('; '));
const api = await ev(`fetch('https://api.open-meteo.com/v1/forecast?latitude=21.03&longitude=105.85&current=weather_code').then(r=>r.json()).then(j=>typeof j.current?.weather_code,()=>'offline')`);
api === 'number' ? ok('Open-Meteo trả thời tiết thật') : warn('không gọi được Open-Meteo', String(api));

// luật ngôn ngữ + hiển thị chat
const lang = await ev(`(()=>{const p=livePrompt(),r=[];if(!/SPEAK ONLY ENGLISH/.test(p))r.push('thiếu luật chỉ nói tiếng Anh');if(!/UNDERSTAND Vietnamese/.test(p))r.push('thiếu luật hiểu tiếng Việt');if(/speak like a young person from Saigon/.test(p))r.push('còn luật nói tiếng Việt miền Nam');
  for(const [t,e] of [['你好',true],['สวัสดี',true],['こんにちは',true],['안녕',true],['Привет',true],['Hello bạn ơi, khỏe hông?',false],['I am wiped out — nha!',false]])if(FOREIGN.test(t)!==e)r.push('FOREIGN '+t);
  render({role:'model',text:'💡 Người bản xứ sẽ nói: I am beat.\\nOh no!\\n✏️ Tự nhiên hơn: I went.\\n🗣 Say this'});const c=document.getElementById('chat').lastChild;
  if(!c.querySelector('.fix.tip'))r.push('dòng 💡 không có kiểu .fix.tip');if(!c.querySelector('.fix:not(.tip)'))r.push('dòng ✏️ không có kiểu .fix');if(!c.querySelector('.say'))r.push('dòng 🗣 không có kiểu .say');
  return r})()`);
check(okList(lang), 'Sam chỉ nói tiếng Anh · bộ lọc chữ lạ · hiển thị 💡 ✏️ 🗣', Array.isArray(lang) ? lang.join('; ') : JSON.stringify(lang));
const chat = await ev(`(()=>{const o=callMode,r=[];callMode='chat';mem=['Hôm nay bạn hơi mệt'];const p=livePrompt();callMode=o;mem=[];
  if(!/SPEAK ONLY ENGLISH/.test(p))r.push('chế độ tâm sự thiếu luật chỉ nói tiếng Anh');if(!/NOT A LESSON/.test(p))r.push('thiếu luật không dạy');if(/band|mock Speaking/.test(p))r.push('còn nội dung IELTS');if(!/Hôm nay bạn hơi mệt/.test(p))r.push('không nạp trí nhớ');
  const b=[...document.querySelectorAll('#segMode button')];if(b.length!==4)r.push('thiếu nút chế độ');
  callMode='chat';mem=['Sếp hay nhắn tối'];const t=systemPrompt();callMode=o;mem=[];
  if(/IELTS coach|band descriptors/.test(t))r.push('chat chữ Tâm sự còn nội dung IELTS');if(!/WORK REPLIES/.test(t)||!/A[)] /.test(t))r.push('thiếu mục soạn tin trả lời sếp');if(!/Sếp hay nhắn tối/.test(t))r.push('chat chữ không nạp trí nhớ');if(document.querySelectorAll('#segMode2 button').length!==4)r.push('thiếu nút chế độ trong tab chat');return r})()`);
check(okList(chat), 'chế độ Tâm sự: không dạy · không IELTS · nạp trí nhớ · chỉ nói tiếng Anh', Array.isArray(chat) ? chat.join('; ') : JSON.stringify(chat));
const zh = await ev(`(()=>{const o=callMode,r=[];callMode='zh';hskMem=['Hay sai thanh ba'];const v=livePrompt(),t=systemPrompt();callMode=o;hskMem=[];
  if(!/HSK 3/.test(v)||!/SPEAK MANDARIN/.test(v))r.push('prompt gọi thiếu HSK3/tiếng Trung');if(/SPEAK ONLY ENGLISH/.test(v))r.push('prompt tiếng Trung còn luật chỉ tiếng Anh');
  if(!/Hay sai thanh ba/.test(v)||!/Hay sai thanh ba/.test(t))r.push('không nạp ghi chú tiến độ');if(!/🗣 /.test(t))r.push('chat chữ thiếu dòng 🗣');
  if(FOREIGN_ZH.test('你好，我是Sam'))r.push('bộ lọc chặn chữ Hán khi học tiếng Trung');if(!FOREIGN_ZH.test('こんにちは')||!FOREIGN_ZH.test('안녕'))r.push('bộ lọc không bắt tiếng Nhật/Hàn');return r})()`);
const drill = await ev(`(()=>{const o=callMode;callMode='learn';const v=livePrompt(),t=systemPrompt();callMode=o;return [/PHRASE DRILL/.test(v)?'':'prompt gọi thiếu PHRASE DRILL',/PHRASE DRILL/.test(t)?'':'prompt chat thiếu PHRASE DRILL'].filter(Boolean)})()`);
check(okList(drill), 'chế độ Học: có cách dạy phrase drill (phản ứng hài + bắt nói lại)', Array.isArray(drill) ? drill.join('; ') : JSON.stringify(drill));
const roast = await ev(`(()=>{const o=callMode,r=[];callMode='roast';phrMem=['gội đầu = wash my hair'];const v=livePrompt(),t=systemPrompt();callMode=o;phrMem=[];
  for(const [n,x] of [['gọi',v],['chat',t]]){if(!/CỤC SÚC/.test(x))r.push(n+': thiếu vai cục súc');if(!/Nói lại coi/.test(x))r.push(n+': thiếu bắt nói lại');if(!/CỤC SÚC/.test(x)||!/IELTS/.test(x))r.push(n+': mất phần gia sư IELTS');if(!/AMERICAN/.test(x))r.push(n+': thiếu vai người Mỹ bản xứ');if(!/BILINGUAL/.test(x))r.push(n+': thiếu chửi song ngữ Anh–Việt');if(!/Never hateful/.test(x))r.push(n+': thiếu giới hạn an toàn');if(!/gội đầu = wash my hair/.test(x))r.push(n+': không nạp câu từng sai')}return r})()`);
check(okList(roast), 'chế độ Cục súc: chửi yêu song ngữ + bắt nói lại + giới hạn an toàn + nhớ câu sai', Array.isArray(roast) ? roast.join('; ') : JSON.stringify(roast));
const road2 = await ev(`(()=>{const r=[],ids=[...UNITS,...EXTRA].map(u=>u.id);
  if(GRAMMAR.length!==40||VOCAB.length!==40)r.push('thiếu bài ngữ pháp/từ vựng '+GRAMMAR.length+'/'+VOCAB.length);if(new Set(ids).size!==ids.length)r.push('trùng id bài');
  if(!unitById('G2-04')||!unitById('V3-01'))r.push('unitById không tìm thấy bài G/V');
  const u0=unit,m0=mode;unit='G2-04';let t=systemPrompt();if(!/GRAMMAR unit G2-04/.test(t))r.push('bài ngữ pháp dùng prompt sai');unit='V3-01';t=systemPrompt();if(!/VOCABULARY unit V3-01/.test(t)||!/<words>/.test(t))r.push('bài từ vựng thiếu thẻ words');unit='B5-01';t=systemPrompt();if(!/examiner rewards/.test(t))r.push('bài IELTS bị mất');unit=u0;
  if(cmdLabel('[LESSON G3-05]')?.indexOf('G3-05')<0&&!/Mạo từ/.test(cmdLabel('[LESSON G3-05]')||''))r.push('nhãn lệnh bài G không nhận');
  const v0=JSON.stringify(vocab),sc0=JSON.stringify(scores);vocab=[];addVocab(['Abandon = từ bỏ','abandon = trùng']);if(vocab.length!==1)r.push('addVocab không chống trùng');
  if(dueWords().length!==0)r.push('từ mới không được hẹn ngày mai');vocab[0].due='2000-01-01';if(dueWords().length!==1)r.push('từ đến hạn không hiện');
  reviewVocab({ok:['abandon']});if(vocab[0].box!==1||vocab[0].due<=new Date().toLocaleDateString('sv'))r.push('Leitner không lên hộp');reviewVocab({miss:['abandon']});if(vocab[0].box!==0)r.push('trả lời sai không về hộp 0');
  vocab=JSON.parse(v0);scores=JSON.parse(sc0);
  for(const k of ['G','V','R','I']){roadTab=k;try{renderRoad()}catch(e){r.push('renderRoad '+k+': '+e.message)}if(document.querySelectorAll('#road .card').length<3)r.push('lộ trình '+k+' ít thẻ');
    const small=[...document.querySelectorAll('#road button')].filter(b=>Math.min(b.offsetWidth,b.offsetHeight)<40&&b.offsetWidth>0).length;if(small&&k!=='I')r.push('lộ trình '+k+' có '+small+' nút nhỏ hơn 40px')}
  roadTab='I';return r})()`);
check(okList(road2), 'lộ trình Ngữ pháp + Từ vựng: 80 bài, prompt đúng loại, sổ từ Leitner, giao diện dựng được', Array.isArray(road2) ? road2.join('; ') : JSON.stringify(road2));
const rfx = await ev(`(()=>{const r=[];if(REFLEX.length!==30)r.push('thiếu bài phản xạ '+REFLEX.length);
  const o=callMode;callMode='learn';const v=livePrompt();callMode='roast';const w=livePrompt();callMode=o;if(!/REFLEX DRILL/.test(v)||!/REFLEX DRILL/.test(w))r.push('prompt gọi thiếu bài phản xạ (Học/Cục súc)');
  if(!LIVE_TOOLS[0].functionDeclarations.some(f=>f.name==='save_drill'))r.push('thiếu tool save_drill');
  const sc0=JSON.stringify(scores),lg0=JSON.stringify(reflexLog);const L={drill:'R1-03',reacts:[1200,1800]};saveDrill(L,{unit:'R1-03',correct:9,total:12});if(scores['R1-03']?.score!==8)r.push('save_drill chấm sai '+JSON.stringify(scores['R1-03']));
  logDrill(L);if(reflexLog.at(-1)?.avg!==1500)r.push('nhật ký phản xạ sai');scores=JSON.parse(sc0);reflexLog=JSON.parse(lg0);
  if(voiceLevel(new Float32Array(128))!==0||voiceLevel(new Float32Array(128).fill(.5))<.49)r.push('đo độ to micro sai');
  roadTab='R';renderRoad();if(!document.querySelector('#road .today'))r.push('thiếu thẻ Hôm nay');if(document.querySelectorAll('#road .today .unit').length!==5)r.push('thẻ Hôm nay không đủ 5 việc');roadTab='I';renderRoad();
  if(!/Lộ trình/.test(document.querySelector('[data-view=vRoad]').textContent))r.push('tab dưới chưa đổi tên Lộ trình');return r})()`);
check(okList(rfx), 'phản xạ: 30 bài, prompt gọi, chấm điểm + đo thời gian phản xạ, thẻ Hôm nay', Array.isArray(rfx) ? rfx.join('; ') : JSON.stringify(rfx));
const gr = await ev(`(()=>{const r=[],o=callMode,n0=document.querySelectorAll('#chat .cmd').length;document.querySelector('#segMode2 [data-m=roast]').click();
  const last=[...document.querySelectorAll('#chat .cmd')].at(-1)?.textContent||'';if(!/Cục súc/.test(last))r.push('đổi chế độ không báo trong chat');
  document.querySelector('#segMode2 [data-m=roast]').click();if(document.querySelectorAll('#chat .cmd').length!==n0+1)r.push('bấm lại cùng chế độ vẫn báo lặp');
  setCallMode(o);return r})()`);
check(okList(gr), 'đổi chế độ: khung chat báo chế độ mới (không lặp)', Array.isArray(gr) ? gr.join('; ') : JSON.stringify(gr));
const bgx = await ev(`(async()=>{const r=[];const vids=[];window.Avatar.head.scene.traverse(o=>{const v=o.material?.map?.image;if(v instanceof HTMLVideoElement&&!vids.includes(v))vids.push(v)});
  const hid=Object.getOwnPropertyDescriptor(Document.prototype,'hidden');Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));await new Promise(z=>setTimeout(z,300));
  if(vids.some(v=>!v.paused))r.push('ẩn app mà video nền vẫn chạy');if(typeof bgTimer==='undefined')r.push('thiếu hẹn giờ tắt cuộc gọi chạy nền');
  Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));await new Promise(z=>setTimeout(z,1500));delete document.hidden;
  if(vids.length&&!vids.some(v=>!v.paused))r.push('mở lại app mà video nền không phát lại');return r})()`);
check(okList(bgx), 'tiết kiệm pin: ẩn app dừng video nền + vẽ 3D, mở lại thì chạy tiếp', Array.isArray(bgx) ? bgx.join('; ') : JSON.stringify(bgx));
// Bấm Kết thúc trong lúc đang xin micro → micro phải được nhả; bài phản xạ bị chặn (chưa có khoá) không được dính sang cuộc gọi sau.
const hu = await ev(`(async()=>{const r=[],WS=window.WebSocket,md=navigator.mediaDevices,gum=md.getUserMedia.bind(md),streams=[];
  window.WebSocket=class{constructor(){this.readyState=0}send(){}close(){}};
  md.getUserMedia=async c=>{const s=await gum(c);streams.push(s);callEnd(live);return s}; // người dùng tắt máy đúng lúc micro vừa mở
  document.getElementById('call').hidden=false;await callStart();await new Promise(z=>setTimeout(z,300));
  if(live)r.push('vẫn còn cuộc gọi sau khi tắt');if(!streams.length)r.push('không mô phỏng được micro');
  if(streams.some(s=>s.getTracks().some(t=>t.readyState!=='ended')))r.push('tắt lúc đang kết nối mà micro vẫn mở');
  md.getUserMedia=gum;const wd=Object.getOwnPropertyDescriptor(Navigator.prototype,'wakeLock');let st2=null; // tắt máy ở bước cuối (xin khoá màn hình): micro + âm thanh đã mở, nhả 2 lần không được văng lỗi
  Object.defineProperty(navigator,'wakeLock',{configurable:true,get:()=>({request:async()=>{st2=live?.stream;callEnd(live);return {release(){}}}})});
  await callStart();await new Promise(z=>setTimeout(z,500));delete navigator.wakeLock;if(wd)Object.defineProperty(Navigator.prototype,'wakeLock',wd);
  if(live)r.push('tắt ở bước cuối mà vẫn còn cuộc gọi');if(!st2)r.push('không tới được bước khoá màn hình');else if(st2.getTracks().some(t=>t.readyState!=='ended'))r.push('tắt ở bước cuối mà micro vẫn mở');
  const k=key;key='';startDrill('R1-01');document.getElementById('set').close();key=k;
  await callStart();if(live?.drill)r.push('bài phản xạ bị chặn dính sang cuộc gọi sau: '+live.drill);callEnd(live);
  window.WebSocket=WS;return r})()`);
check(okList(hu), 'gọi: tắt lúc đang kết nối thì nhả micro · bài phản xạ không dính sang cuộc gọi sau', Array.isArray(hu) ? hu.join('; ') : JSON.stringify(hu));
// Màn gọi ẩn (đang ở tab chat/lộ trình) → dừng vẽ 3D + video nền; hiện lại thì chạy tiếp.
const so = await ev(`(async()=>{const r=[],h=Avatar.head,vids=[],c=document.getElementById('call');h.scene.traverse(o=>{const v=o.material?.map?.image;if(v instanceof HTMLVideoElement&&!vids.includes(v))vids.push(v)});
  c.hidden=true;await new Promise(z=>setTimeout(z,300));
  if(h.isRunning)r.push('ẩn màn gọi mà vẫn vẽ 3D');if(vids.some(v=>!v.paused))r.push('ẩn màn gọi mà video nền vẫn chạy');
  c.hidden=false;await new Promise(z=>setTimeout(z,1500));
  if(!h.isRunning)r.push('hiện lại màn gọi mà không vẽ 3D');if(vids.length&&!vids.some(v=>!v.paused))r.push('hiện lại màn gọi mà video nền không chạy');return r})()`);
check(okList(so), 'tiết kiệm pin: ẩn màn gọi dừng vẽ 3D + video nền, hiện lại thì chạy tiếp', Array.isArray(so) ? so.join('; ') : JSON.stringify(so));
// "Xoá hết dữ liệu" phải xoá cả bản trong bộ nhớ: ghi lần sau không được lưu lại dữ liệu cũ.
const rs = await ev(`(async()=>{const r=[],cf=window.confirm,bk={};for(const k of Object.keys(localStorage))bk[k]=localStorage.getItem(k);
  addVocab(['qaword = thử']);mem=['qa note'];store('gs_mem',mem);reflexLog=[{date:today(),unit:'R1-01',avg:1000,n:1}];store('gs_reflex',reflexLog);fixes=[{w:'bad',b:'good',why:'QA',box:0,due:'2000-01-01'}];store('gs_fix',fixes);realScores=[{date:today(),kind:'Speaking',band:'6.0'}];store('gs_real',realScores);l2Mem.de=['QA'];store('gs_mem_de',l2Mem.de);localStorage.setItem('dn','dem');localStorage.setItem('wx','mua');localStorage.setItem('kv','hanoi');localStorage.setItem('dh','1');
  const gj=geminiJSON;let resolveSum;geminiJSON=()=>new Promise(z=>resolveSum=z);summarizeCall({mode:'learn',turns:[{role:'user',text:'one'},{role:'user',text:'two'},{role:'user',text:'three'}]});
  window.confirm=()=>true;document.getElementById('reset').click();window.confirm=cf;
  resolveSum({summary:'QA không được hồi sinh',fixes:[{wrong:'x',better:'y'}],words:['z = z'],next:''});await Promise.resolve();await Promise.resolve();geminiJSON=gj;
  if(vocab.length||mem.length||lmem.length||reflexLog.length||phrMem.length||hskMem.length||fixes.length||realScores.length||Object.keys(l2Mem).length)r.push('còn dữ liệu trong bộ nhớ sau khi xoá / response cũ hồi sinh');
  if(['dn','wx','kv','dh'].some(k=>localStorage.getItem(k)!==null))r.push('Xoá hết dữ liệu vẫn giữ khoá cảnh');
  addVocab(['newword = mới']);const v=JSON.parse(localStorage.getItem('gs_vocab')||'[]');if(v.length!==1)r.push('ghi lần sau lưu lại từ cũ ('+v.length+' từ)');
  if(localStorage.getItem('gs_key')===null)r.push('xoá mất khoá API');
  localStorage.clear();for(const k in bk)localStorage.setItem(k,bk[k]);vocab=load('gs_vocab',[]);mem=load('gs_mem',[]);reflexLog=load('gs_reflex',[]);fixes=load('gs_fix',[]);realScores=load('gs_real',[]);return r})()`);
check(okList(rs), 'Xoá hết dữ liệu: xoá cả trong bộ nhớ, giữ khoá API', Array.isArray(rs) ? rs.join('; ') : JSON.stringify(rs));
// Gọi không đứt ở phút ~10 (nối lại phiên), chờ người học nói xong, Giữ nút để nói — giả lập máy chủ Gemini Live.
const lv = await ev(`(async()=>{const r=[],WS=window.WebSocket,socks=[],wait=ms=>new Promise(z=>setTimeout(z,ms)),msg=(ws,o)=>ws.onmessage({data:JSON.stringify(o)});
  window.WebSocket=class{constructor(u){this.url=u;this.readyState=1;this.sent=[];socks.push(this);setTimeout(()=>this.onopen?.(),10)}send(d){this.sent.push(JSON.parse(d))}close(){}};
  const p0=ptt;ptt=false;document.getElementById('call').hidden=false;await callStart();await wait(150);
  const s0=socks[0]?.sent[0]?.setup;if(!s0){window.WebSocket=WS;callEnd(live);return ['không gửi setup']}
  if(!s0.sessionResumption)r.push('thiếu sessionResumption');if(!s0.contextWindowCompression?.slidingWindow)r.push('thiếu nén ngữ cảnh');
  const ad=s0.realtimeInputConfig?.automaticActivityDetection;if(!(ad?.silenceDurationMs>=1200)||ad.endOfSpeechSensitivity!=='END_SENSITIVITY_LOW')r.push('chưa chỉnh chờ người nói: '+JSON.stringify(ad));
  const L=live;msg(socks[0],{setupComplete:{}});msg(socks[0],{sessionResumptionUpdate:{newHandle:'h1',resumable:true}});if(!/BidiGenerateContent[?]key=/.test(socks[0].url))r.push('sai endpoint WebSocket Live');msg(socks[0],{goAway:{timeLeft:'5s'}});await wait(1700);
  if(socks.length!==2)r.push('goAway không mở kết nối mới');else{if(socks[1].sent[0]?.setup?.sessionResumption?.handle!=='h1')r.push('kết nối mới không dùng mã nối lại');msg(socks[1],{setupComplete:{}});if(socks[1].sent.length!==1)r.push('nối lại mà Sam chào lại')}
  if(live!==L)r.push('nối lại làm mất cuộc gọi');if(!L.stream||L.stream.getTracks().some(t=>t.readyState==='ended'))r.push('nối lại làm tắt micro');
  socks.at(-1).onclose({code:1006,reason:''});await wait(1800);if(socks.length!==3||live!==L)r.push('rớt mạng không tự nối lại');
  socks.at(-1).onclose({code:1011,reason:'RESOURCE_EXHAUSTED: quota'});await wait(300);if(live)r.push('hết lượt mà vẫn cố nối lại');if(!/Hết lượt/.test(document.getElementById('callStatus').textContent))r.push('hết lượt không báo giờ hồi');
  await callStart();await wait(150);const L2=live;msg(socks.at(-1),{setupComplete:{}});msg(socks.at(-1),{sessionResumptionUpdate:{newHandle:'h2',resumable:true}});
  for(let i=0;i<4&&live===L2;i++){const n=socks.length;msg(socks.at(-1),{goAway:{}});await wait(1700);if(live===L2&&socks.length===n+1)msg(socks.at(-1),{setupComplete:{}})}
  if(live===L2)r.push('goAway nối lại mãi không dừng (quá 3 lần)');
  callEnd(live);ptt=true;await callStart();await wait(150);const w=socks.at(-1);if(!w.sent[0]?.setup?.realtimeInputConfig?.automaticActivityDetection?.disabled)r.push('Giữ nút: chưa tắt tự nhận lượt');
  msg(w,{setupComplete:{}});const b=document.getElementById('callMute');if(!/Giữ để nói/.test(b.textContent))r.push('nút micro chưa đổi thành Giữ để nói');
  b.dispatchEvent(new PointerEvent('pointerdown',{pointerId:1,bubbles:true}));b.dispatchEvent(new PointerEvent('pointerup',{pointerId:1,bubbles:true}));
  const acts=w.sent.filter(x=>x.realtimeInput).map(x=>Object.keys(x.realtimeInput)[0]).join(',');if(acts!=='activityStart,activityEnd')r.push('giữ/thả không báo lượt: '+acts);
  msg(socks.at(-1),{sessionResumptionUpdate:{newHandle:'h3',resumable:true}});b.dispatchEvent(new PointerEvent('pointerdown',{pointerId:2,bubbles:true}));msg(socks.at(-1),{goAway:{}});await wait(1700);if(b.classList.contains('on'))r.push('nối lại lúc đang giữ nút mà nút kẹt sáng');
  msg(socks.at(-1),{setupComplete:{}});b.dispatchEvent(new PointerEvent('pointerdown',{pointerId:3,bubbles:true}));callEnd(live);ptt=false;await callStart();if(b.classList.contains('on'))r.push('trạng thái nút micro dính sang cuộc gọi sau');
  callEnd(live);ptt=p0;window.WebSocket=WS;return r})()`);
check(okList(lv), 'gọi: nối lại phiên khi goAway/rớt mạng (giữ micro, không chào lại) · chờ người nói · Giữ nút để nói', Array.isArray(lv) ? lv.join('; ') : JSON.stringify(lv));
// Model ghim + lùi về bí danh khi 404; luật chờ/đa dạng trong mọi lời dặn; trí nhớ chế độ Học; cảnh báo điều khoản.
const md = await ev(`(async()=>{const r=[],F=window.fetch,urls=[];if(DEFAULT_MODEL!=='gemini-3.5-flash-lite')r.push('chưa ghim model');
  window.fetch=async u=>{urls.push(String(u));const bad=urls.length===1;return {status:bad?404:200,ok:!bad,json:async()=>bad?{error:{message:'not found'}}:{candidates:[{content:{parts:[{text:'ok'}]}}]}}};
  const m0=model;model=DEFAULT_MODEL;let t='';try{t=await askAI(()=>{})}catch(e){t=e.message}model=m0;window.fetch=F;
  if(t!=='ok'||!/gemini-flash-lite-latest/.test(urls[1]||''))r.push('model ghim 404 không lùi về bí danh: '+t);
  const c=callMode;for(const m of ['learn','chat','roast','zh']){callMode=m;const p=livePrompt();if(!/TURN-TAKING/.test(p))r.push(m+': lời gọi thiếu luật chờ');if(m!=='zh'&&!/VARIETY/.test(p))r.push(m+': lời gọi thiếu luật đa dạng')}
  for(const m of ['learn','chat']){callMode=m;if(!/VARIETY/.test(systemPrompt()))r.push(m+': chat chữ thiếu luật đa dạng')}
  callMode='learn';const l0=lmem;lmem=['QA nhớ chuyện Đà Lạt'];if(!/QA nhớ chuyện Đà Lạt/.test(livePrompt())||!/QA nhớ chuyện Đà Lạt/.test(systemPrompt()))r.push('chế độ Học không đưa trí nhớ vào lời dặn');
  callMode='roast';if(/QA nhớ chuyện Đà Lạt/.test(livePrompt()+roastTextPrompt()))r.push('trí nhớ chế độ Học lẫn vào Cục súc');callMode='learn';
  lmem=[];addNotes(['QA ghi chú học']);if(!lmem.includes('QA ghi chú học'))r.push('chế độ Học không lưu trí nhớ');lmem=l0;store('gs_lmem',lmem);callMode=c;
  if(!/18 tuổi/.test(document.getElementById('set').textContent))r.push('Cài đặt thiếu cảnh báo điều khoản');return r})()`);
check(okList(md), 'model ghim gemini-3.5-flash-lite (404 → bí danh) · luật chờ + đa dạng mọi lời dặn · trí nhớ chế độ Học · cảnh báo điều khoản', Array.isArray(md) ? md.join('; ') : JSON.stringify(md));
check(okList(zh), 'chế độ HSK3: dạy tiếng Trung · cho phép chữ Hán · nạp tiến độ', Array.isArray(zh) ? zh.join('; ') : JSON.stringify(zh));
const ci = await ev(`(()=>{document.querySelector('nav button[data-view=vRoad]').click();const k=document.getElementById('road').children.length;document.querySelector('nav button[data-view=vChat]').click();document.getElementById('openSet').click();const d=document.getElementById('set').open;document.getElementById('set').close();return {k,d}})()`);
check(ci?.k > 2 && ci?.d, 'tab IELTS dựng được, hộp Cài đặt mở được', JSON.stringify(ci));

// Kỳ thi khác IELTS, bảng đích đến, civics, đồng hồ thi, ngôn ngữ thứ hai (v60).
const ex = await ev(`(()=>{const r=[],D=window.SAM_DATA||{};if(!D.exams||Object.keys(D.exams).length<4)r.push('thiếu data/exams.js');if(Object.keys(D.langs||{}).length<4)r.push('thiếu data/langs.js');if((D.targets||[]).length<10)r.push('thiếu data/targets.js');if((D.usCivics?.questions||[]).length!==128)r.push('civics không đủ 128 câu');
  const e0=exam,c0=callMode,t0=tests.length;callMode='learn';exam='toefl';if(!/EXAM FOCUS — TOEFL/.test(systemPrompt()))r.push('chat chữ không có EXAM FOCUS TOEFL');if(!/start_timer/.test(livePrompt()))r.push('lời gọi TOEFL thiếu hướng dẫn đồng hồ');
  exam='civics';const p=livePrompt();if(!/USCIS/.test(p)||(p.match(/acceptable:/g)||[]).length!==20)r.push('phỏng vấn quốc tịch không đủ 20 câu');
  exam='toefl';mode='SPEAKING';const p0=JSON.stringify(profile);takeTags('chấm thử <band>{"kind":"Speaking","overall":7,"FC":7,"LR":7,"GRA":7,"P":7}</band><profile>{"band":8,"weak":["QA"],"note":"QA"}</profile>');if(tests.length!==t0||JSON.stringify(profile)!==p0)r.push('đang luyện TOEFL mà vẫn lưu điểm/band IELTS');if(livePrompt().includes('After a few minutes, and whenever your picture of them changes, call save_profile'))r.push('lời gọi TOEFL vẫn yêu cầu save_profile');exam='civics';const c1=civicsBlock(false),c2=civicsBlock(false);if(c1!==c2)r.push('bộ câu civics bị xáo lại mỗi tin nhắn');civicsSet=null;exam='toefl';mode='';takeTags('xong <score2>{"exam":"toefl","skill":"Writing","overall":4.5,"range":[4,5]}</score2>');const t=tests.at(-1);if(tests.length!==t0+1||t.range?.join()!=='4,5')r.push('thẻ score2 không lưu khoảng điểm');takeTags('<score2>{"exam":"toefl","skill":"Writing","overall":4.5}</score2>');if(tests.length!==t0+2||tests.at(-1).range?.join()!=='4.5,4.5')r.push('Sam quên khoảng thì mất bài thi TOEFL');exam='ielts';mode='SPEAKING';takeTags('<band>{"kind":"Speaking","overall":6.5,"FC":6.5,"LR":6.5,"GRA":6,"P":6.5}</band>');if(tests.length!==t0+3||tests.at(-1).range?.join()!=='6.0,7.0')r.push('Sam quên khoảng thì mất bài thi IELTS (phải tự lấy ±0.5)');mode='';exam='toefl';tests.splice(t0);store('ie_tests',tests);profile=JSON.parse(p0);store('ie_profile',profile);
  exam=e0;callMode=c0;roadTab='I';renderRoad();if(!document.getElementById('examSel')||!document.getElementById('targetSel'))r.push('tab Kỳ thi thiếu chọn kỳ thi/đích đến');return r})()`);
check(okList(ex), 'kỳ thi khác IELTS (TOEFL/civics) · thẻ score2 · tab Kỳ thi + bảng đích đến · đủ 4 tệp data', Array.isArray(ex) ? ex.join('; ') : JSON.stringify(ex));
const tmr = await ev(`(async()=>{const r=[],w=wordMatch('The cat sat on the mat','the cat sat on mat');if(w.pct!==83||w.missed.join()!=='the')r.push('wordMatch sai '+JSON.stringify(w));
  const sent=[],L={ready:true,ws:{readyState:1,send:d=>sent.push(JSON.parse(d))},inT:'',outT:'',sources:[]};const lv0=live;live=L;document.getElementById('call').hidden=false;startTimer(L,{label:'Read Aloud',prep_seconds:0,speak_seconds:30,kind:'readAloud',target_text:'Hello world again'});
  if(document.getElementById('examCard').hidden)r.push('không hiện thẻ đồng hồ');L.task.said=' hello world';finishTask(L,false);const tx=document.getElementById('ecTimer').textContent;
  if(!/67%/.test(tx))r.push('không hiện % khớp: '+tx);if(sent.length)r.push('gửi số đo khi Sam còn đang nói (cắt lời Sam)');if(!/67%/.test(L.pendingNote||''))r.push('không giữ số đo để gửi sau');L.ready=true;onLive.call(null,L,{serverContent:{turnComplete:true}});const m=sent.at(-1);if(!m||m.clientContent.turnComplete!==false||!/67%/.test(m.clientContent.turns[0].parts[0].text))r.push('Sam nói xong mà không gửi số đo (hoặc bắt Sam nói tiếp)');startTimer(L,{label:'Part 2',prep_seconds:0,speak_seconds:120,kind:'free'});L.task.said=' I think';const fr=L.task;if(L.task.kind!=='free'||L.task.target)r.push('bài nói tự do dùng nhầm thẻ đề cũ làm câu gốc');if(L.task!==fr)r.push('đồng hồ Part 2 tự tắt');clearInterval(L.tid);L.task=null;
  clearInterval(L.tid);L.task=null;startTimer(L,{label:'QA 5 giây',prep_seconds:0,speak_seconds:5,kind:'free'});await new Promise(z=>setTimeout(z,5300));if(L.task)r.push('đồng hồ 5 giây chạy quá 5 giây');document.getElementById('examCard').hidden=true;chatTimer({label:'Task 1',minutes:20});if(!/Task 1: 20:00/.test(document.getElementById('modeText').textContent))r.push('đồng hồ bài viết không chạy');setMode('');live=lv0;return r})()`);
check(okList(tmr), 'đồng hồ thi + thẻ đề: đo % từ khớp khi đọc to, gửi số đo cho Sam · đồng hồ bài viết', Array.isArray(tmr) ? tmr.join('; ') : JSON.stringify(tmr));
const l2 = await ev(`(()=>{const r=[],c0=callMode,b=document.querySelector('#segMode2 .l2b');setCallMode('zh');const seen=[];for(let i=0;i<5;i++){b.click();seen.push(callMode)}
  if(seen.join()!=='de,ko,ja,tw,zh')r.push('xoay ngôn ngữ sai: '+seen.join());
  setCallMode('ko');if(!/Korean|TOPIK/.test(livePrompt())||!/Korean|TOPIK/.test(systemPrompt()))r.push('lời dặn tiếng Hàn sai');if(slipped('안녕하세요'))r.push('chế độ Hàn chặn nhầm Hangul');if(!slipped('สวัสดี'))r.push('chế độ Hàn không chặn chữ Thái');
  setCallMode('de');if(!slipped('你好'))r.push('chế độ Đức không chặn chữ Hán');if(slipped('Guten Morgen, wie geht es dir?'))r.push('chế độ Đức chặn nhầm tiếng Đức');
  setCallMode(c0);return r})()`);
check(okList(l2), 'ngôn ngữ thứ hai: xoay Trung→Đức→Hàn→Nhật→Đài · lời dặn đúng · bộ lọc chữ đúng ngôn ngữ', Array.isArray(l2) ? l2.join('; ') : JSON.stringify(l2));

// Đợt 2 (v61): tóm tắt sau buổi gọi + sổ lỗi, điểm IELTS thật thà + điểm thi thật, chấm phát âm từ ghi âm — giả lập Gemini.
const rc = await ev(`(async()=>{const r=[],F=window.fetch,reqs=[],cm=callMode,h0=hist.length,f0=JSON.stringify(fixes),v0=JSON.stringify(vocab),l0=JSON.stringify(lmem);
  const reply=o=>({status:200,ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(o)}]}}]})});
  window.fetch=async(u,o)=>{const b=JSON.parse(o.body);reqs.push(b);return reply(b.contents[0].parts.some(x=>x.inline_data)?{heard:'I walk to the store',clarity:3,words:[{word:'walked',issue:'thiếu âm /t/ cuối'}],tip:'bật âm cuối'}:{summary:'QA tóm tắt: nói về công việc',fixes:[{wrong:'I very like it',better:'I really like it',why:'very không đứng trước động từ'}],words:['deadline = hạn chót'],next:'luyện thì quá khứ'})};
  callMode='learn';hist.push({role:'user',text:'I very like it'},{role:'model',text:'Nice'},{role:'user',text:'I go to work yesterday'},{role:'model',text:'Oh'},{role:'user',text:'deadline is tomorrow'});
  await summarizeCall({h0});const card=[...document.querySelectorAll('#chat .msg.ai')].at(-1)?.textContent||'';
  if(!/Tóm tắt buổi gọi/.test(card)||!/I really like it/.test(card))r.push('không hiện thẻ tóm tắt: '+card.slice(0,80));
  if(!fixes.some(f=>f.b==='I really like it'))r.push('lỗi không vào sổ lỗi');if(!vocab.some(v=>v.w==='deadline'))r.push('từ mới không vào sổ từ');if(!lmem.some(x=>/QA tóm tắt/.test(x)))r.push('tóm tắt không vào trí nhớ');
  const pm0=JSON.stringify(phrMem);callMode='roast';hist.push({role:'user',text:'a'},{role:'user',text:'b'},{role:'user',text:'c'});await summarizeCall({h0:hist.length-3});if(phrMem.some(x=>/QA tóm tắt/.test(x))||!phrMem.some(x=>/I really like it/.test(x)))r.push('Cục súc: sổ câu sai nhận nhầm văn tóm tắt');phrMem=JSON.parse(pm0);store('gs_phr',phrMem);callMode='learn';
  if(!/Learner: I very like it/.test(reqs[0]?.contents[0].parts[0].text||''))r.push('không gửi lời thoại buổi gọi');
  fixes.at(-1).due='2000-01-01';mode='FIXES';takeTags('xong <review>{"ok":["I really like it."],"miss":[]}</review> <done/>');if(fixes.at(-1).box!==1)r.push('ôn lỗi không dời lịch');
  roadTab='I';fixes.at(-1).due='2000-01-01';renderRoad();if(!/Ôn 1 lỗi từ buổi gọi/.test(document.querySelector('#road .today')?.textContent||''))r.push('thẻ Hôm nay thiếu dòng ôn lỗi');
  const p=systemPrompt();if(!/BAND GUIDE/.test(p)||!/RANGE/.test(p)||!/\\[FIXES\\]/.test(p))r.push('lời dặn IELTS thiếu bảng mô tả band / khoảng / [FIXES]');
  const t0=tests.length,rs0=JSON.stringify(realScores);mode='SPEAKING';takeTags('<band>{"kind":"Speaking","overall":6.5,"range":[6,7],"FC":6.5,"LR":6.5,"GRA":6,"P":6.5}</band> <done/>');if(tests.at(-1)?.range?.join()!=='6.0,7.0')r.push('thẻ band không lưu khoảng');
  realScores=[{date:'2026-11-16',kind:'Speaking',band:'6.0'}];if(!/REAL IELTS results: Speaking 6.0/.test(systemPrompt()))r.push('điểm thi thật không vào lời dặn hiệu chỉnh');
  const sr=8000,ns=sr,wv=new DataView(new ArrayBuffer(44+ns*2)),tg=(o,t)=>{for(let i=0;i<t.length;i++)wv.setUint8(o+i,t.charCodeAt(i))};tg(0,'RIFF');wv.setUint32(4,36+ns*2,true);tg(8,'WAVEfmt ');wv.setUint32(16,16,true);wv.setUint16(20,1,true);wv.setUint16(22,1,true);wv.setUint32(24,sr,true);wv.setUint32(28,sr*2,true);wv.setUint16(32,2,true);wv.setUint16(34,16,true);tg(36,'data');wv.setUint32(40,ns*2,true);for(let i=0;i<ns;i++)wv.setInt16(44+i*2,Math.sin(i/5)*8000,true);
  await pronCheck(new Blob([wv],{type:'audio/x-test'}),'I walked to the store','English');const pc=[...document.querySelectorAll('#chat .msg.ai')].at(-1)?.textContent||'';
  const pr=reqs.at(-1)?.contents[0].parts||[];if(pr[0]?.inline_data?.mime_type!=='audio/wav'||(pr[0].inline_data.data||'').length<40000)r.push('âm thanh không được đổi sang WAV 16 kHz: '+pr[0]?.inline_data?.mime_type+' '+(pr[0]?.inline_data?.data||'').length);if(!/I walked to the store/.test(pr[1]?.text||''))r.push('không gửi câu gốc');
  if(!/★★★☆☆/.test(pc)||!/walked/.test(pc)||!/ước lượng/.test(pc))r.push('thẻ chấm phát âm sai: '+pc.slice(0,80));
  window.fetch=F;callMode=cm;hist.splice(h0);store('ie_hist',hist.slice(-40));fixes=JSON.parse(f0);store('gs_fix',fixes);vocab=JSON.parse(v0);store('gs_vocab',vocab);lmem=JSON.parse(l0);store('gs_lmem',lmem);tests.splice(t0);store('ie_tests',tests);realScores=JSON.parse(rs0);store('gs_real',realScores);setMode('');
  return r})()`);
check(okList(rc), 'đợt 2: tóm tắt sau buổi gọi → sổ lỗi/sổ từ/trí nhớ · [FIXES] · điểm IELTS dạng khoảng + điểm thi thật · chấm phát âm từ ghi âm', Array.isArray(rc) ? rc.join('; ') : JSON.stringify(rc));

// Đợt 3 (v63): cách học (mức sửa lỗi, tốc độ nói), chuỗi ngày, nhập vai + nút gợi ý, trọn vòng gọi → Kết thúc → tóm tắt; vòng đời ghi âm 🎙.
const b3 = await ev(`(async()=>{const r=[],WS=window.WebSocket,socks=[],wait=ms=>new Promise(z=>setTimeout(z,ms)),msg=(ws,o)=>ws.onmessage({data:JSON.stringify(o)});
  const c0=callMode,k0=[corr,speed],d0=JSON.stringify(days),m0=JSON.stringify(misDone),h0=hist.length,f0=JSON.stringify(fixes),v0=JSON.stringify(vocab),l0=JSON.stringify(lmem),gj=geminiJSON,p0=ptt;ptt=false;
  callMode='learn';corr='now';if(!/fix everything now/.test(systemPrompt())||!/fix everything now/.test(livePrompt()))r.push('Sửa ngay: lời dặn Học thiếu');
  corr='end';if(!/only at the end/.test(systemPrompt())||!/only at the end/.test(livePrompt()))r.push('Chỉ cuối buổi: lời dặn Học thiếu');
  callMode='roast';if(/only at the end/.test(livePrompt()+systemPrompt()))r.push('mức sửa lỗi lọt vào Cục súc');callMode='learn';
  corr='light';if(/CORRECTIONS —/.test(systemPrompt()+livePrompt()))r.push('Vừa phải mà vẫn chèn luật sửa lỗi');
  const uts=[];speechSynthesis.speak=u=>uts.push(u);speed='slow';speak('Hello there');speed='normal';speak('Hello there');delete speechSynthesis.speak;if(!(uts[0]?.rate<uts[1]?.rate))r.push('tốc độ Chậm không làm giọng đọc chậm hơn');
  document.getElementById('openSet').click();document.getElementById('corr').value='end';document.getElementById('speed').value='fast';document.getElementById('save').click();if(corr!=='end'||speed!=='fast'||localStorage.getItem('gs_corr')===null)r.push('Cài đặt không lưu mức sửa lỗi/tốc độ');
  const ds=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.toLocaleDateString('sv')};
  days=[ds(3),ds(2),ds(1)];if(streak()!==3)r.push('chuỗi tới hôm qua sai: '+streak());markDay();if(streak()!==4)r.push('học hôm nay không cộng chuỗi');days=[ds(5),ds(1)];if(streak()!==1)r.push('chuỗi đứt mà vẫn đếm');
  days=[ds(1),today()];roadTab='I';renderRoad();if(!/🔥 2 ngày liên tiếp/.test(document.querySelector('#road .today')?.textContent||''))r.push('thẻ Hôm nay thiếu 🔥');
  if(MISSIONS.length!==12||MISSIONS.some(m=>!m.role||!m.goal||m.steps?.length!==3))r.push('dữ liệu nhập vai thiếu');
  roadTab='M';renderRoad();const rows=document.querySelectorAll('#road .missions .unit');if(rows.length!==12)r.push('tab Nhập vai không đủ dòng: '+rows.length);
  window.WebSocket=class{constructor(u){this.url=u;this.readyState=1;this.sent=[];socks.push(this);setTimeout(()=>this.onopen?.(),10)}send(d){this.sent.push(JSON.parse(d))}close(){}};
  const reqs=[];geminiJSON=async p=>{reqs.push(p[0].text);return {summary:'QA nhập vai',fixes:[],words:[],next:''}};
  const kk=key;key='';callMode='chat';startMission('M02');document.getElementById('set').close();if(callMode!=='chat'||live)r.push('chưa có khoá mà vẫn đổi chế độ / mở cuộc gọi');key=kk;
  speed='slow';callMode='roast';rows[0].querySelector('button').click();for(let i=0;i<60&&!(socks.at(-1)?.sent.length);i++)await wait(50);const L=live;
  if(!L||L.mission!=='M01')r.push('bấm nhiệm vụ không mở cuộc gọi');else{
    if(callMode!=='learn')r.push('nhập vai không chuyển sang Học');
    if(document.getElementById('examCard').hidden||!/Gọi cà phê/.test(document.getElementById('ecTitle').textContent)||!/1[.] Gọi 1 đồ uống/.test(document.getElementById('ecText').textContent))r.push('không hiện thẻ mục tiêu');
    const w=socks.at(-1),sys=w.sent[0]?.setup?.systemInstruction?.parts[0].text||'';if(!/ROLE-PLAY MISSION/.test(sys))r.push('lời dặn gọi thiếu luật nhập vai');if(!/SLOWER/.test(sys))r.push('tốc độ Chậm không vào lời dặn cuộc gọi');if(!/tap HINT, step out/.test(sys)||!/complete_mission with met and total FIRST/.test(sys)||/fix everything now/.test(sys)&&!/never during a mock test/.test(sys))r.push('luật nhập vai thiếu ngoại lệ gợi ý / lưu trước khi nhận xét');if(/OVERRIDE|CỤC SÚC/.test(sys))r.push('nhập vai từ Cục súc mà vẫn chạy lời dặn Cục súc');
    msg(w,{setupComplete:{}});const first=w.sent.find(x=>x.clientContent)?.clientContent.turns[0].parts[0].text||'';if(!first.startsWith('[MISSION M01]')||!first.includes('barista'))r.push('lời mở không phải nhiệm vụ: '+first.slice(0,60));
    document.getElementById('callTip').click();if(w.sent.filter(x=>/HINT button/.test(x.clientContent?.turns?.[0]?.parts?.[0]?.text||'')).length!==1||L.hints!==1)r.push('nút Gợi ý không gửi HINT');
    for(const [u,s] of [['Can I get a large latte with oat milk','Sure, anything else?'],['How much is it','Six fifty'],['What is the wifi password','It is on the receipt']]){msg(w,{serverContent:{inputTranscription:{text:u}}});msg(w,{serverContent:{outputTranscription:{text:s}}});msg(w,{serverContent:{turnComplete:true}})}
    msg(w,{toolCall:{functionCalls:[{id:'1',name:'complete_mission',args:{met:2,total:3}}]}});if(misDone.M01?.met!==2||misDone.M01?.hints!==1)r.push('complete_mission không lưu: '+JSON.stringify(misDone.M01));
    days=[];setCallMode('chat'); // đổi chế độ giữa chừng: tóm tắt vẫn theo chế độ lúc bắt đầu gọi
    callEnd(L);await wait(50);
    if(!reqs.length||!/Learner: Can I get a large latte/.test(reqs[0])||!/Learner: What is the wifi password/.test(reqs[0]))r.push('Kết thúc gọi không tóm tắt đúng lời thoại cuộc gọi');
    if(!lmem.includes('QA nhập vai'))r.push('tóm tắt không vào trí nhớ chế độ lúc gọi (Học)');
    if(!days.includes(today()))r.push('cuộc gọi có nói mà không tính ngày học');
    roadTab='M';renderRoad();if(!(document.querySelector('#road .missions .unit')?.textContent||'').includes('đạt 2/3 mốc'))r.push('danh sách không hiện ✓ nhiệm vụ');
  }
  window.WebSocket=WS;geminiJSON=gj;
  const md=navigator.mediaDevices,gum=md.getUserMedia;let nGum=0;const strs=[];md.getUserMedia=async c=>{nGum++;const s=await gum.call(md,c);strs.push(s);return s};
  const pc=pronCheck;pronCheck=async()=>{};const ST=window.setTimeout,caps=[],btn=document.createElement('button');document.body.append(btn);
  const a1=pronRecord(btn,'hello','English'),a2=pronRecord(btn,'hello','English');await a1;await a2;
  if(nGum!==1)r.push('bấm đôi mở '+nGum+' micro');if(recBusy?.state!=='recording'||btn.textContent!=='⏹')r.push('không vào trạng thái ghi');
  await pronRecord(btn,'hello','English');await wait(200);if(recBusy||btn.textContent!=='🎙'||strs[0]?.getTracks().some(t=>t.readyState!=='ended'))r.push('bấm lại không dừng ghi / không nhả micro');
  window.setTimeout=(f,ms,...x)=>{if(ms===15000)caps.push(f);return ST(f,ms,...x)};await pronRecord(btn,'hello','English');window.setTimeout=ST;
  if(caps.length!==1)r.push('không hẹn tự dừng 15 s');else{caps[0]();await wait(200);if(recBusy||strs.at(-1).getTracks().some(t=>t.readyState!=='ended'))r.push('hết 15 s không tự dừng / không nhả micro')}
  const MR=window.MediaRecorder;window.MediaRecorder=undefined;await pronRecord(btn,'hello','English');window.MediaRecorder=MR;
  if(btn.textContent!=='⚠️'||recBusy||strs.at(-1).getTracks().some(t=>t.readyState!=='ended'))r.push('không có MediaRecorder: không báo ⚠️ / không nhả micro');
  md.getUserMedia=gum;pronCheck=pc;btn.remove();
  [corr,speed]=k0;store('gs_corr',corr);store('gs_speed',speed);days=JSON.parse(d0);store('gs_days',days);misDone=JSON.parse(m0);store('gs_mis',misDone);hist.splice(h0);store('ie_hist',hist.slice(-40));
  fixes=JSON.parse(f0);store('gs_fix',fixes);vocab=JSON.parse(v0);store('gs_vocab',vocab);lmem=JSON.parse(l0);store('gs_lmem',lmem);ptt=p0;setCallMode(c0);roadTab='I';renderRoad();document.getElementById('call').hidden=true;
  return r})()`);
check(okList(b3), 'đợt 3: mức sửa lỗi + tốc độ nói · chuỗi 🔥 · nhập vai + 💡 gợi ý + trọn vòng gọi → tóm tắt · vòng đời ghi âm 🎙', Array.isArray(b3) ? b3.join('; ') : JSON.stringify(b3));

const e2 = [...new Set(errs)]; check(!e2.length, 'không lỗi console / exception trong cả phiên', e2.slice(0, 4).join(' | '));
await finish();
