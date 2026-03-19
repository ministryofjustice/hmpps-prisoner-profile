import { Request, Response } from 'express'
import { ApolloClient } from '@apollo/client'
import AccessibilityStatementController from './accessibilityStatementController'
import ContentfulService from '../../services/contentfulService'
import { ManagedPage } from '../../data/interfaces/contentfulApi/managedPageApollo'

jest.mock('../../services/contentfulService')

describe('AccessibilityStatementController', () => {
  let controller: AccessibilityStatementController
  let contentfulService: jest.Mocked<ContentfulService>
  let req: Partial<Request>
  let res: Partial<Response>

  beforeEach(() => {
    contentfulService = new ContentfulService({} as ApolloClient) as jest.Mocked<ContentfulService>
    controller = new AccessibilityStatementController(contentfulService)
    req = {}
    res = {
      render: jest.fn(),
    }
  })

  it('should render the accessibility statement page with content from contentful', async () => {
    const mockPage = { content: '<p>Accessibility content</p>' }
    contentfulService.getManagedPage.mockResolvedValue(mockPage as ManagedPage)

    await controller.displayAccessibilityStatement(req as Request, res as Response)

    expect(contentfulService.getManagedPage).toHaveBeenCalledWith('prisoner-profile-accessibility-statement')
    expect(res.render).toHaveBeenCalledWith('pages/accessibility/accessibility-statement', {
      pageTitle: 'Accessibility Statement',
      pageContent: '<p>Accessibility content</p>',
    })
  })
})
