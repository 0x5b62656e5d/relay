import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        ignores: ["**/node_modules/**", "**/.next/**", "**/build/**", "next-env.d.ts"],
    },
    ...compat.extends("next/core-web-vitals", "next/typescript", "plugin:import/recommended"),
    {
        settings: {
            "import/resolver": {
                typescript: true,
            },
        },
        rules: {
            "import/order": [
                "error",
                {
                    groups: [["builtin", "external", "internal"]],
                    pathGroups: [
                        {
                            pattern: "react",
                            group: "external",
                            position: "before",
                        },
                    ],
                    pathGroupsExcludedImportTypes: ["builtin"],
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true,
                    },
                    "newlines-between": "always",
                },
            ],
        },
    },
];

export default eslintConfig;
