module.exports = {
  extends: "@meshtastic/eslint-config",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
    env: {
      jest: true,
    },
  },
  rules: {
    "react-hooks/exhaustive-deps": 0,
  },
};
