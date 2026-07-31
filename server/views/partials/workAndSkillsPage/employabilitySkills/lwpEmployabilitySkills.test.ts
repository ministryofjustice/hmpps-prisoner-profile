import nunjucks from 'nunjucks'
import * as cheerio from 'cheerio'
import { parseISO } from 'date-fns'
import { Result } from '../../../../utils/result/result'

const njkEnv = nunjucks.configure([
  'node_modules/govuk-frontend/govuk/',
  'node_modules/govuk-frontend/govuk/components/',
  'node_modules/govuk-frontend/govuk/template/',
  'node_modules/govuk-frontend/dist/',
  'node_modules/@ministryofjustice/frontend/',
  'server/views/',
  __dirname,
])

const templateParams = {
  employabilitySkills: Result.fulfilled([]),
}
const template = 'lwpEmployabilitySkills.njk'

describe('Work and Skills Page - Employability skills panel tests', () => {
  it('should render given prisoner has employability skills', () => {
    const params = {
      ...templateParams,
      employabilitySkills: Result.fulfilled([
        {
          employabilitySkillType: 'TEAMWORK',
          employabilitySkillRating: 'QUITE_CONFIDENT',
          evidence: 'Demonstrated in class',
          sessionType: 'EDUCATION_REVIEW',
          sessionTypeDescription: 'Maths class',
          createdBy: 'asmith_gen',
          createdByDisplayName: 'Alex Smith',
          createdAt: parseISO('2023-01-16T09:14:43.158Z'),
          updatedBy: 'asmith_gen',
          updatedByDisplayName: 'Alex Smith',
          updatedAt: parseISO('2023-09-23T14:43:02.094Z'),
        },
      ]),
    }

    // When
    const content = njkEnv.render(template, params)
    const $ = cheerio.load(content)

    // Then
    expect($('[data-qa=add-employability-skills]').length).toEqual(0)
    expect($('[data-qa=view-employability-skills]').length).toEqual(1)
    expect($('[data-qa=lwp-unavailable-message]').length).toEqual(0)
  })

  it('should render given prisoner has no employability skills', () => {
    const params = {
      ...templateParams,
      employabilitySkills: Result.fulfilled([]),
    }

    // When
    const content = njkEnv.render(template, params)
    const $ = cheerio.load(content)

    // Then
    expect($('[data-qa=add-employability-skills]').length).toEqual(1)
    expect($('[data-qa=view-employability-skills]').length).toEqual(0)
    expect($('[data-qa=lwp-unavailable-message]').length).toEqual(0)
  })

  it('should render given employability skills promise is not resolved', () => {
    const params = {
      ...templateParams,
      employabilitySkills: Result.rejected('Error retrieving LWP Employability Skills'),
    }

    // When
    const content = njkEnv.render(template, params)
    const $ = cheerio.load(content)

    // Then
    expect($('[data-qa=add-employability-skills]').length).toEqual(0)
    expect($('[data-qa=view-employability-skills]').length).toEqual(0)
    expect($('[data-qa=lwp-unavailable-message]').length).toEqual(1)
  })
})
