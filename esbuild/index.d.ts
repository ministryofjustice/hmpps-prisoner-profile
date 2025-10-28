import type { BuildOptions } from 'esbuild'

interface BuildConfig {
  isProduction: boolean
  isWatchMode: boolean

  app: {
    outDir: string
    entryPoints: string[]
    copy: { from: string; to: string }[]
  }

  assets: {
    outDir: string
    entryPoints: string[]
    copy: { from: string; to: string }[]
    clear: string[]
  }
}

type BuildStep = (config: BuildConfig) => BuildOptions
