const { globSync } = require('node:fs')
const { copy } = require('esbuild-plugin-copy')
const { typecheckPlugin } = require('@jgoz/esbuild-plugin-typecheck')
const { buildNotificationPlugin } = require('./utils')

/**
 * Build typescript application into CommonJS
 * @type {BuildStep}
 */
const getAppConfig = buildConfig => ({
  entryPoints: globSync(buildConfig.app.entryPoints),
  outdir: buildConfig.app.outDir,
  bundle: false,
  sourcemap: true,
  platform: 'node',
  format: 'cjs',
  plugins: [
    typecheckPlugin({ watch: buildConfig.isWatchMode }),
    copy({
      resolveFrom: 'cwd',
      assets: buildConfig.app.copy,
    }),
    buildNotificationPlugin('App', buildConfig.isWatchMode),
  ],
})

module.exports = { getAppConfig }
