import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import hooks from "eslint-plugin-react-hooks";
export default tseslint.config(
  { ignores: ["dist/**", "evidence/**", ".react-fixture/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { files: ["src/**/*.{ts,tsx}"], plugins: { "react-hooks": hooks }, rules: hooks.configs.recommended.rules },
);
