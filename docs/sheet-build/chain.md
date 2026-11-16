# Hand-run chain for milestone 0

This runs steps 0.2a to 0.2c, until `bin/step-next --run` exists. Each stage is a fresh thread in the
step's worktree. A thread does its stage, starts the next thread as its last action, and stops. The
step's id comes from the message that started the thread.

A step goes: brief, then you, then tests, build round 1 and review round 1. Must-fix findings add build
and review round 2, then an escalation round 3. Then it comes to you, and closing it starts the next
step's brief.

## Every stage

- Read AGENTS.md and `docs/sheet-build/briefs/<id>.md` first. The brief's instruction to commit
  overrides AGENTS.md's rule about committing.
- Templates live in `docs/character-sheet-build-plan.html#templates` until step 0.2a copies them into
  `docs/sheet-build/`. After that, use the copies.
- Run tools through `env mise exec --`. If `frontend/node_modules` is missing, run
  `env mise exec -- bin/setup` once.
- Stage files by name, never with `git add -A` or `git add .`.
- Leave alone any uncommitted change you didn't make. Don't stage it.
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

- Grok 4.7:
  `{"instanceId":"cursor","model":"grok-4.7","options":[{"id":"fastMode","value":false},{"id":"contextWindow","value":"256k"}]}`
- GPT-6.1 Sol:
  `{"instanceId":"codex","model":"gpt-6.1-sol","options":[{"id":"reasoningEffort","value":"high"}]}`
- Opus 5.5:
  `{"instanceId":"claudeAgent","model":"claude-opus-5-5","options":[{"id":"effort","value":"high"},{"id":"fastMode","value":false}]}`

## brief (Opus 5.5)

Read AGENTS.md, then `#ground`, `#workflow`, `#templates` and the step's own section of
`docs/character-sheet-build-plan.html`. Write the brief from the step brief template, with
`feature/sheet-m0` as the milestone branch and this worktree's branch as the step branch. Save it to
`docs/sheet-build/briefs/<id>.md` and commit it.

Then stop. Your final message lists the decisions the plan left open and how the brief settles them,
so the person who owns the plan can overrule them. When they say to go ahead, commit any changes they
asked for and start tests.

## tests (GPT-6.1 Sol)

Write the failing tests the brief lists. Don't write implementation code. Confirm that each new test
fails, and for the reason you expect. Commit only the tests, with a subject starting `test(<id>):`.
Then start build, round 1, with the model the brief names as its implementer.

## build (the brief's implementer, then Opus 5.5)

Round 1: build the step as the brief says, until its tests and its Finish checks pass. Commit each
time another test passes. Don't edit the tests you were given. If one is wrong, say so in the handoff.
Write the handoff the brief describes.

Round 2: read `docs/sheet-build/reviews/<id>-round-1.md`, fix its must-fix findings and nothing else,
rerun the Finish checks and update the handoff.

Round 3 runs on Opus 5.5 after an escalation. Read both reviews, fix the must-fix findings still open
in round 2 and nothing else, rerun the Finish checks and update the handoff.

Then start review, for the same round.

## review (GPT-6.1 Sol)

Use the reviewer prompt from the templates, with `feature/sheet-m0` as the milestone branch and this
worktree's branch as the step branch. Edit nothing except the review file. Include any earlier round's
findings.

Rerun the brief's Finish checks yourself and put the results at the top of the review. Compare the test
files against the `test(<id>):` commit and report any edit.

Instead of the template's last line, write the round to `docs/sheet-build/reviews/<id>-round-<r>.md`
and commit only that file.

- Round 1 with must-fix findings: start build, round 2, with the brief's implementer.
- Round 2 with must-fix findings, when the brief's implementer is Grok 4.7: start build, round 3, on
  Opus 5.5.
- Anything else: start no thread. The step now goes to the person who owns the plan. Summarise the
  outcome in your final message, and ask them to say roughly how long their review took when they
  approve.

## Closing a step

When the person who owns the plan approves the step, the thread they approve it in does this:

1. Write `docs/sheet-build/log/<id>.md` from the log entry template. The plan's 0.2b section says where
   each agent's tokens and Codex's percentages come from. Use their review time if they gave it.
   Commit the entry.
2. Push the step branch with `git push -u origin <branch>`. Open a pull request into
   `feature/sheet-m0` with `gh pr create`, titled `Step <id>: <title>`. Its description summarises the
   handoff and links the brief, handoff, reviews and log entry. If `link_pull_request` is listed, link
   the pull request to this thread.
3. Merge it with `gh pr merge <number> --merge`. Then update the local milestone branch with
   `git fetch origin feature/sheet-m0:feature/sheet-m0`.
4. Start the next step's brief, unless this step was 0.2c. Launch it with Opus 5.5 and
   `{"type":"worktree","baseRef":"feature/sheet-m0","branch":"sheet-m0/<next id>-<slug>","startFromOrigin":true}`,
   with the message `You are the brief stage of step <next id>. Follow docs/sheet-build/chain.md.`
   The next step is the one after this in the plan's milestone 0 section.
5. Last, from the repository's main checkout, remove this worktree, then delete the step branch locally
   and with `git push origin --delete <branch>`.
