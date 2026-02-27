# Codex Execution Plans (ExecPlans) — OMNIEL

This repository uses ExecPlans for any multi-step delivery.

## Requirements for every ExecPlan
- The ExecPlan must be a single fenced code block labeled `md` (no nested fences inside).
- It must be runnable by an agent with ONLY the current working tree + this file.

## Must include
1) Title
2) Purpose + Acceptance Criteria
3) Progress checklist
4) Repo Context
5) Milestones (each independently verifiable)
6) Concrete Steps (commands + expected outputs)
7) Idempotence/Recovery notes
8) Decision Log (fill during work)
9) Surprises/Discoveries (fill during work)

## Execution Rules
- After each milestone: run verification commands and fix failures before moving on.
- Commit after each milestone with a clear message.
- Prefer safe, minimal changes; avoid large refactors unless required.