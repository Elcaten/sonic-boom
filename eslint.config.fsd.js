// @ts-check
/** @typedef {import("eslint/config").Config} FlatConfig */
/** @typedef {import("eslint").ESLint.Plugin} ESLintPlugin */

const boundaries = /** @type {ESLintPlugin} */ (
  /** @type {unknown} */ (require("eslint-plugin-boundaries"))
);

/** @type {FlatConfig} */
module.exports = {
  files: ["src/**/*.{ts,tsx}"],
  plugins: {
    boundaries,
  },
  settings: {
    "boundaries/include": ["src/**/*.{ts,tsx}"],
    "boundaries/legacy-templates": false,
    "boundaries/elements": [
      { type: "app", pattern: "src/app/**", mode: "full" },
      { type: "providers", pattern: "src/providers/**", mode: "full" },
      { type: "api", pattern: "src/api/**", mode: "full" },
      { type: "components", pattern: "src/components/**", mode: "full" },
      { type: "theme", pattern: "src/theme/**", mode: "full" },
      { type: "lib", pattern: "src/lib/**", mode: "full" },
      {
        type: "features",
        pattern: "src/features/(*)/**",
        capture: ["slice"],
        mode: "full",
      },
    ],
  },
  rules: {
    "boundaries/dependencies": [
      "error",
      {
        default: "disallow",
        rules: [
          {
            from: { type: "app" },
            allow: [{ to: { type: ["app", "providers", "features", "api", "lib", "components", "theme"] } }],
          },
          {
            from: { type: "providers" },
            allow: [{ to: { type: ["providers", "features", "api", "lib", "components", "theme"] } }],
          },
          {
            from: { type: "features" },
            allow: [
              { to: { type: ["features", "api", "lib", "components", "theme"] } },
              { to: { type: "features", captured: { slice: "{{ from.captured.slice }}" } } },
            ],
          },
          {
            from: { type: "api" },
            allow: [{ to: { type: ["api", "lib"] } }],
          },
          {
            from: { type: "components" },
            allow: [{ to: { type: ["components", "api", "lib", "theme"] } }],
          },
          {
            from: { type: "theme" },
            allow: [{ to: { type: ["theme"] } }],
          },
          {
            from: { type: "lib" },
            allow: [{ to: { type: ["lib"] } }],
          },
        ],
      },
    ],
    "boundaries/no-unknown": "off",
    "boundaries/no-unknown-files": "off",
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@/features/*/components/**", "@/features/*/hooks", "@/features/*/lib", "@/features/*/types"],
            message: "Use feature public API: @/features/<slice>",
          },
        ],
      },
    ],
  },
};
