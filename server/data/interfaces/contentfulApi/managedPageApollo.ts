import { Document } from '@contentful/rich-text-types'

export interface ManagedPage {
  title: string
  slug: string
  content?: string
}

export interface ManagedPageApollo {
  title: string
  slug: string
  content?: {
    json: Document
    links?: ArticleTextLinks
  }
}

export interface ManagedPagesQuery {
  managedPageCollection: {
    items: ManagedPageApollo[]
  }
}

type ManagedPageCondition = { slug: string }
type ManagedPageFilter = ManagedPageCondition | { OR: ManagedPageCondition[] }

export interface ManagedPagesQueryVariables {
  condition: ManagedPageFilter
}

/** Asset links within a Contentful GraphQL “Rich Text” field */
export interface ArticleTextLinks {
  assets?: ArticleTextAssets
}

interface ArticleTextAssets {
  block?: Asset[]
  hyperlink?: Asset[]
}

interface Asset {
  __typename: 'Asset'
  sys: { id: string }
  contentType: string
  url: string
  title: string
  description: string
  fileName?: string
  width?: number
  height?: number
}
