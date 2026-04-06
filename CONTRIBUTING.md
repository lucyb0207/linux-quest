# Contributing to LinuxQuest

Thanks for your interest in making LinuxQuest better. There are three ways to contribute:

---

## Option 1 — Add a New Scenario (Fork + PR)

The fastest way to contribute. No backend changes needed — just a JSON file.

### Steps

1. **Fork** the repo on GitHub and clone your fork locally.

2. **Create a JSON file** in the right folder:
   - Standalone scenario → `scenarios/standalone/{your-scenario-id}.json`
   - Track scenario → `scenarios/tracks/{track-id}/{your-scenario-id}.json`

3. **Register it** in `scenarios/index.json`:
   - For standalone: add the id to the `"standalone"` array.
   - For a track: add the id to the `"scenarios"` array inside the correct track object.

4. **Open a Pull Request** against `main`. No app code changes are needed.

### Scenario rules

- Problem must feel real-world, not academic.
- `hints` array must have exactly 3 items — vague → specific.
- `solution` must be fully numbered and copy-pasteable.
- `commands` lists only the tool names, not the full answer.
- Max 5 tags.
- Standalone setup commands must use `~/linuxquest/` as the base directory. Never touch `/etc`, `/var`, `/usr`, or other system paths. Users must be able to run `rm -rf ~/linuxquest/` to clean up.

### Standalone scenario template

```json
{
  "id": "your-scenario-id",
  "title": "Short, action-oriented title",
  "type": "standalone",
  "difficulty": "beginner",
  "tags": ["tag1", "tag2"],
  "problem": "Describe the real-world situation the user is dropped into.",
  "setup": {
    "description": "What this setup step does.",
    "commands": ["mkdir -p ~/linuxquest/example"],
    "verify": "Command the user can run to confirm setup worked."
  },
  "hints": [
    "Vague nudge in the right direction.",
    "More specific hint about the approach.",
    "Almost the answer — name the exact command or flag."
  ],
  "commands": ["ls", "grep", "awk"],
  "solution": "1. Run this.\n2. Then run that.\n3. Verify with the verify command."
}
```

### Series scenario template

```json
{
  "id": "your-scenario-id",
  "title": "Short, action-oriented title",
  "type": "series",
  "difficulty": "intermediate",
  "tags": ["tag1", "tag2"],
  "series": {
    "track_id": "deploy-like-a-real-engineer",
    "track_title": "Deploy like a real engineer",
    "order": 3,
    "requires": ["scenario-one-id", "scenario-two-id"],
    "requires_description": "You need a running Node app from the previous step.",
    "environment": "vps"
  },
  "problem": "Describe the real-world situation the user is dropped into.",
  "setup": {
    "description": "What this setup step does.",
    "commands": [],
    "verify": "",
    "note": "Optional note shown to the user before they start."
  },
  "hints": [
    "Vague nudge in the right direction.",
    "More specific hint about the approach.",
    "Almost the answer — name the exact command or flag."
  ],
  "commands": ["nginx", "systemctl"],
  "solution": "1. Run this.\n2. Then run that."
}
```

---

## Option 2 — Suggest a Scenario (Open an Issue)

Have an idea for a scenario but don't want to write the JSON yourself? Open a GitHub Issue using the **Scenario Request** template and include:

- **Title**: what the user would do (e.g. "Set up log rotation with logrotate")
- **Type**: standalone or track (and which track if applicable)
- **Difficulty**: beginner / intermediate / advanced
- **The real-world situation**: a one-paragraph description of what the user is dropped into
- **Why it's useful**: what skill or concept it teaches

A maintainer or community member will pick it up and implement it.

---

## Option 3 — Report a Bug or Request an Enhancement (Open an Issue)

Found something broken? Have an idea to improve the UI, scenario content, or site behaviour? Open a GitHub Issue and include:

**For bugs:**
- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser and OS (if relevant)

**For enhancements:**
- What problem you're trying to solve
- Your proposed solution or idea
- Any alternatives you considered

Keep issues focused — one bug or one idea per issue.
