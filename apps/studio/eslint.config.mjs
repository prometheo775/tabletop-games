import nextEslintPluginNext from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import nx from "@nx/eslint-plugin";
import baseConfig from "../../eslint.config.mjs";

export default [
    {
        plugins: { "@next/next": nextEslintPluginNext },
        rules: { ...nextEslintPluginNext.configs.recommended.rules }
    },
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
        plugins: { "react-hooks": reactHooks },
        rules: { ...reactHooks.configs.recommended.rules }
    },
    ...nx.configs["flat/react-typescript"],
    ...baseConfig,
    {
        ignores: [
            ".next/**/*",
            "**/out-tsc"
        ]
    }
];
