import WorkAndSkillsPage from '../pages/workAndSkillsPage'

import Page from '../pages/page'

const visitWorkAndSkillsPage = (): WorkAndSkillsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/work-and-skills' })
  return Page.verifyOnPage(WorkAndSkillsPage)
}

context('Work and Skills Page', () => {
  const prisonerNumber = 'G6123VU'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.setupBannerStubs({ prisonerNumber })
    cy.setupWorkAndSkillsPageStubs({ prisonerNumber })
  })

  it('Work and Skills page is displayed', () => {
    visitWorkAndSkillsPage()
    cy.request('/prisoner/G6123VU/work-and-skills').its('body').should('contain', 'Work and Skills')
  })

  it('Displays the Work and skills tab as active', () => {
    const workAndSkillsPage = visitWorkAndSkillsPage()
    workAndSkillsPage.activeTab().should('contain', 'Work and skills')
  })

  context('Sidebar', () => {
    it('Sidebar is displayed', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.sidebar().should('exist')
      workAndSkillsPage.sidebar().contains('a', 'Courses and qualifications')
      workAndSkillsPage.sidebar().contains('a', 'Work and activities')
      workAndSkillsPage.sidebar().contains('a', 'Employability skills')
      workAndSkillsPage.sidebar().contains('a', 'Goals')
      workAndSkillsPage.sidebar().contains('a', 'Functional skills level')
    })
  })

  context('Main', () => {
    it('Main block is displayed', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.main().should('exist')
    })
  })

  context('Courses and Qualifications card', () => {
    it('The card is displayed', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.CAQ_card().should('exist')
    })
    it('The card summary header contains Courses and qualifications', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.CAQ_header().contains('Courses and qualifications')
    })

    it('The card contains information about the card', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage
        .CAQ_info()
        .contains('This only includes educational courses. Contact the local education team to find out more.')
    })

    it('The card has a heading containing Current courses', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.CAQ_courses().contains('Current courses')
    })

    it('The card has a list key should contain "string"', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.CAQ_listKey().contains('string')
    })

    it('The card has a list value should contain end date 1 March 2023', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.CAQ_listValue().contains('Planned end date on 1 March 2023')
    })

    it('The card has a CTA link', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.CAQ_viewHistory().contains('View full course history')
    })
  })

  context('Work and activities card', () => {
    it('The card is displayed', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.WAA_card().should('exist')
    })

    it('The card summary header contains Work and activities', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.WAA_header().contains('Work and activities')
    })

    it('The card summary header contains Work and activities', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.WAA_header().contains('Work and activities')
    })

    it('The card has a list key that should contain Braille am', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.WAA_keyChild1().contains('Braille am')
    })

    it('The card contains the text Unacceptable absences', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.WAA_absences().contains('Unacceptable absences')
    })

    it('The card contains a key with the text Last 30 days', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.WAA_last30Days().contains('Last 30 days')
    })

    it('The card contains a value with the text Work "0"', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.WAA_valueChild1().contains('0')
    })

    it('The card contains the text John Saunders has no....', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.WAA_label().contains('John Saunders has no unacceptable absences in the last 6 months.')
    })
  })

  context('Employability skills card', () => {
    it('The card is displayed', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.ES_card().should('exist')
    })
    it('The card summary header should display', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.ES_header().should('exist')
      workAndSkillsPage.ES_header().contains('Employability skills')
      workAndSkillsPage.ES_heading().contains('Most recent levels')
      workAndSkillsPage.ES_skillOne().contains('string')
      workAndSkillsPage.ES_skillLevelOne().contains('string')
    })
  })

  context('Goals card', () => {
    it('The card is displayed', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.GoalsCard().should('exist')
    })
    it('The card details should display', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.GoalsHeader().should('exist')
      workAndSkillsPage.GoalsHeader().contains('Goals')

      workAndSkillsPage.GoalsInfo().should('exist')
      workAndSkillsPage
        .GoalsInfo()
        .contains(
          'The prisoner education team set these goals using Virtual Campus. They do not include sentence plan targets. Contact the local education team to find out more.',
        )

      workAndSkillsPage.GoalsEmploymentLabel().should('exist')
      workAndSkillsPage.GoalsEmploymentLabel().contains('Employment goals')

      workAndSkillsPage.GoalsEmploymentText().should('exist')
      workAndSkillsPage.GoalsEmploymentText().contains('string')

      workAndSkillsPage.GoalsPersonalLabel().should('exist')
      workAndSkillsPage.GoalsPersonalLabel().contains('Personal goals')

      workAndSkillsPage.GoalsPersonalText().should('exist')
      workAndSkillsPage.GoalsPersonalText().contains('string')

      workAndSkillsPage.GoalsShortTermLabel().should('exist')
      workAndSkillsPage.GoalsShortTermLabel().contains('Short-term goals')

      workAndSkillsPage.GoalsShortTermText().should('exist')
      workAndSkillsPage.GoalsShortTermText().contains('string')

      workAndSkillsPage.GoalsLongTermLabel().should('exist')
      workAndSkillsPage.GoalsLongTermLabel().contains('Long-term goals')

      workAndSkillsPage.GoalsLongTermText().should('exist')
      workAndSkillsPage.GoalsLongTermText().contains('string')
    })
  })

  context('Functional skills level card', () => {
    it('The card is displayed', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.FSL_card().should('exist')
    })
    it('The card details should display', () => {
      const workAndSkillsPage = visitWorkAndSkillsPage()
      workAndSkillsPage.FSL_header().should('exist')
      workAndSkillsPage.FSL_header().contains('Functional skills level')

      workAndSkillsPage.FSL_listKey().should('exist')
      workAndSkillsPage.FSL_listKey().contains('English')

      workAndSkillsPage.FSL_listValue().should('exist')
      workAndSkillsPage.FSL_listValue().contains('string')

      workAndSkillsPage.FSL_listKey2().should('exist')
      workAndSkillsPage.FSL_listKey2().contains('Assessment date')

      workAndSkillsPage.FSL_listValue2().should('exist')
      workAndSkillsPage.FSL_listValue2().contains('1 March 2023')

      workAndSkillsPage.FSL_listKey3().should('exist')
      workAndSkillsPage.FSL_listKey3().contains('Assessment location')

      workAndSkillsPage.FSL_listValue3().should('exist')
      workAndSkillsPage.FSL_listValue3().contains('string')

      workAndSkillsPage.FSL_listKey4().should('exist')
      workAndSkillsPage.FSL_listKey4().contains('Maths')

      workAndSkillsPage.FSL_listValue4().should('exist')
      workAndSkillsPage.FSL_listValue4().contains('string')

      workAndSkillsPage.FSL_listKey5().should('exist')
      workAndSkillsPage.FSL_listKey5().contains('Assessment date')

      workAndSkillsPage.FSL_listValue5().should('exist')
      workAndSkillsPage.FSL_listValue5().contains('1 March 2023')

      workAndSkillsPage.FSL_listKey6().should('exist')
      workAndSkillsPage.FSL_listKey6().contains('Assessment location')

      workAndSkillsPage.FSL_listValue6().should('exist')
      workAndSkillsPage.FSL_listValue6().contains('string')
    })
  })
})
