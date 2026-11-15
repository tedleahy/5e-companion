# Hand-run chain for milestone 0

This runs a step until `bin/step-next --run` exists, which step 0.2c builds. Each stage is a
fresh thread in the step's worktree. A thread does its stage, starts the next thread as its last
action, and stops. The step's id comes from the message that started the thread.

## Every stage

- Read AGENTS.md and `docs/sheet-build/briefs/<id>.md` first. The brief's instruction to commit
  overrides AGENTS.md's rule about committing.
- Run tools through `env mise exec --`. If `frontend/node_modules` is missing, run
  `env mise exec -- bin/setup` once.
- Stage files by name, never with `git add -A` or `git add .`.
- Leave alone any uncommitted change you didn't make, such as one to AGENTS.md. Don't stage it.
- If you're stuck, or the brief turns out to be wrong, don't start the next thread. Say what happened in
  your final message.

## Starting the next thread

Call `t3_thread_launch` once, with:

- `title`: `Step <id> <stage>`, plus the round for build and review.
- `workspaceStrategy`:
  `{"type":"existing_worktree","worktreePath":"<this worktree's absolute path>","branch":"<this branch>"}`
- `modelSelection`: the stage's value below.
- `message`: `You are the <stage> stage of step <id>, round <r>. Follow docs/sheet-build/chain.md.`

If the tool isn't listed and `T3_ACP_MCP_NODE` is set, make the same call through the terminal:

```
ELECTRON_RUN_AS_NODE=1 "$T3_ACP_MCP_NODE" ${T3_ACP_MCP_ENTRYPOINT:+"$T3_ACP_MCP_ENTRYPOINT"} acp-mcp-call t3_thread_launch '<json>'
```

If neither works, stop and say in your final message that the handover failed and which stage comes
next. If a call errors, check `t3_thread_list` before retrying, because the thread may already exist.

Model selections:

- tests and review:
  `{"instanceId":"codex","model":"gpt-6.1-sol","options":[{"id":"reasoningEffort","value":"high"}]}`
- build:
  `{"instanceId":"cursor","model":"grok-4.7","options":[{"id":"fastMode","value":false},{"id":"contextWindow","value":"256k"}]}`

## tests (GPT-6.1 Sol)

Write the failing tests the brief lists. Don't write implementation code. Confirm that each new test
fails, and for the reason you expect. Commit only the tests, with a subject starting `test(<id>):`.
Then start build, round 1.

## build (Grok 4.7)

Round 1: build the step as the brief says, until its tests and its Finish checks pass. Commit each
time another test passes. Don't edit the tests you were given. If one is wrong, say so in the handoff.
Write the handoff the brief describes.

Round 2: read `docs/sheet-build/reviews/<id>-round-1.md`, fix its must-fix findings and nothing else,
rerun the Finish checks and update the handoff.

Then start review, for the same round.

## review (GPT-6.1 Sol)

Use the reviewer prompt in `docs/character-sheet-build-plan.html#templates`, with
`feature/sheet-m<n>` as the milestone branch and this worktree's branch as the step branch. Edit nothing
except the review file. Include any earlier round's findings.

Rerun the brief's Finish checks yourself and put the results at the top of the review. Compare the test
files against the `test(<id>):` commit and report any edit.

Instead of the template's last line, write the round to `docs/sheet-build/reviews/<id>-round-<r>.md`
and commit only that file.

- Round 1 with must-fix findings: start build, round 2.
- Anything else: start no thread. Summarise the outcome in your final message, because the step now goes
  to the person who owns the plan. On round 2 with must-fix findings, say that the plan escalates it to
  Opus 5.5.
