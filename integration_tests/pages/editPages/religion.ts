import EditPage from './editPage'

export default class EditReligion extends EditPage {
  constructor(title: string) {
    super(title)
  }

  currentReligionDisplay = () => cy.get('#current-religion-display')

  religionValueInput = () => cy.getDataQa('religion-value-input')

  changeReasonInput = () => cy.getDataQa('change-reason-input')

  updateWarning = () => cy.getDataQa('religion-update-warning')
}
