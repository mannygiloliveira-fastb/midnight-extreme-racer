import fs from 'fs'; import zlib from 'zlib'; import vm from 'vm';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const src = fs.readFileSync('../mob/game.js', 'utf8');
const a = src.indexOf('  function merMoUnpack(ab) {'), b = src.indexOf('  function Ul(e, a) {');
const car = fs.readFileSync('../mob/car.js', 'utf8');
const ctx = { window: {}, self: {}, TextDecoder, TextEncoder, WebAssembly, Uint8Array, DataView, JSON, Promise, Error };
ctx.self = ctx.window; vm.createContext(ctx);
vm.runInContext(car.replace(/window\.MER_CAR_B64="[^"]*";/, ''), ctx); // load decoder only
ctx.window.MeshoptDecoder = ctx.window.MeshoptDecoder || ctx.MeshoptDecoder;
vm.runInContext(src.slice(a, b), ctx);
const b64 = car.match(/MER_CAR_B64="([^"]*)"/)[1];
const glb = zlib.gunzipSync(Buffer.from(b64, 'base64'));
const ab = glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.length);
const out = await ctx.merMoUnpack(ab);
fs.writeFileSync('unpacked.glb', Buffer.from(out));
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const A = (await io.read('car_raw.glb')).getRoot().listAccessors(), B = (await io.read('unpacked.glb')).getRoot().listAccessors();
let attrBad = 0, triBad = 0;
for (let i = 0; i < A.length; i++) { const x = A[i].getArray(), y = B[i].getArray();
  if (A[i].getType() === 'SCALAR') { for (let t = 0; t < x.length; t += 3) { const ok = [0,1,2].some(r => x[t]===y[t+r]&&x[t+1]===y[t+(r+1)%3]&&x[t+2]===y[t+(r+2)%3]); ok || triBad++; } }
  else for (let k = 0; k < x.length; k++) if (x[k] !== y[k]) { attrBad++; break; } }
console.log('unpacked bytes', out.byteLength, 'attribute blocks differing', attrBad, 'triangles changed', triBad);
