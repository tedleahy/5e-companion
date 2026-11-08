# 5e-companion

## General rules

- Agents may commit to their own step branch without asking. Never commit directly to `main` or a
  milestone branch: those change only by merging approved work.
- Always use single quotes instead of curly apostrophes in code.
- Always use a dark theme when creating HTML plans or code reviews.
- Keep private helper functions close to their callers if they occur in the same file.
- Add comments explaining calculations or variables whose purpose is unclear. Explain why they exist rather than just restating the code.
- Default to `@param` descriptions for named functions, methods, and components in JSDoc and
  YARD. Explain what callers need to know: purpose, units, allowed values, ordering, defaults,
  what null means, side effects, or other constraints.
  - Choose parameter documentation per function: if any parameter has an `@param` tag, document
    every parameter, including each destructured prop, rest arguments, and unused parameters.
    Do not leave a function partially documented. This takes precedence over the exceptions below.
  - Omit all parameter tags for a function when its parameter names, types, and nearby code or
    method description already explain how to use it. Small private helpers and test helpers
    often fall into this case.
  - Skip routine inline callback parameters for `map`, `filter`, `catch`, event handlers,
    Promise executors, and test cases unless they have application-specific meaning or a
    non-obvious contract. Underscore-prefixed unused parameters need no documentation unless
    another parameter in the same function is documented.
  - Keep parameter descriptions concise instead of repeating the full method summary in each
    tag. Do not add a doc block solely to restate a simple expression.
  - When a tag is useful, say what the parameter is for, not just what it is. Separate the name
    from the description with a hyphen.
  - JSDoc: `@param props.drafts - The drafts to show, in the API's order.` Leave out types, since
    TypeScript already has them. Document destructured props as `@param props.name`, on the
    function rather than on its props type, so each description lives in one place.
  - YARD: `@param sort [String] - The requested sort order.` Keep the type in brackets, since Ruby
    has nowhere else to state it. Write `@return` the same way:
    `@return [Boolean] - Whether both parameters are valid.`

### Back-end rails code
- Add YARD documentation, except for where the contract is already obvious from the code.
- Don't add YARD documentation to `scope` declarations. YARD doesn't attach comments to them, so
  the docs never appear.
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
