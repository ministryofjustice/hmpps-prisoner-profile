import { Request, Response } from 'express'
import ContentfulService from '../../services/contentfulService'

export default class AccessibilityStatementController {
  constructor(private readonly contentfulService: ContentfulService) {}

  public async displayAccessibilityStatement(req: Request, res: Response) {
    const curiousResponse = await this.contentfulService.getManagedPage('prisoner-profile-accessibility-statement')
    return res.render('pages/accessibility/accessibility-statement', {
      pageTitle: 'Accessibility Statement',
      pageContent: curiousResponse.content,
    })
  }
}
