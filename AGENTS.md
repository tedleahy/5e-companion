# 5e-companion

## General rules

### Back-end rails code
- Add YARD documentation, except for where the contract is already obvious from the code.
- Separate adjacent assertions in tests with newlines.

### Front-end Expo code
- Build UI from React Native primitives styled with `@/theme`, not `@expo/ui` or other native-look
  components. The app has its own design system (`docs/design-system.html`), which overrides the
  Expo skills' component advice.
- Never use raw hex values in styles; use a token from `@/theme`.
- Pick font weight with `fontFamily`, never `fontWeight`. Android won't synthesise weights.
- Use `useBreakpoint()` for layout that depends on window width.
- UI copy uses American spelling and sentence case.
- Nothing but routes in `src/app/`. Every file there becomes a route, tests included.
- The app runs in Expo Go. Say so before adding a package with native code that Expo Go lacks.
- Run `npm run lint`, `npm run typecheck` and `npm test` before finishing.
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
