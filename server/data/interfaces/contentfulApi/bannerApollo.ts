import { Document } from '@contentful/rich-text-types'

export interface BannerApollo {
  text: {
    json: Document
  }
  prisons: string[]
}

export interface BannerQuery {
  bannerCollection: {
    items: BannerApollo[]
  }
}

type BannerCondition = { prisons_exists: boolean } | { prisons_contains_some: string }
type BannerFilter = BannerCondition | { OR: BannerCondition[] }

export interface BannerQueryVariables {
  condition: BannerFilter
}
