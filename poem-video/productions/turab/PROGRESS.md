# Progress

**Now:** First full cut rendered at `film/out/turab.mp4` (gitignored). Remotion project in `../../film`.

**How it was made:**
- Paid AI generation was out (no budget). Pexels stopped issuing keys. Pixabay needs a query-string key (env var, new session) and blocks bots.
- Wikimedia Commons and Openverse rate-limited this network (429).
- So the film is built from **Library of Congress Matson collection** public-domain scans of Iraq and the region (1898–1946). Credits are in `CREDITS.md`.
- Masters are fetched as TIFF from `tile.loc.gov/storage-services/master/pnp/...u.tif`, auto-trimmed, and stereo cards halved. Results are in `film/public/media/`.
- The archival look is deliberate ("the ancestors' own pictures"): sepia soft-light grade, gate flicker, grain, drifting dust, vignette. Each verse gets 1–2 photos with slow push, pull or pan moves and 1.4 s dissolves. yo14 → ta19 is a match-dissolve: skin into inscribed rock.
- Typography: Amiri Bold, each hemistich ink-swept right to left on its spoken time (`verses.json` + 5 s intro offset). Right hemistich, ۞, left hemistich.

**Open with the user:** poet name (`POET` in `film/src/theme.ts`), background music, whether the 5 s title intro is wanted.

**Next:** watch the render fully and fix any timing or framing issues. Optionally add a Pixabay key in a new session for a few colour/motion clips.
