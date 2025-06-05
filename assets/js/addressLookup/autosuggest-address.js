const classUPRN = 'hmpps-js-uprn'
const classInputContainer = 'hmpps-address-autosuggest'
const classInput = 'hmpps-js-autosuggest-input'

class AutosuggestAddress {
  constructor(context) {
    this.context = context
    this.input = context.querySelector(`.${classInput}`)
    this.container = context.querySelector(`.${classInputContainer}`)
    this.uprn = context.querySelector(`.${classUPRN}`)

    // Configuration:
    this.optimisationOff = this.container.getAttribute('data-optimisation-off') === 'true'

    // State:
    this.fetch = null

    // Initialise autosuggest:
    this.autosuggest = new AutosuggestUi({
      context: this.container,
      onSelect: this.onAddressSelect.bind(this),
      suggestionFunction: this.suggestAddresses.bind(this),
    })

    // Check API status:
    this.checkAPIStatus()
  }

  async checkAPIStatus() {
    this.fetch = abortableFetch('/api/addresses/find/SW1H9AJ')

    try {
      const response = await this.fetch.send()
      const status = response && (await response.json()).status
      if (status !== 200) {
        this.autosuggest.handleNoResults(NoResults.server_error)
      }
    } catch (error) {
      if (error.name !== abortError) {
        this.autosuggest.handleNoResults(NoResults.server_error)
      }
    }
  }

  async suggestAddresses(query) {
    if (this.fetch && this.fetch.status !== FetchStatus.done) {
      this.fetch.abort()
    }

    return await this.findAddress(query)
  }

  async findAddress(query) {
    this.fetch = abortableFetch(`/api/addresses/find/${query}${this.optimisationOff ? '?optimisationOff=true' : ''}`)
    const data = await this.fetch.send()
    const response = await data.json()
    const status = response.status
    const addresses = response.results
    return this.mapFindResults(addresses, status)
  }

  mapFindResults(results, status) {
    if (!results) return { status }

    return {
      results: this.addressMapping(results),
      status: status,
    }
  }

  addressMapping(addresses) {
    if (!addresses?.length) return []

    return addresses.map(address => ({ uprn: address.uprn, displayText: address.addressString }))
  }

  async onAddressSelect(selectedResult) {
    if (this.fetch && this.fetch.status !== FetchStatus.done) {
      this.fetch.abort()
    }

    this.autosuggest.input.value = selectedResult.displayText
    this.uprn.value = selectedResult.uprn
  }
}

// Setup all address autosuggest instances:
const addressAutosuggests = [...document.querySelectorAll('.hmpps-js-address-autosuggest')]

if (addressAutosuggests.length) {
  addressAutosuggests.forEach((addressAutosuggest) => new AutosuggestAddress(addressAutosuggest))
}
