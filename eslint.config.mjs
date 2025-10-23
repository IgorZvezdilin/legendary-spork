import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:prettier/recommended",
    "plugin:tailwindcss/recommended" // ✅ adds Prettier integration
  ),
  {
    plugins: ["prettier"],
    rules: {
      "prettier/prettier": ["error"], // ✅ Prettier errors appear in ESLint
      "tailwindcss/classnames-order": "warn", // warns unsorted classes (Prettier fixes it)
      "tailwindcss/no-custom-classname": "off", // disable false positives
      "tailwindcss/no-arbitrary-value": "off", // keep custom values like [.06]
      "tailwindcss/enforces-shorthand": ["warn", { fix: true }], // ✅ auto-fix for shorthand like /[.06] → /6
    },
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
