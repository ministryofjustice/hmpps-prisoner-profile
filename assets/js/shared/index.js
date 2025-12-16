import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import * as connectDps from '@ministryofjustice/hmpps-connect-dps-shared-items/dist/assets/js/all'

import { addAnotherButton } from './addAnotherButton'
import { alertDynamicDropdowns } from './alertDynamicDropdowns'
import { alertFlags } from './alertFlags'
import { autocomplete } from './autocomplete'
import { backToTop } from './backToTop'
import { datepicker } from './datepicker'
import { fileUploadWithPreview } from './fileUploadWithPreview'
import { openCloseAll } from './openCloseAll'
import { printPage } from './printPage'
import { sortSelector } from './sortSelector'
import { Modal } from './modal'

document.addEventListener('DOMContentLoaded', function () {
  addAnotherButton()
  alertDynamicDropdowns()
  alertFlags()
  autocomplete()
  backToTop()
  datepicker()
  fileUploadWithPreview()
  openCloseAll()
  printPage()
  sortSelector()

  const helloModalEl = document.getElementById('hello-modal')
  const helloModalLink = document.getElementById('hello-modal-link')
  if (helloModalEl && helloModalLink) {
    const helloModal = new Modal(helloModalEl)
    helloModalLink.addEventListener('click', e => {
      e.preventDefault()
      helloModal.load('https://support-for-additional-needs-dev.hmpps.service.justice.gov.uk/profile/A6255EC/overview')
    })
  }
})

govukFrontend.initAll()
mojFrontend.initAll()
connectDps.initAll()
