# Midnight Extreme Racer

## Start working in Claude Code

1. Unzip this folder somewhere easy to find, for example `Documents/midnight-extreme-racer`.
2. Open a terminal in that folder and run `git init`, then `git add .` and `git commit -m "Starting point"`. This gives you an undo point.
3. Start Claude Code in the folder. It reads `CLAUDE.md` first, which holds all the project rules and notes.

## Play it on your computer and phone

1. In the folder, run `npx serve .` (or `python3 -m http.server 8080`).
2. On your computer, open the address it prints.
3. On your phone (same Wi-Fi), open `http://<your computer's IP>:<port>`.

## Publish a beta update to your friends

1. Open a claude.ai chat.
2. Attach the files that changed (usually `game.js`, sometimes `index.html`, `styles.css` or `car.js`). Whenever you attach `styles.css`, also attach `midnight-extreme-cover.jpg`. The start screen loads it as a separate file.
3. Ask Claude to publish them to the Midnight Extreme Racer artifact. The link stays the same: https://claude.ai/artifact/LdyhWtD5LXWM5EhJxCq8ku
