import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const a = await io.read('car_raw.glb'), b = await io.read('car_mo_none.glb');
const A = a.getRoot().listAccessors(), B = b.getRoot().listAccessors();
let diff = 0, n = 0;
for (let i = 0; i < A.length; i++) { const x = A[i].getArray(), y = B[i].getArray(); if (x.constructor !== y.constructor || x.length !== y.length) { diff++; continue; } for (let k = 0; k < x.length; k++) if (x[k] !== y[k]) { diff++; break; } n++; }
console.log('accessors', A.length, B.length, 'compared', n, 'mismatched', diff);
