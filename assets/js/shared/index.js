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
})

govukFrontend.initAll()
mojFrontend.initAll()
connectDps.initAll()
