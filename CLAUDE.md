# Midnight Extreme Racer

A night-time arcade time trial racing game that runs in the browser with Three.js 0.160 (loaded from the jsDelivr CDN). The player starts in a detailing garage showroom with an Audi TT RS, picks a paint, and races a lap. The game began as an Obsessed Garage lighting calculator script, so a lot of the code is minified with short names.

Owner: Manny. Beta testers are friends who play from a public link. They do not use Claude.

## Files

- `index.html`: page shell, boot progress bar, intro overlay, showroom menu. `var TOTAL` in the boot script must equal the byte size of `car.js` so the loading bar fills correctly. Update it whenever `car.js` changes.
- `styles.css`: all styles, including the arcade title lockup (`.mer-c1`, `.mer-c2`, `.mer-badge`, `.mer-card-a.out`). `.mer-title` loads `midnight-extreme-cover.jpg` by URL (the old base64 copy was removed on 2026-11-19).
- `game.js`: the whole game in one closure (about 500 KB).
- `car.js`: the Audi TT RS model. It holds the meshopt decoder (`window.MeshoptDecoder`) and `window.MER_CAR_B64`, a base64 string of a gzip compressed GLB that uses EXT_meshopt_compression on top of KHR_mesh_quantization.
- `midnight-extreme-cover.jpg`: start screen art.
- `backup/car_before_compression.js`: the car file before compression, for rollback. If you roll back, also remove the `.then(merMoUnpack)` step only if needed (it passes plain GLBs through untouched) and reset `TOTAL` in `index.html`.
- `tools/compress-car/`: Node scripts used to compress the car (`comp.mjs none`), and to prove it is lossless (`verify.mjs`, `e2e.mjs`). Needs `npm i @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 meshoptimizer@0.22`.

## Hard rules

- NEVER print, cat, grep or read `car.js` or `backup/car_before_compression.js` into the conversation. They are megabytes of base64. Work on them only with scripts that print sizes or summaries.
- Make edits with small, exact replacements. After every edit run `node --check game.js`.
- Do not change car geometry, driving or handling unless Manny asks.
- Write to Manny in plain language: active voice, short sentences, no em dashes, no semicolons, no emojis, no filler words. Say clearly what was checked and what was not.

## Running and testing

- Serve the folder over HTTP (modules and fetch do not work from `file://`): `npx serve .` or `python3 -m http.server 8080`.
- Test on a phone: find the computer's local IP and open `http://<ip>:8080` on the phone while both are on the same Wi-Fi.
- Manny's priority is phone players first, with graphics kept as good as possible.

## Publishing (current workflow: "option 1")

The public beta link is a claude.ai artifact: https://claude.ai/artifact/LdyhWtD5LXWM5EhJxCq8ku (slug `9f075a1b-1179-44f0-93ec-fb285f899dbe`, title "Midnight Extreme Racer", shared publicly). Build and test here in Claude Code. To publish, Manny opens a claude.ai chat, attaches the changed files, and asks Claude to publish them to that slug with the artifact tools (`get_artifact` for the live version, then `publish_files` with `shared_live: "public"` and `artifact_title: "Midnight Extreme Racer"`). Later the plan may move to Netlify or GitHub Pages.

## Key code facts (game.js)

- Minified names: `t` state, `fe` THREE, `qe` config, `ie` garage dims (`len` 34, `wid` 32, `ht` 12, door on the +z side at `z = len/2`), `Wn()` car spots `{x,z,r}`, `zr(i)` places car i at its spot, `Yo(v)`/`t.doorT` bay door, `zn()` headlights and taillights, `It()` camera, `ye()` render, `ir(wid,len,cars)` bays, `r0(car)` builds the car rig, `s0(car, fwdZ)` builds headlight and taillight parts, `Ul()` custom GLB parser, `merMoUnpack()` meshopt to plain GLB before `Ul`.
- World scale is about 3 units per metre. The car is about 13.2 x 4.3 x 6.3 units. Camera distances are in units.
- `r0(car)` returns `{ fwdZ, wheels[] }`. `fwdZ` is -1. Each wheel has `{ steer, spin, R, front }` with `R` about 1.05. The rig does not exist until `r0` is called, so call it, never read `car.userData.rig` directly.
- Nose direction is `fwdZ * (sin ry, cos ry)`. For a nose angle `phi`, use `ry = phi + PI` when `fwdZ < 0`. Spot rotation is `sp.r = -ry * 180 / PI`.
- Headlights only exist after `s0()` runs. The intro calls it in `merIntroPrep`.
- Phones (`qn()` true) use a camera far limit of 1400 units, desktop 9000. On phones `merSkyBackdrop()` pushes the sky dome, the three mountain rings and the dusk band to the back of the depth range so the far limit cannot clip them (this was the sky flicker). Desktop is unchanged.
- While racing, touch drags on the game screen no longer move the chase camera (canvas `pointermove` returns early for `pointerType === "touch"` when `t.drive` is set). Mouse drags still move it.

## Intro cinematic

- `merIntroPrep` builds the path: track lap from about 130 units before the sharpest corner, a curve onto the driveway, then straight through the door to the spot. Speed plan: about 35 m/s cruise, about 1.1 g braking, slow roll up the driveway that eases to a stop. Sets `I.cX` (cut to the door shot), `I.tD`, `I.tCl` (door close), `I.END`.
- `merWarp` adds a slow motion beat (about one third speed) from about 2.0 to 3.9 s real time while the title slams in.
- Shots: low kerb whip, telephoto tracking shot, trackside whip pan, exterior door shot, glide through the door to the front three quarter view.
- The car ends nose-in, facing the back wall cabinets. It must never turn in place.
- The garage lux spotlights fade on as the car reaches the driveway. Headlights stay on, only haze and glare are softened near the garage.
- Skip with Enter or the Skip pill.

## Showroom

- `merShowroomEnter` puts the hero car nose-in via `merNoseIn(true)`. `merShowroomExit` restores the nose-out spot so the race start is unchanged.
- No idle auto-orbit (removed on purpose). Drag or A/D to rotate. Elevation drag is clamped so the camera never goes under the floor.

## Open to-do list

1. Restyle the race start cutscene (car backing out) to match the arcade intro title.
2. Phone quality pass: auto quality tiers from frame rate, no shadows and lower pixel ratio on phones, fewer lights, draw distance on phones.
3. Portrait handling: "turn your phone" screen for racing, portrait showroom layout.
4. Touch controls: bigger buttons, safe area margins, optional tilt steering, vibration on Android.
5. Music (Suno track "Turbo Circuit") is on hold until Manny asks.
