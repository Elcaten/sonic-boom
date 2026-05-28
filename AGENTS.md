# Testing

Use jest for testing with jest-expo preset. Base configuration is defined in `jest.config.ts`. Dont modify it, but you can check if for base values. When adding new spec and updating the `test_runner_configurations` in `codespeak.json`:

1. create config files `jest/jest.<SPEC_NAME>.test_command.ts` (copy contents of `jest/jest.SAMPLE_SPEC.test_command.ts` to start) and `jest/jest.<SPEC_NAME>.coverage_command.ts` (copy contents of `jest/jest.SAMPLE_SPEC.coverage_command.ts` to start)
2. Use those sample commands when updating `codespeack.json`:

```json
"run_all_tests_command": {
  "command_line": "JEST_JUNIT_OUTPUT_FILE={tests_report_file} npx jest --config=jest/jest.<SPEC_NAME>.test_command.ts",
  "cwd": "."
},
"run_specified_tests_command": {
  "command_line": "JEST_JUNIT_OUTPUT_FILE={tests_report_file} npx jest --config=jest/jest.<SPEC_NAME>.test_command.ts {tests_list}",
  "cwd": "."
},
"run_all_tests_with_coverage_command": {
  "command_line": "JEST_JUNIT_OUTPUT_FILE={tests_report_file} npx jest --config=jest/jest.<SPEC_NAME>.coverage_command.ts; _EC=$?; [ -f .coverage/<SPEC_NAME>/lcov.info ] && cp .coverage/<SPEC_NAME>/lcov.info {tests_coverage_report_file}; rm -rf .coverage/<SPEC_NAME>; exit $_EC",
  "cwd": "."
},
"run_specified_tests_with_coverage_command": {
  "command_line": "JEST_JUNIT_OUTPUT_FILE={tests_report_file} npx jest --config=jest/jest.<SPEC_NAME>.coverage_command.ts {tests_list}; _EC=$?; [ -f .coverage/<SPEC_NAME>/lcov.info ] && cp .coverage/<SPEC_NAME>/lcov.info {tests_coverage_report_file}; rm -rf .coverage/<SPEC_NAME>; exit $_EC",
  "cwd": "."
},
```
