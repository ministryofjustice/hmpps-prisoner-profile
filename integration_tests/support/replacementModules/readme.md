# Replacement modules for integration testing

Cypress 15 uses webpack 5 to transform test cases and run them in the browser.
This version of webpack no longer supports polyfilling node standard modules.
While tests here do not actually _use_ node standard modules, they reference modules (via type and mock imports)
that themselves import them –  webpack cannot tell that they are unused so transpilation fails.

Files in this folder are the minimal browser-compatible reimplementations of modules that do not transpile.
They are installed in `/cypress.config.ts`.
