import EditPage from './editPage'

export default class EditWeight extends EditPage {
  constructor(title: string) {
    super(title)
  }

  switchUnits = () => {
    cy.getDataQa('switch-units').click()
  }
}
