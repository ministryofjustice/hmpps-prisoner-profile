import type { BuildOptions } from 'esbuild'

export interface BuildConfig {
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

export type BuildStep = (buildConfig: BuildConfig) => BuildOptions
