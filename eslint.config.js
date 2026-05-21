// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
	files: ["**/*.js"],
	plugins: { js },
	extends: ["js/recommended"],
	rules: { "no-unused-vars": ["warn", { "varsIgnorePattern": "Types" }] },
	languageOptions: { globals: globals.browser }
  }
]);