import type { Config } from "jest";

const config: Config = {
  preset: "jest-expo",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
};

export default config;

// When adding new spec and updating the `test_runner_configurations` in `codespeak.json`:

// 1. create config files `jest.<SPEC_NAME>.test_command.ts` (copy contents of `jest.SAMPLE_SPEC.test_command.ts` to start) and `jest.<SPEC_NAME>.coverage_command.ts` (copy contents of `jest.SAMPLE_SPEC.coverage_command.ts` to start)
// 2. Use those sample commands when updating `codespeack.json`:

// ```json
// "run_all_tests_command": {
//   "command_line": "JEST_JUNIT_OUTPUT_FILE={tests_report_file} npx jest --config=jest.<SPEC_NAME>.test_command.ts",
//   "cwd": "."
// },
// "run_specified_tests_command": {
//   "command_line": "JEST_JUNIT_OUTPUT_FILE={tests_report_file} npx jest --config=jest.<SPEC_NAME>.test_command.ts {tests_list}",
//   "cwd": "."
// },
// "run_all_tests_with_coverage_command": {
//   "command_line": "JEST_JUNIT_OUTPUT_FILE={tests_report_file} npx jest --config=jest.<SPEC_NAME>.coverage_command.ts; _EC=$?; [ -f .coverage/<SPEC_NAME>/lcov.info ] && cp .coverage/<SPEC_NAME>/lcov.info {tests_coverage_report_file}; rm -rf .coverage/<SPEC_NAME>; exit $_EC",
//   "cwd": "."
// },
// "run_specified_tests_with_coverage_command": {
//   "command_line": "JEST_JUNIT_OUTPUT_FILE={tests_report_file} npx jest --config=jest.<SPEC_NAME>.coverage_command.ts {tests_list}; _EC=$?; [ -f .coverage/<SPEC_NAME>/lcov.info ] && cp .coverage/<SPEC_NAME>/lcov.info {tests_coverage_report_file}; rm -rf .coverage/<SPEC_NAME>; exit $_EC",
//   "cwd": "."
// },
// ```
