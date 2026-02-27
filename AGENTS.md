# OMNIEL — Agent Rules (Codex)

Codex MUST read and follow `.agent/PLANS.md` for any non-trivial work.

## General
- Prefer small, verifiable milestones (plan → implement → validate → repair).
- Keep existing repo layout unless a milestone explicitly migrates folders.
- Never commit secrets. Always use `.env.example`.

## When asked for an SPR
- Produce or execute an ExecPlan stored in `.agent/execplans/`.
- Update the ExecPlan progress checkboxes as milestones complete.