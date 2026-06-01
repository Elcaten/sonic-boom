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
      { type: "core", pattern: "src/core/**", mode: "full" },
      {
        type: "screens",
        pattern: "src/screens/(*)/**",
        capture: ["slice"],
        mode: "full",
      },
      {
        type: "widgets",
        pattern: "src/widgets/(*)/**",
        capture: ["slice"],
        mode: "full",
      },
      {
        type: "features",
        pattern: "src/features/(*)/**",
        capture: ["slice"],
        mode: "full",
      },
      {
        type: "entities",
        pattern: "src/entities/(*)/**",
        capture: ["slice"],
        mode: "full",
      },
      { type: "shared", pattern: "src/shared/**", mode: "full" },
    ],
  },
  rules: {
    "boundaries/dependencies": [
      "error",
      {
        default: "disallow",
        rules: [
          {
            from: { type: "core" },
            allow: [
              { to: { type: ["core", "screens", "widgets", "features", "entities", "shared"] } },
            ],
          },
          {
            from: { type: "screens" },
            allow: [
              { to: { type: ["widgets", "features", "entities", "shared"] } },
              {
                to: {
                  type: "screens",
                  captured: { slice: "{{ from.captured.slice }}" },
                },
              },
            ],
          },
          {
            from: { type: "widgets" },
            allow: [
              { to: { type: ["features", "entities", "shared"] } },
              {
                to: {
                  type: "widgets",
                  captured: { slice: "{{ from.captured.slice }}" },
                },
              },
            ],
          },
          {
            from: { type: "features" },
            allow: [
              { to: { type: ["entities", "shared"] } },
              {
                to: {
                  type: "features",
                  captured: { slice: "{{ from.captured.slice }}" },
                },
              },
            ],
          },
          {
            from: { type: "entities" },
            allow: [
              { to: { type: ["shared"] } },
              {
                to: {
                  type: "entities",
                  captured: { slice: "{{ from.captured.slice }}" },
                },
              },
            ],
          },
          {
            from: { type: "shared" },
            allow: [{ to: { type: ["shared"] } }],
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
            group: ["@/features/*/{ui,model,lib,api,config}/**"],
            message: "Use feature public API: @/features/<slice>",
          },
          {
            group: ["@/entities/*/{ui,model,lib,api,config}/**"],
            message: "Use entity public API: @/entities/<slice>",
          },
          {
            group: ["@/screens/*/{ui,model,lib,api,config}/**"],
            message: "Use screen public API: @/screens/<slice>",
          },
          {
            group: ["@/widgets/*/{ui,model,lib,api,config}/**"],
            message: "Use widget public API: @/widgets/<slice>",
          },
          {
            group: [
              "@/features/*/ui/*",
              "@/features/*/ui/**/*",
              "@/features/*/model/*",
              "@/features/*/model/**/*",
              "@/features/*/lib/*",
              "@/features/*/lib/**/*",
              "@/features/*/api/*",
              "@/features/*/api/**/*",
              "@/features/*/config/*",
              "@/features/*/config/**/*",
            ],
            message: "Use feature public API: @/features/<slice>",
          },
          {
            group: [
              "@/entities/*/ui/*",
              "@/entities/*/ui/**/*",
              "@/entities/*/model/*",
              "@/entities/*/model/**/*",
              "@/entities/*/lib/*",
              "@/entities/*/lib/**/*",
              "@/entities/*/api/*",
              "@/entities/*/api/**/*",
              "@/entities/*/config/*",
              "@/entities/*/config/**/*",
            ],
            message: "Use entity public API: @/entities/<slice>",
          },
          {
            group: [
              "@/screens/*/ui/*",
              "@/screens/*/ui/**/*",
              "@/screens/*/model/*",
              "@/screens/*/model/**/*",
              "@/screens/*/lib/*",
              "@/screens/*/lib/**/*",
              "@/screens/*/api/*",
              "@/screens/*/api/**/*",
              "@/screens/*/config/*",
              "@/screens/*/config/**/*",
            ],
            message: "Use screen public API: @/screens/<slice>",
          },
          {
            group: [
              "@/widgets/*/ui/*",
              "@/widgets/*/ui/**/*",
              "@/widgets/*/model/*",
              "@/widgets/*/model/**/*",
              "@/widgets/*/lib/*",
              "@/widgets/*/lib/**/*",
              "@/widgets/*/api/*",
              "@/widgets/*/api/**/*",
              "@/widgets/*/config/*",
              "@/widgets/*/config/**/*",
            ],
            message: "Use widget public API: @/widgets/<slice>",
          },
          {
            group: ["@/shared/lib/*/*", "@/shared/ui/*/*", "@/shared/api/*/*"],
            message:
              "Use shared segment API index: @/shared/lib/<segment>, @/shared/ui, @/shared/api/<segment>",
          },
        ],
      },
    ],
  },
};
