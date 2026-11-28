# CLAUDE.md

## Installed tools

- **Plugins** (declared in `.claude/settings.json`, installed automatically when the project is trusted):
  - Superpowers, agent-skills — engineering workflow (planning, TDD, review)
  - impeccable, frontend-design — UI design quality
  - HyperFrames — video from HTML (`npx hyperframes`, needs Node 22+ and FFmpeg)
  - humanizer — removes signs of AI writing
  - linkedin-agent — 11 LinkedIn skills (posts, comments, profile, plan)
- **Project skills** (`.claude/skills/`): find-skills, hypit (video from a reference; CLI `hypit`), graphify (codebase knowledge graph; CLI `graphify`).
  - guizang-ppt-skill — magazine-style HTML slide decks (from op7418/guizang-ppt-skill).
  - ui-ux-pro-max, design, design-system, brand, banner-design, slides, ui-styling — app UI, banners and brand design (from nextlevelbuilder/ui-ux-pro-max-skill). Logo/icon generation scripts need a GEMINI_API_KEY.
- **Remotion skills** — synced from the claude.ai account.
- **MCP servers** (`.mcp.json`): Playwright and Chrome DevTools (headless browser automation and debugging), Context7 (up-to-date library docs; no key needed).
- **gstack**, and the `graphify`, `skillspector` and `hypit` CLIs — installed by the cloud environment's setup script.
- **SkillSpector** — scan any new skill before installing it: `skillspector scan <path-or-repo-url> --no-llm`.
- **gstack**: If it is missing, install it with:

  ```bash
  git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
  cd ~/.claude/skills/gstack && ./setup
  ```

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. When the answer is under a Markdown heading, `graphify section "<heading>"` prints that section's text, so the .md need not be opened. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
