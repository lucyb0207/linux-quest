# LinuxQuest — Claude Code Instructions

## What this project is
A free, open source, static website for Linux/DevOps learners to 
practice real hands-on scenarios. No backend, no login, no cost. 
Hosted on GitHub Pages.

## Tech rules
- No npm, no React, no bundlers — plain HTML + CSS + vanilla JS only
- Must work by just opening index.html in a browser
- No external dependencies or CDN libraries
- Hosted on GitHub Pages (static files only)

## File structure
linuxquest/
├── CLAUDE.md
├── CLAUDE.local.md
├── .gitignore
├── index.html
├── README.md
├── CONTRIBUTING.md
├── assets/
│   ├── css/style.css
│   └── js/app.js
└── scenarios/
    ├── index.json
    ├── standalone/
    └── tracks/


## How scenarios load
app.js fetches scenarios/index.json first, which is the master list 
of all standalone scenarios and tracks. It then fetches each scenario 
JSON file and renders them dynamically. No rebuild needed to add a 
new scenario.

## index.json structure
{
  "standalone": [],
  "tracks": [
    {
      "id": "deploy-like-a-real-engineer",
      "title": "Deploy like a real engineer",
      "description": "Go from a blank VPS to a deployed Node app with nginx, firewall and environment config.",
      "environment": "vps",
      "scenarios": [
        "nginx-static-site",
        "nginx-reverse-proxy",
        "node-app-deploy",
        "firewall-ufw",
        "env-variables",
        "port-management"
      ]
    }
  ]
}

## Standalone scenario JSON schema
{
  "id": "",
  "title": "",
  "type": "standalone",
  "difficulty": "",
  "tags": [],
  "problem": "",
  "setup": {
    "description": "",
    "commands": [],
    "verify": ""
  },
  "hints": ["", "", ""],
  "commands": [],
  "solution": ""
}

## Series scenario JSON schema
{
  "id": "",
  "title": "",
  "type": "series",
  "difficulty": "",
  "tags": [],
  "series": {
    "track_id": "",
    "track_title": "",
    "order": 0,
    "requires": [],
    "requires_description": "",
    "environment": ""
  },
  "problem": "",
  "setup": {
    "description": "",
    "commands": [],
    "verify": "",
    "note": ""
  },
  "hints": ["", "", ""],
  "commands": [],
  "solution": ""
}

## Scenario rules
- Problems must feel real-world, not academic
- Hints array is always exactly 3, going from vague to specific
- Solution must be fully numbered and copy-pasteable
- Commands list is just the tool names, not the full answer
- Max 5 tags per scenario

## Safety rule
All standalone setup commands must use ~/linuxquest/ as the base 
directory. Never touch system paths like /etc, /var, /usr.
User must be able to run rm -rf ~/linuxquest/ to clean everything up.
Series scenarios are exempt as they run on a real VPS environment.

## UI sections
1. Homepage — two sections: Standalone cards, Tracks as a visual path
2. Scenario view — setup → problem → hints (reveal one at a time) →
   commands → solution (hidden, toggle to reveal)
3. Track view — shows ordered scenario path 01 → 02 → 03 with
   progress via localStorage. Always show a skip prerequisites option.

## Progress tracking
Uses localStorage only. No backend, no accounts.
Key format: "completed:{scenario-id}" = true
Tracks unlock when previous scenario is marked complete.
A "Reset Track" button clears all keys for that track.
Always provide a "Skip prerequisites" option so users are never blocked.

## Style
- Refer to STYLE.md

## Contributing a new scenario
1. Fork the repo
2. Add JSON file to scenarios/standalone/ or the correct track folder
3. Add the scenario id to scenarios/index.json
4. Open a PR — no app code changes needed