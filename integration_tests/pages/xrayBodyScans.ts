import { apostrophe } from '../../server/utils/utils'
import Page, { PageElement } from './page'

export default class XrayBodyScans extends Page {
  constructor(prisonerName: string) {
    super(`${apostrophe(prisonerName)} X-ray body scans`)
  }

  bodyScans = (): PageElement => cy.getDataQa('body-scans-table')
}
