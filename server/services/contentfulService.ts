import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { ApolloClient, gql } from '@apollo/client/core'
import { BannerApollo } from '../data/interfaces/contentfulApi/bannerApollo'

export default class ContentfulService {
  constructor(private readonly apolloClient: ApolloClient<unknown>) {}

  /**
   * Get `banner` entry.
   */
  public async getBanner(activeCaseLoadId: string | undefined): Promise<string> {
    const filter = activeCaseLoadId
      ? { OR: [{ prisons_exists: false }, { prisons_contains_some: activeCaseLoadId }] }
      : { prisons_exists: false }

    const getBannerQuery = gql`
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

    return items.map((banner: BannerApollo) => ({
      ...banner,
      text: documentToHtmlString(banner.text.json),
    }))[0]?.text
  }
}
