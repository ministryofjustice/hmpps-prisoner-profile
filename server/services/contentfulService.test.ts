import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import ContentfulService from './contentfulService'
import { HmppsUser, PrisonUser } from '../interfaces/HmppsUser'

jest.mock('@contentful/rich-text-html-renderer', () => ({
  documentToHtmlString: jest.fn(json => `<p>${json.content[0].value}</p>`),
}))

describe('ContentfulService', () => {
  let contentfulService: ContentfulService

  beforeEach(() => {
    contentfulService = new ContentfulService(
      new ApolloClient({
        cache: new InMemoryCache(),
        link: new HttpLink({}),
      }),
    )
  })

  it('Should get the banner for the users caseload', async () => {
    const apolloSpy = jest
      .spyOn(contentfulService.apolloClient, 'query')
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
      .spyOn(contentfulService.apolloClient, 'query')
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

  describe('getManagedPage', () => {
    it('should return a managed page with HTML content', async () => {
      const mockPage = {
        title: 'Test Page',
        slug: 'test-page',
        content: {
          json: { content: [{ value: 'Hello world' }] },
          // @ts-expect-error - ignore implicit any type
          links: { assets: { hyperlink: [], block: [] } },
        },
      }

      const apolloSpy = jest.spyOn(contentfulService.apolloClient, 'query').mockResolvedValue({
        data: {
          managedPageCollection: {
            items: [mockPage],
          },
        },
      })

      const result = await contentfulService.getManagedPage('test-page')

      expect(apolloSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: { condition: { slug: 'test-page' } },
        }),
      )
      expect(result.title).toBe('Test Page')
      expect(result.slug).toBe('test-page')
      expect(result.content).toBe('<p>Hello world</p>')
    })

    it('should throw an error if the page is not found', async () => {
      jest.spyOn(contentfulService.apolloClient, 'query').mockResolvedValue({
        data: { managedPageCollection: { items: [] } },
      })

      await expect(contentfulService.getManagedPage('missing-page')).rejects.toThrow('Page not found')
    })
  })
})
