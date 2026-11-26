# CLAUDE.md

## Installed tools

- **Superpowers** and **agent-skills** — Claude Code plugins, declared in `.claude/settings.json` (installed automatically when the project is trusted).
- **Playwright MCP** — browser automation, configured in `.mcp.json`.
- **gstack** — installed globally (not in this repo). If it is missing, install it with:

  ```bash
  git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
  cd ~/.claude/skills/gstack && ./setup
  ```
