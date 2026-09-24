# 5e-companion

## General rules

### Back-end rails code
- Add YARD documentation, except for where the contract is already obvious from the code.
- Separate adjacent assertions in tests with newlines.

## Agent shell

The agent shell's sandbox breaks direct execution of `mise` and its shims, and doesn't put `ruby` or
`node` on PATH. Prefix commands with `env mise exec --`, since wrapping in `env` bypasses the
interception:

```
env mise exec -- ruby -v
env mise exec -- bundle exec rails test
env mise exec -- node -v
```
