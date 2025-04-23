import * as cheerio from 'cheerio'
import nunjucks from 'nunjucks'
import path from 'path'
import { apostrophe } from '../utils/utils'

const env = nunjucks.configure(
  [
    path.join(__dirname, '../../server/views'),
    path.join(__dirname, '../../server/views/macros'),
    path.join(__dirname, '../../node_modules/govuk-frontend/dist'),
  ],
  { autoescape: true },
)
env.addFilter('apostrophe', apostrophe)

describe('workAndActivities.njk', () => {
  const templatePath = 'partials/workAndSkillsPage/workAndActivities.njk'

  const renderTemplate = (context: Record<string, any>) => {
    return env.render(templatePath, context)
  }

  it('should show the "Manage activity allocations" link when canManageAllocations is true', () => {
    const context = {
      isInUsersCaseLoad: jest.fn().mockReturnValue(true),
      canManageAllocations: true,
      manageAllocationsLinkUrl: '/manage-allocations',
      workAndSkillsPrisonerName: 'John Doe',
    }

    const html = renderTemplate(context)
    const $ = cheerio.load(html)

    const link = $('a[href="/manage-allocations"]')
    expect(link.length).toBe(1)
    expect(link.text().trim()).toBe('Manage John Doe’s activity allocations')
  })

  it('should not show the "Manage activity allocations" link when canManageAllocations is false', () => {
    const context = {
      isInUsersCaseLoad: jest.fn().mockReturnValue(true),
      canManageAllocations: false,
      manageAllocationsLinkUrl: '/manage-allocations',
      workAndSkillsPrisonerName: 'John Doe',
    }

    const html = renderTemplate(context)
    const $ = cheerio.load(html)

    const link = $('a[href="/manage-allocations"]')
    expect(link.length).toBe(0)
  })
})
