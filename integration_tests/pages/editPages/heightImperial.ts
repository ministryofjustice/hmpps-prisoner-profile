import EditPage from './editPage'

export default class EditHeight extends EditPage {
  constructor(title: string) {
    super(title)
  }

  switchUnits = () => {
    cy.getDataQa('switch-units').click()
  }
}
