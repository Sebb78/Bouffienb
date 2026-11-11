import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,                        // règles de base : variable non déclarée, doublons, etc.
  { languageOptions: { ecmaVersion: 2023, sourceType: "module", globals: globals.browser } }
];