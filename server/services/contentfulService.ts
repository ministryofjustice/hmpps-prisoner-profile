import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { ApolloClient, gql, TypedDocumentNode } from '@apollo/client'
import { BannerQuery, BannerQueryVariables } from '../data/interfaces/contentfulApi/bannerApollo'
import { HmppsUser } from '../interfaces/HmppsUser'
import {
  ManagedPage,
  ManagedPagesQuery,
  ManagedPagesQueryVariables,
} from '../data/interfaces/contentfulApi/managedPageApollo'

export default class ContentfulService {
  constructor(readonly apolloClient: ApolloClient) {}

  /**
   * Get `banner` entry.
   */
  public async getBanner(user: HmppsUser): Promise<string> {
    const activeCaseLoadId = user.authSource === 'nomis' && user.activeCaseLoadId

    const filter = activeCaseLoadId
      ? { OR: [{ prisons_exists: false }, { prisons_contains_some: activeCaseLoadId }] }
      : { prisons_exists: false }

    const getBannerQuery: TypedDocumentNode<BannerQuery, BannerQueryVariables> = gql`
      query Banner($condition: BannerFilter!) {
        bannerCollection(limit: 1, order: sys_publishedAt_DESC, where: $condition) {
          items {
            text {
              json
            }
            prisons
          }
        }
      }
    `

    const { items } = (
      await this.apolloClient.query({
        query: getBannerQuery,
        variables: { condition: filter },
      })
    ).data.bannerCollection

    if (!items?.length) {
      return undefined
    }

    return items.map(banner => ({
      ...banner,
      text: documentToHtmlString(banner.text.json),
    }))[0]?.text
  }

  public async getManagedPage(slug: string): Promise<ManagedPage> {
    const filter = { slug }

    const getManagedPageBySlugQuery: TypedDocumentNode<ManagedPagesQuery, ManagedPagesQueryVariables> = gql`
      query ManagedPageBySlug($condition: ManagedPageFilter!) {
        managedPageCollection(limit: 1, where: $condition) {
          items {
            title
            slug
            content {
              json
              links {
                assets {
                  hyperlink {
                    sys {
                      id
                    }
                    contentType
                    url
                    title
                    description
                    fileName
                  }
                  block {
                    sys {
                      id
                    }
                    contentType
                    url
                    title
                    width
                    height
                    description
                  }
                }
              }
            }
          }
        }
      }
    `

    const { items } = (
      await this.apolloClient.query({
        query: getManagedPageBySlugQuery,
        variables: { condition: filter },
      })
    ).data.managedPageCollection

    if (!items?.length) {
      throw new Error('Page not found')
    }

    return items.map(page => ({
      ...page,
      content: documentToHtmlString(page.content.json),
    }))[0]
  }
}
