/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["src"],
  collectCoverageFrom: ["**/*.ts"],
  coveragePathIgnorePatterns: [
    "<rootDir>/.*/index.ts",
    "<rootDir>/test",
    "<rootDir>/src/ClickOptions.ts",
    "<rootDir>/src/CommandOptions.ts",
    "<rootDir>/src/KeyboardCommand.ts",
    "<rootDir>/src/KeyboardOptions.ts",
    "<rootDir>/src/KeyCodeCommand.ts",
    "<rootDir>/src/KeystrokeCommand.ts",
    "<rootDir>/src/ScreenReader.ts",
    "<rootDir>/src/ScreenReaderCaption.ts",
    "<rootDir>/src/ScreenReaderCursor.ts",
    "<rootDir>/src/ScreenReaderKeyboard.ts",
    "<rootDir>/src/ScreenReaderMouse.ts",
    "<rootDir>/src/macOS/Applications.ts",
    "<rootDir>/src/macOS/KeyboardCommand.ts",
    "<rootDir>/src/macOS/KeyCodeCommand.ts",
    "<rootDir>/src/macOS/KeyCodes.ts",
    "<rootDir>/src/macOS/KeystrokeCommand.ts",
    "<rootDir>/src/macOS/Modifiers.ts",
    "<rootDir>/src/macOS/VoiceOver/ClickButton.ts",
    "<rootDir>/src/macOS/VoiceOver/ClickCount.ts",
    "<rootDir>/src/macOS/VoiceOver/CommanderCommands.ts",
    // TODO: add tests for setting configuration
    "<rootDir>/src/macOS/VoiceOver/configureSettings.ts",
    "<rootDir>/src/macOS/VoiceOver/Containments.ts",
    "<rootDir>/src/macOS/VoiceOver/Directions.ts",
    // TODO: flesh out LogStore tests
    "<rootDir>/src/macOS/VoiceOver/LogStore.ts",
    "<rootDir>/src/macOS/VoiceOver/Places.ts",
    "<rootDir>/src/windows/NVDA/keyCodeCommands.ts",
    "<rootDir>/src/windows/NVDA/NVDA.ts",
    "<rootDir>/src/windows/NVDA/NVDAClient.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
