import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import ContentfulService from './contentfulService'
import { HmppsUser, PrisonUser } from '../interfaces/HmppsUser'

describe('ContentfulService', () => {
  let contentfulService: ContentfulService

  beforeEach(() => {
    contentfulService = new ContentfulService(new ApolloClient<unknown>({ cache: new InMemoryCache() }))
  })

  it('Should get the banner for the users caseload', async () => {
    const apolloSpy = jest
      .spyOn<any, string>(contentfulService['apolloClient'], 'query')
      .mockResolvedValue({ data: { bannerCollection: [] } })

    await contentfulService.getBanner({ authSource: 'nomis', activeCaseLoadId: 'LEI' } as PrisonUser)

    expect(apolloSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          condition: { OR: [{ prisons_exists: false }, { prisons_contains_some: 'LEI' }] },
        },
      }),
    )
  })

  it.each([
    { authSource: 'external' },
    { authSource: 'delius' },
    {
      authSource: 'nomis',
      activeCaseLoadId: null,
    } as PrisonUser,
  ])('Should get the banner for the users without an active caseload', async user => {
    const apolloSpy = jest
      .spyOn<any, string>(contentfulService['apolloClient'], 'query')
      .mockResolvedValue({ data: { bannerCollection: [] } })

    await contentfulService.getBanner(user as HmppsUser)

    expect(apolloSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          condition: { prisons_exists: false },
        },
      }),
    )
  })
})
