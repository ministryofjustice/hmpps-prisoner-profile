import Page, { PageElement } from './page'

export default class PastCareNeedsPage extends Page {
  pastCareNeedsList = (): PageElement => cy.get('[data-qa=past-care-needs-list]')

  careNeeds = () => {
    const careNeedItem = (row: number) => cy.getDataQa('past-care-needs-list').findDataQa('care-need-row').eq(row)
    const careNeedValue = (row: number) => careNeedItem(row).find('.govuk-summary-list__value')
    const reasonableAdjustmentItem = (row: number) =>
      cy.getDataQa('past-care-needs-list').findDataQa('reasonable-adjustment-row').eq(row)
    const reasonableAdjustmentValue = (row: number) => reasonableAdjustmentItem(row).find('.govuk-summary-list__value')

    return {
      personalCareNeeds: (row: number) => ({
        type: () => careNeedItem(row).findDataQa('care-need-key'),
        description: () => careNeedValue(row).findDataQa('description'),
        comment: () => careNeedValue(row).findDataQa('comment'),
        addedOn: () => careNeedValue(row).findDataQa('added-on'),
        reasonableAdjustments: (adjustmentRow: number) => {
          const adjustmentItem = careNeedItem(row).findDataQa('reasonable-adjustment').eq(adjustmentRow)
          return {
            description: () => adjustmentItem.findDataQa('adjustment-description'),
            comment: () => adjustmentItem.findDataQa('adjustment-comment'),
            addedBy: () => adjustmentItem.findDataQa('adjustment-added-by'),
            addedOn: () => adjustmentItem.findDataQa('adjustment-added-on'),
          }
        },
      }),
      reasonableAdjustments: (row: number) => ({
        type: () => reasonableAdjustmentItem(row).findDataQa('reasonable-adjustment-key'),
        description: () => reasonableAdjustmentValue(row).findDataQa('description'),
        comment: () => reasonableAdjustmentValue(row).findDataQa('comment'),
        addedOn: () => reasonableAdjustmentValue(row).findDataQa('added-on'),
      }),
    }
  }

  backLink = (): PageElement => cy.get('[data-qa=care-need-history-back-link]')
}
