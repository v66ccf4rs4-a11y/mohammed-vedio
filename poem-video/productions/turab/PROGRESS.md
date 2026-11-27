# Progress

**Now:** Brief, treatment, verse timings (`../../assets/verses.json`) and shot prompts (`drafts/prompts.md`) are ready.

**Route change:** the user can't pay for AI generation. We're building the film from **free stock footage (Pixabay)**, plus motion graphics and effects in Remotion. The symbolic shots that won't exist as stock (faces in the earth, skin turning into a tablet, the same grandfather and grandson throughout) get realised with effects: match-dissolves, layers, dust.

**Environment:**
- `pixabay.com` and `cdn.pixabay.com` are allowed.
- The Pixabay key is the `PIXABAY_API_KEY` environment variable, which the user adds in the environment settings. Pixabay takes the key as a `key=` query parameter, so it can't be a network secret.
- Pexels stopped issuing keys. Its saved network secret is unusable (401).

**User still owes:** the poet's name, and background music (yes/no).

**Next:**
1. Search Pixabay videos for each shot in the treatment and download the best landscape 1080p clips into `assets/`.
2. Show the user a contact sheet of the picks.
3. Build in Remotion: clips with slow push-ins and crossfades, a unified warm grade, dust overlay, Amiri hemistich typography synced to `verses.json`, intro and outro.
4. Render, then watch it fully before delivering.
