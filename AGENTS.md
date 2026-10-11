# 5e-companion

## General rules

- Don't commit any changes unless explicitly asked to.
- Always use single quotes instead of curly apostrophes in code.
- Always use a dark theme when creating HTML plans or code reviews.
- Keep private helper functions close to their callers if they occur in the same file.
- Add comments explaining calculations or variables whose purpose is unclear. Explain why they exist rather than just restating the code.
- Give every function parameter an `@param` description, in JSDoc and YARD alike, even when the
  rest of the doc comment could be skipped. Say what the parameter is for, not just what it is.
  Separate the name from the description with a hyphen.
  - JSDoc: `@param props.drafts - The drafts to show, in the API's order.` Leave out types, since
    TypeScript already has them. Describe each destructured prop as `@param props.name`, on the
    function rather than on its props type, so each description lives in one place.
  - YARD: `@param sort [String] - The requested sort order.` Keep the type in brackets, since Ruby
    has nowhere else to state it.


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
- Run `npm run format:check`, `npm run lint`, `npm run typecheck` and `npm test` before finishing.
  `npm run format` fixes formatting.
- Separate adjacent assertions in tests with newlines.
- Add JSDoc to any type, function, or exported variable unless it's already immediately obvious what it does without the JSDoc

## Agent shell

The agent shell's sandbox breaks direct execution of `mise` and its shims, and doesn't put `ruby` or
`node` on PATH. Prefix commands with `env mise exec --`, since wrapping in `env` bypasses the
interception:

```
env mise exec -- ruby -v
env mise exec -- bundle exec rails test
env mise exec -- node -v
```
