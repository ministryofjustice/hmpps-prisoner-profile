import { apostrophe } from '../../server/utils/utils'
import Page, { PageElement } from './page'

export default class XrayBodyScans extends Page {
  constructor(prisonerName: string) {
    super(`${apostrophe(prisonerName)} X-ray body scans`)
  }

  bodyScans = (): PageElement => cy.get('table')

  bodyScan = row => ({
    date: () => cy.get('table').find('tr').eq(row).find('td').eq(0),
    comment: () => cy.get('table').find('tr').eq(row).find('td').eq(1),
  })
}
