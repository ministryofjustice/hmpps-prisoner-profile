import { AutosuggestAddress } from './autosuggest-address'

export function addressLookup() {
  // Setup all address autosuggest instances:
  const addressAutosuggests = [...document.querySelectorAll('.hmpps-js-address-autosuggest')]

  if (addressAutosuggests.length) {
    addressAutosuggests.forEach(addressAutosuggest => new AutosuggestAddress(addressAutosuggest))
  }
}
