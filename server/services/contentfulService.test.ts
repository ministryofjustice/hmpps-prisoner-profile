import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import ContentfulService from './contentfulService'

describe('ContentfulService', () => {
  let contentfulService: ContentfulService

  beforeEach(() => {
    contentfulService = new ContentfulService(new ApolloClient<unknown>({ cache: new InMemoryCache() }))
  })

  it('Should get the banner for the users caseload', async () => {
    const apolloSpy = jest
      .spyOn<any, string>(contentfulService['apolloClient'], 'query')
      .mockResolvedValue({ data: { bannerCollection: [] } })

    await contentfulService.getBanner('LEI')

    expect(apolloSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          condition: { OR: [{ prisons_exists: false }, { prisons_contains_some: 'LEI' }] },
        },
      }),
    )
  })

  it('Should get the banner for the users without a caseload', async () => {
    const apolloSpy = jest
      .spyOn<any, string>(contentfulService['apolloClient'], 'query')
      .mockResolvedValue({ data: { bannerCollection: [] } })

    await contentfulService.getBanner(undefined)

    expect(apolloSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          condition: { prisons_exists: false },
        },
      }),
    )
  })
})
