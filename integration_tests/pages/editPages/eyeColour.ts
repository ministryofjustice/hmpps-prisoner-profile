import EditPage from './editPage'

export default class EditEyeColour extends EditPage {
  constructor(title: string) {
    super(title)
  }

  selectEyeRadio = (code: string) => {
    cy.get(`input[name=eyeColour][value=${code}]`).click()
  }

  selectLeftEyeRadio = (code: string) => {
    cy.get(`input[name=leftEyeColour][value=${code}]`).click()
  }

  selectRightEyeRadio = (code: string) => {
    cy.get(`input[name=rightEyeColour][value=${code}]`).click()
  }

  switchEntryType = () => {
    cy.getDataQa('switch-eye-entry').click()
  }
}
