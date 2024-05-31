import Page from '../pages/page'
import NotFoundPage from '../pages/notFoundPage'
import { accountBalancesMock } from '../../server/data/localMockData/miniSummaryMock'
import MoneyPage from '../pages/moneyPage'
import { componentsNoServicesMock } from '../../server/data/localMockData/componentApi/componentsMetaMock'

const visitSpendsPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/money/spends' })
}

const visitPrivateCashPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/money/private-cash' })
}

const visitSavingsPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/money/savings' })
}

const visitDamageObligationsPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/money/damage-obligations' })
}

context('Money Pages - Permissions', () => {
  beforeEach(() => {
    cy.task('stubComponentsMeta', componentsNoServicesMock)
  })

  context('Spends', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        caseLoads: [{ caseloadFunction: '', caseLoadId: 'ZZZ', currentlyActive: true, description: '', type: '' }],
      })
      cy.setupMoneyStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484, prisonId: 'MDI' })
    })

    it('Displays Page Not Found', () => {
      visitSpendsPage({ failOnStatusCode: false })
      new NotFoundPage().shouldBeDisplayed()
    })
  })

  context('Private Cash', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        caseLoads: [{ caseloadFunction: '', caseLoadId: 'ZZZ', currentlyActive: true, description: '', type: '' }],
      })
      cy.setupMoneyStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484, prisonId: 'MDI' })
    })

    it('Displays Page Not Found', () => {
      visitPrivateCashPage({ failOnStatusCode: false })
      new NotFoundPage().shouldBeDisplayed()
    })
  })

  context('Savings', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        caseLoads: [{ caseloadFunction: '', caseLoadId: 'ZZZ', currentlyActive: true, description: '', type: '' }],
      })
      cy.setupMoneyStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484, prisonId: 'MDI' })
    })

    it('Displays Page Not Found', () => {
      visitSavingsPage({ failOnStatusCode: false })
      new NotFoundPage().shouldBeDisplayed()
    })
  })

  context('Damage Obligations', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        caseLoads: [{ caseloadFunction: '', caseLoadId: 'ZZZ', currentlyActive: true, description: '', type: '' }],
      })
      cy.setupMoneyStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484, prisonId: 'MDI' })
    })

    it('Displays Page Not Found', () => {
      visitDamageObligationsPage({ failOnStatusCode: false })
      new NotFoundPage().shouldBeDisplayed()
    })
  })
})

context('Money Pages', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
  })

  context('Spends', () => {
    let spendsPage: MoneyPage

    beforeEach(() => {
      cy.setupMoneyStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484, prisonId: 'MDI' })
      visitSpendsPage()
    })

    it('Displays Spends Page', () => {
      spendsPage = Page.verifyOnPageWithTitle(MoneyPage, 'John Saunders’ money')
    })

    it('Displays the Spends tab selected', () => {
      spendsPage.selectedTab().contains('Spends')
    })

    it('Displays the Spends header', () => {
      spendsPage.h2().contains('Spends account')
    })

    it('Displays the correct current balance', () => {
      spendsPage.currentBalance().contains(`£${accountBalancesMock.spends}`)
    })

    it('Displays the filter', () => {
      spendsPage.moneyTabFilter().should('be.visible')
    })

    it('Displays the transactions', () => {
      spendsPage.transactionsTable().should('be.visible')
      spendsPage.transactionsTable().find('tbody tr:nth-child(1)').should('include.text', '16/09/2023')
      spendsPage.transactionsTable().find('tbody tr:nth-child(1)').should('include.text', '£16.80')
      spendsPage.transactionsTable().find('tbody tr:nth-child(1)').should('include.text', '£37.80')
      spendsPage
        .transactionsTable()
        .find('tbody tr:nth-child(1)')
        .should('include.text', 'Piece work for Some payment from 15/09/2023')
      spendsPage.transactionsTable().find('tbody tr:nth-child(1)').should('include.text', 'Moorland (HMP & YOI)')

      spendsPage.transactionsTable().find('tbody tr:nth-child(2)').should('include.text', '11/09/2023')
      spendsPage.transactionsTable().find('tbody tr:nth-child(2)').should('include.text', '£1.00')
      spendsPage.transactionsTable().find('tbody tr:nth-child(2)').should('include.text', '£21.00')
      spendsPage.transactionsTable().find('tbody tr:nth-child(2)').should('include.text', 'A Payment 3 from 11/09/2023')
      spendsPage.transactionsTable().find('tbody tr:nth-child(2)').should('include.text', 'Moorland (HMP & YOI)')

      spendsPage.transactionsTable().find('tbody tr:nth-child(3)').should('include.text', '11/09/2023')
      spendsPage.transactionsTable().find('tbody tr:nth-child(3)').should('include.text', '£1.00')
      spendsPage.transactionsTable().find('tbody tr:nth-child(3)').should('include.text', '£20.00')
      spendsPage.transactionsTable().find('tbody tr:nth-child(3)').should('include.text', 'A Payment 2 from 11/09/2023')
      spendsPage.transactionsTable().find('tbody tr:nth-child(3)').should('include.text', 'Moorland (HMP & YOI)')

      spendsPage.transactionsTable().find('tbody tr:nth-child(4)').should('include.text', '11/09/2023')
      spendsPage.transactionsTable().find('tbody tr:nth-child(4)').should('include.text', '£1.00')
      spendsPage.transactionsTable().find('tbody tr:nth-child(4)').should('include.text', '£19.00')
      spendsPage.transactionsTable().find('tbody tr:nth-child(4)').should('include.text', 'A Payment 1 from 11/09/2023')
      spendsPage.transactionsTable().find('tbody tr:nth-child(4)').should('include.text', 'Moorland (HMP & YOI)')

      spendsPage.transactionsTable().find('tbody tr:nth-child(5)').should('include.text', '11/09/2023')
      spendsPage.transactionsTable().find('tbody tr:nth-child(5)').should('include.text', '£7.00')
      spendsPage.transactionsTable().find('tbody tr:nth-child(5)').should('include.text', '£18.00')
      spendsPage
        .transactionsTable()
        .find('tbody tr:nth-child(5)')
        .should('include.text', 'Bonus pay for A Payment 2 from 11/09/2023')
      spendsPage.transactionsTable().find('tbody tr:nth-child(5)').should('include.text', 'Moorland (HMP & YOI)')

      spendsPage.transactionsTable().find('tbody tr:nth-child(6)').should('include.text', '10/09/2023')
      spendsPage.transactionsTable().find('tbody tr:nth-child(6)').should('include.text', '£6.00')
      spendsPage.transactionsTable().find('tbody tr:nth-child(6)').should('include.text', '£11.00')
      spendsPage
        .transactionsTable()
        .find('tbody tr:nth-child(6)')
        .should('include.text', 'Another Payment from 10/09/2023')
      spendsPage.transactionsTable().find('tbody tr:nth-child(6)').should('include.text', 'Moorland (HMP & YOI)')

      spendsPage.transactionsTable().find('tbody tr:nth-child(7)').should('include.text', '09/09/2023')
      spendsPage.transactionsTable().find('tbody tr:nth-child(7)').should('include.text', '£5.00')
      spendsPage.transactionsTable().find('tbody tr:nth-child(7)').should('include.text', '£5.00')
      spendsPage.transactionsTable().find('tbody tr:nth-child(7)').should('include.text', 'A Payment from 09/09/2023')
      spendsPage.transactionsTable().find('tbody tr:nth-child(7)').should('include.text', 'Moorland (HMP & YOI)')
    })

    it('Displays back link', () => {
      spendsPage.backLink().contains("Return to prisoner's profile")
    })
  })

  context('Private Cash', () => {
    let privateCashPage: MoneyPage

    beforeEach(() => {
      cy.setupMoneyStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484, prisonId: 'MDI' })
      visitPrivateCashPage()
    })

    it('Displays Private Cash Page', () => {
      privateCashPage = Page.verifyOnPageWithTitle(MoneyPage, 'John Saunders’ money')
    })

    it('Displays the Private cash tab selected', () => {
      privateCashPage.selectedTab().contains('Private cash')
    })

    it('Displays the Private cash header', () => {
      privateCashPage.h2().contains('Private cash account')
    })

    it('Displays the correct current balance', () => {
      privateCashPage.currentBalance().contains(`£${accountBalancesMock.cash}`)
    })

    it('Displays the correct pending balance', () => {
      privateCashPage.pendingBalance().contains('£18.87')
    })

    it('Displays the filter', () => {
      privateCashPage.moneyTabFilter().should('be.visible')
    })

    it('Displays the pending transactions', () => {
      privateCashPage.pendingTransactionsTable().should('be.visible')
      privateCashPage.pendingTransactionsTable().find('tbody tr:nth-child(1)').should('include.text', '11/09/2022')
      privateCashPage.pendingTransactionsTable().find('tbody tr:nth-child(1)').should('include.text', '£9.99')
      privateCashPage
        .pendingTransactionsTable()
        .find('tbody tr:nth-child(1)')
        .should('include.text', 'A HOA pending transaction')
      privateCashPage
        .pendingTransactionsTable()
        .find('tbody tr:nth-child(1)')
        .should('include.text', 'Moorland (HMP & YOI)')

      privateCashPage.pendingTransactionsTable().find('tbody tr:nth-child(2)').should('include.text', '11/09/2022')
      privateCashPage.pendingTransactionsTable().find('tbody tr:nth-child(2)').should('include.text', '£8.88')
      privateCashPage
        .pendingTransactionsTable()
        .find('tbody tr:nth-child(2)')
        .should('include.text', 'A WHF pending transaction')
      privateCashPage
        .pendingTransactionsTable()
        .find('tbody tr:nth-child(2)')
        .should('include.text', 'Moorland (HMP & YOI)')
    })

    it('Displays the completed transactions', () => {
      privateCashPage.transactionsTable().should('be.visible')
      privateCashPage.transactionsTable().find('tbody tr:nth-child(1)').should('include.text', '11/09/2023')
      privateCashPage.transactionsTable().find('tbody tr:nth-child(1)').should('include.text', '£35.00')
      privateCashPage.transactionsTable().find('tbody tr:nth-child(1)').should('include.text', '£45.00')
      privateCashPage.transactionsTable().find('tbody tr:nth-child(1)').should('include.text', 'A transaction')
      privateCashPage.transactionsTable().find('tbody tr:nth-child(1)').should('include.text', 'Moorland (HMP & YOI)')

      privateCashPage.transactionsTable().find('tbody tr:nth-child(2)').should('include.text', '10/09/2023')
      privateCashPage.transactionsTable().find('tbody tr:nth-child(2)').should('include.text', '-£10.00')
      privateCashPage.transactionsTable().find('tbody tr:nth-child(2)').should('include.text', '£10.00')
      privateCashPage.transactionsTable().find('tbody tr:nth-child(2)').should('include.text', 'Another transaction')
      privateCashPage.transactionsTable().find('tbody tr:nth-child(2)').should('include.text', 'Moorland (HMP & YOI)')

      privateCashPage.transactionsTable().find('tbody tr:nth-child(3)').should('include.text', '09/09/2023')
      privateCashPage.transactionsTable().find('tbody tr:nth-child(3)').should('include.text', '£20.00')
      privateCashPage.transactionsTable().find('tbody tr:nth-child(3)').should('include.text', '£20.00')
      privateCashPage.transactionsTable().find('tbody tr:nth-child(3)').should('include.text', 'A transaction')
      privateCashPage.transactionsTable().find('tbody tr:nth-child(3)').should('include.text', 'Moorland (HMP & YOI)')
    })

    it('Displays back link', () => {
      privateCashPage.backLink().contains("Return to prisoner's profile")
    })
  })

  context('Savings', () => {
    let savingsPage: MoneyPage

    beforeEach(() => {
      cy.setupMoneyStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484, prisonId: 'MDI' })
      visitSavingsPage()
    })

    it('Displays Savings Page', () => {
      savingsPage = Page.verifyOnPageWithTitle(MoneyPage, 'John Saunders’ money')
    })

    it('Displays the Savings tab selected', () => {
      savingsPage.selectedTab().contains('Savings')
    })

    it('Displays the Savings header', () => {
      savingsPage.h2().contains('Savings account')
    })

    it('Displays the correct current balance', () => {
      savingsPage.currentBalance().contains(`£${accountBalancesMock.savings}`)
    })

    it('Displays the filter', () => {
      savingsPage.moneyTabFilter().should('be.visible')
    })

    it('Displays the transactions', () => {
      savingsPage.transactionsTable().should('be.visible')
      savingsPage.transactionsTable().find('tbody tr:nth-child(1)').should('include.text', '11/09/2023')
      savingsPage.transactionsTable().find('tbody tr:nth-child(1)').should('include.text', '£35.00')
      savingsPage.transactionsTable().find('tbody tr:nth-child(1)').should('include.text', '£45.00')
      savingsPage.transactionsTable().find('tbody tr:nth-child(1)').should('include.text', 'A transaction')
      savingsPage.transactionsTable().find('tbody tr:nth-child(1)').should('include.text', 'Moorland (HMP & YOI)')

      savingsPage.transactionsTable().find('tbody tr:nth-child(2)').should('include.text', '10/09/2023')
      savingsPage.transactionsTable().find('tbody tr:nth-child(2)').should('include.text', '-£10.00')
      savingsPage.transactionsTable().find('tbody tr:nth-child(2)').should('include.text', '£10.00')
      savingsPage.transactionsTable().find('tbody tr:nth-child(2)').should('include.text', 'Another transaction')
      savingsPage.transactionsTable().find('tbody tr:nth-child(2)').should('include.text', 'Moorland (HMP & YOI)')

      savingsPage.transactionsTable().find('tbody tr:nth-child(3)').should('include.text', '09/09/2023')
      savingsPage.transactionsTable().find('tbody tr:nth-child(3)').should('include.text', '£20.00')
      savingsPage.transactionsTable().find('tbody tr:nth-child(3)').should('include.text', '£20.00')
      savingsPage.transactionsTable().find('tbody tr:nth-child(3)').should('include.text', 'A transaction')
      savingsPage.transactionsTable().find('tbody tr:nth-child(3)').should('include.text', 'Moorland (HMP & YOI)')
    })

    it('Displays back link', () => {
      savingsPage.backLink().contains("Return to prisoner's profile")
    })
  })

  context('Damage Obligations', () => {
    let damageObligationsPage: MoneyPage

    beforeEach(() => {
      cy.setupMoneyStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484, prisonId: 'MDI' })
      visitDamageObligationsPage()
    })

    it('Displays Damage Obligations Page', () => {
      damageObligationsPage = Page.verifyOnPageWithTitle(MoneyPage, 'John Saunders’ money')
    })

    it('Displays the Damage obligations tab selected', () => {
      damageObligationsPage.selectedTab().contains('Damage obligations')
    })

    it('Displays the Damage obligations header', () => {
      damageObligationsPage.h2().contains('Damage obligations')
    })

    it('Displays the correct currently owes', () => {
      damageObligationsPage.currentlyOwes().contains(`£${accountBalancesMock.damageObligations}`)
    })

    it('Does not display the filter', () => {
      damageObligationsPage.moneyTabFilter().should('not.exist')
    })

    it('Displays the transactions', () => {
      damageObligationsPage.damageObligationsTable().should('be.visible')
      damageObligationsPage.damageObligationsTable().find('tbody tr:nth-child(1)').should('include.text', '2')
      damageObligationsPage.damageObligationsTable().find('tbody tr:nth-child(1)').should('include.text', '98765456')
      damageObligationsPage
        .damageObligationsTable()
        .find('tbody tr:nth-child(1)')
        .should('include.text', '10/09/2023 to 10/09/2025')
      damageObligationsPage.damageObligationsTable().find('tbody tr:nth-child(1)').should('include.text', '£10.00')
      damageObligationsPage.damageObligationsTable().find('tbody tr:nth-child(1)').should('include.text', '£0.00')
      damageObligationsPage.damageObligationsTable().find('tbody tr:nth-child(1)').should('include.text', '£10.00')
      damageObligationsPage
        .damageObligationsTable()
        .find('tbody tr:nth-child(1)')
        .should('include.text', 'Moorland (HMP & YOI) - Comment')

      damageObligationsPage.damageObligationsTable().find('tbody tr:nth-child(2)').should('include.text', '1')
      damageObligationsPage.damageObligationsTable().find('tbody tr:nth-child(2)').should('include.text', '1234567')
      damageObligationsPage
        .damageObligationsTable()
        .find('tbody tr:nth-child(2)')
        .should('include.text', '09/09/2023 to 09/09/2025')
      damageObligationsPage.damageObligationsTable().find('tbody tr:nth-child(2)').should('include.text', '£50.00')
      damageObligationsPage.damageObligationsTable().find('tbody tr:nth-child(2)').should('include.text', '£25.00')
      damageObligationsPage.damageObligationsTable().find('tbody tr:nth-child(2)').should('include.text', '£25.00')
      damageObligationsPage
        .damageObligationsTable()
        .find('tbody tr:nth-child(2)')
        .should('include.text', 'Moorland (HMP & YOI) - Comment')
    })

    it('Displays back link', () => {
      damageObligationsPage.backLink().contains("Return to prisoner's profile")
    })
  })
})
