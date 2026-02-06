import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import * as connectDps from '@ministryofjustice/hmpps-connect-dps-shared-items/dist/assets/js/all'

import { addAnotherButton } from './addAnotherButton'
import { alertDynamicDropdowns } from './alertDynamicDropdowns'
import { alertFlags } from './alertFlags'
import { autocomplete } from './autocomplete'
import { BackToTop } from './backToTop'
import { datepicker } from './datepicker'
import { BodyParts } from './bodyParts'
import { fileUploadWithPreview } from './fileUploadWithPreview'
import { OpenCloseAll } from './openCloseAll'
import { printPage } from './printPage'
import { sortSelector } from './sortSelector'

govukFrontend.initAll()
mojFrontend.initAll()
connectDps.initAll()

document.addEventListener('DOMContentLoaded', function () {
  addAnotherButton()
  alertDynamicDropdowns()
  alertFlags()
  autocomplete()
  datepicker()
  fileUploadWithPreview()
  printPage()
  sortSelector()
  govukFrontend.createAll(BackToTop)
  govukFrontend.createAll(BodyParts)
  govukFrontend.createAll(OpenCloseAll)
})
