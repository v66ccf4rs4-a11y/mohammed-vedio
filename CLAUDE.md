# CLAUDE.md

## Installed tools

- **Plugins** (declared in `.claude/settings.json`, installed automatically when the project is trusted):
  - Superpowers, agent-skills — engineering workflow (planning, TDD, review)
  - impeccable, frontend-design — UI design quality
  - HyperFrames — video from HTML (`npx hyperframes`, needs Node 22+ and FFmpeg)
- **Remotion skills** — synced from the claude.ai account.
- **Playwright MCP** — browser automation, configured in `.mcp.json`.
- **gstack** — installed globally by the cloud environment's setup script. If it is missing, install it with:

  ```bash
  git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
  cd ~/.claude/skills/gstack && ./setup
  ```
