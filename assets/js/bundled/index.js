import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'

import { addressLookup } from './addressLookup'
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
import { profilePhotoCropper } from './profilePhotoCropper'

document.addEventListener('DOMContentLoaded', function () {
  addressLookup()
  addAnotherButton()
  alertDynamicDropdowns()
  alertFlags()
  autocomplete()
  backToTop()
  datepicker()
  fileUploadWithPreview()
  openCloseAll()
  printPage()
  profilePhotoCropper()
  sortSelector()
})

govukFrontend.initAll()
mojFrontend.initAll()
