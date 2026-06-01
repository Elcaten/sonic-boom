# FSD Public API Policy

This project enforces a strict public API contract across FSD layers.

## Rules

- Import other slices only through their `index.ts` public API.
- Do not import another slice's internals (`ui`, `model`, `lib`, `api`, `config` paths).
- Keep same-slice imports relative (avoid importing your own slice through alias).
- For `shared`, use segment-level public APIs (`shared/ui`, `shared/lib/<segment>`, `shared/api/<segment>`), not deep files.

## Layer model in this repository

From highest to lowest:

1. `core`
2. `screens`
3. `widgets`
4. `features`
5. `entities`
6. `shared`

The `app` folder is route wiring and should import from public APIs of lower layers.

## Enforcement

ESLint (flat config) is configured with `eslint-plugin-fsd-lint` in strict mode for:

- layer direction checks
- cross-slice dependency checks
- public API sidestep checks
- relative import hygiene
