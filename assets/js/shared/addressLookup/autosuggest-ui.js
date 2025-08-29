// Based on ONSDigital's https://github.com/ONSdigital/design-system/blob/main/src/components/autosuggest/autosuggest.ui.js
import { abortError, abortTimeout } from './abortable-fetch'

const jsBaseClass = 'hmpps-js-autosuggest'

const classSuffixInitialised = '--initialised'
const classSuffixOption = '__option'
const classSuffixOptionFocused = `${classSuffixOption}--focused`
const classSuffixOptionNoResults = `${classSuffixOption}--no-results`
const classSuffixHasResults = '--has-results'

export const NoResults = {
  type_more: 'TYPE_MORE',
  no_match: 'NO_MATCH',
  server_error: 'SERVER_ERROR',
}

export class AutosuggestUi {
  constructor({ context, onSelect, suggestionFunction }) {
    // DOM Elements
    this.context = context
    this.input = context.querySelector(`.${jsBaseClass}-input`)
    this.resultsContainer = context.querySelector(`.${jsBaseClass}-results`)
    this.resultsTitleContainer = this.resultsContainer.querySelector(`.${jsBaseClass}-results-title`)
    this.listbox = this.resultsContainer.querySelector(`.${jsBaseClass}-listbox`)
    this.instructions = context.querySelector(`.${jsBaseClass}-instructions`)
    this.errorContainer = context.querySelector(`.${jsBaseClass}-error`)
    this.errorTextContainer = this.errorContainer.querySelector('.moj-alert__content')
    this.ariaStatus = context.querySelector(`.${jsBaseClass}-aria-status`)

    // Settings
    this.minChars = 3
    this.ariaYouHaveSelected = context.getAttribute('data-aria-you-have-selected')
    this.ariaMinChars = context.getAttribute('data-aria-min-chars')
    this.ariaOneResult = context.getAttribute('data-aria-one-result')
    this.ariaNResults = context.getAttribute('data-aria-n-results')
    this.noResults = context.getAttribute('data-no-results')
    this.typeMore = context.getAttribute('data-type-more')
    this.listboxId = this.listbox.getAttribute('id')
    this.errorMessage = context.getAttribute('data-error-api')
    this.stylingBaseClass = context.getAttribute('data-styling-base-class')

    // Callbacks
    this.onSelect = onSelect
    this.fetchSuggestions = suggestionFunction

    // State
    this.query = ''
    this.sanitisedQuery = ''
    this.results = []
    this.resultOptions = []
    this.data = []
    this.numberOfResults = 0
    this.highlightedResultIndex = 0
    this.blurring = false
    this.blurTimeout = null
    this.scrolling = false
    this.scrollTimeout = null

    this.initialiseUI()
  }

  initialiseUI() {
    this.input.setAttribute('aria-autocomplete', 'list')
    this.input.setAttribute('aria-controls', this.listbox.getAttribute('id'))
    this.input.setAttribute('aria-describedby', this.instructions.getAttribute('id'))
    this.input.setAttribute('aria-haspopup', true)
    this.input.setAttribute('aria-owns', this.listbox.getAttribute('id'))
    this.input.setAttribute('aria-expanded', false)
    this.input.setAttribute('autocomplete', 'off')
    this.input.setAttribute('role', 'combobox')

    this.context.classList.add(`${this.stylingBaseClass}${classSuffixInitialised}`)

    this.bindEventListeners()
  }

  bindEventListeners() {
    this.input.addEventListener('keydown', this.handleKeydown.bind(this))
    this.input.addEventListener('keyup', this.handleKeyup.bind(this))
    this.input.addEventListener('input', this.handleChange.bind(this))
    this.input.addEventListener('blur', this.handleBlur.bind(this))
  }

  handleKeydown(event) {
    switch (event.keyCode) {
      case 38: {
        // Up
        event.preventDefault()
        this.navigateResults(-1)
        break
      }
      case 40: {
        // Down
        event.preventDefault()
        this.navigateResults(1)
        break
      }
      case 13: {
        // Enter
        if (this.highlightedResultIndex !== null) {
          event.preventDefault()
        }
        break
      }
    }
  }

  handleKeyup(event) {
    switch (event.keyCode) {
      // Up and down
      case 40:
      case 38: {
        event.preventDefault()
        break
      }
      case 13: {
        // Enter
        if (this.highlightedResultIndex !== null) {
          this.selectResult()
        }
        break
      }
    }
  }

  handleChange() {
    if (!this.blurring && this.input.value.trim()) {
      this.getSuggestions()
    } else {
      this.clearListbox()
    }
  }

  handleBlur() {
    clearTimeout(this.blurTimeout)
    this.blurring = true

    // Timeout required to allow user to click an option before clearing the listbox:
    this.blurTimeout = setTimeout(() => {
      this.blurring = false
      this.clearListbox()
    }, 300)
  }

  handleScroll(option, scrollUp) {
    clearTimeout(this.scrollTimeout)
    this.scrolling = true
    option.scrollIntoView(scrollUp)

    // Timeout required to allow user to click an option before clearing the listbox:
    this.scrollTimeout = setTimeout(() => {
      this.scrolling = false
    }, 300)
  }

  checkCharCount() {
    if (this.input.value.length > 1 && this.input.value.length < this.minChars) {
      this.inputTimeout = setTimeout(() => {
        this.handleNoResults(NoResults.type_more)
      }, 2000)
    } else {
      clearTimeout(this.inputTimeout)
    }
  }

  navigateResults(direction) {
    let index = 0
    if (this.highlightedResultIndex !== null) {
      index = this.highlightedResultIndex + direction
    }

    if (index < this.numberOfResults) {
      if (index < 0) {
        index = null
      }

      this.setHighlightedResult(index)
    }
  }

  sanitiseAutosuggestText(string) {
    let sanitisedString = string.toLowerCase()

    sanitisedString = sanitisedString.trim()
    sanitisedString = sanitisedString.replace(/,/g, '')
    sanitisedString = sanitisedString.replace(/\s\s+/g, ' ')
    sanitisedString = sanitisedString.replace(/[&]/g, '%26')
    sanitisedString = sanitisedString.replace(/\d(?=[a-z]{3,})/gi, '$& ')

    return sanitisedString
  }

  getSuggestions() {
    this.query = this.input.value

    const sanitisedQuery = this.sanitiseAutosuggestText(this.query)

    if (sanitisedQuery !== this.sanitisedQuery) {
      this.sanitisedQuery = sanitisedQuery
      this.unsetResults()
      this.checkCharCount()

      if (this.sanitisedQuery.length >= this.minChars) {
        this.fetchSuggestions(this.sanitisedQuery, this.data)
          .then(this.handleResults.bind(this))
          .catch(error => {
            if (error.name !== abortError && error.reason !== abortTimeout) {
              console.log('error:', error)
              this.handleNoResults(NoResults.server_error)
            }
          })
      } else {
        this.clearListbox()
      }
    }
  }

  unsetResults() {
    this.results = []
    this.resultOptions = []
  }

  clearListbox() {
    this.listbox.innerHTML = ''
    this.context.classList.remove(`${this.stylingBaseClass}${classSuffixHasResults}`)
    this.input.removeAttribute('aria-activedescendant')
    this.input.setAttribute('aria-expanded', false)
    this.setAriaStatus()
  }

  handleResults(result) {
    this.results = result.results
    this.numberOfResults = this.results?.length || 0
    this.setAriaStatus()
    this.listbox.innerHTML = ''

    this.resultOptions =
      this.results?.map((result, index) => {
        this.resultsTitleContainer?.classList?.remove('hmpps-display-none')
        const listElement = this.createListElement(result, index)
        this.listbox.appendChild(listElement)
        return listElement
      }) ?? []

    this.setHighlightedResult(0)
    this.input.setAttribute('aria-expanded', this.numberOfResults ? 'true' : 'false')

    if (!!this.numberOfResults && this.sanitisedQuery.length >= this.minChars) {
      this.context.classList.add(`${this.stylingBaseClass}${classSuffixHasResults}`)
    } else {
      this.context.classList.remove(`${this.stylingBaseClass}${classSuffixHasResults}`)
      this.clearListbox()
    }

    if (this.numberOfResults === 0 && this.noResults) {
      this.handleNoResults(NoResults.no_match)
    }
  }

  createListElement(result, index) {
    const innerHTML = this.emboldenMatch(result.displayText, this.query)
    const listElement = document.createElement('li')
    listElement.className = `${this.stylingBaseClass}${classSuffixOption}`
    listElement.setAttribute('id', `${this.listboxId}__option--${index}`)
    listElement.setAttribute('role', 'option')
    listElement.innerHTML = innerHTML
    listElement.addEventListener('click', () => {
      this.selectResult(index)
    })
    listElement.addEventListener('mouseenter', () => !this.scrolling && this.setHighlightedResult(index))
    return listElement
  }

  handleNoResults(reason) {
    if ([NoResults.type_more, NoResults.no_match].includes(reason)) {
      this.context.classList.add(`${this.stylingBaseClass}${classSuffixHasResults}`)
      this.resultsTitleContainer?.classList?.add('hmpps-display-none')
      this.input.setAttribute('aria-expanded', true)

      const message = reason === NoResults.type_more ? this.typeMore : this.noResults
      this.setAriaStatus(message)
      this.listbox.innerHTML = `<li class="${this.stylingBaseClass}${classSuffixOption} ${this.stylingBaseClass}${classSuffixOptionNoResults}">${message}</li>`
    } else {
      this.displayAPIError()
    }
  }

  displayAPIError() {
    this.input.value = ''
    this.input.setAttribute('disabled', true)
    this.clearListbox()
    this.errorContainer.classList.remove('hmpps-display-none')
    this.errorTextContainer.innerHTML = this.errorMessage
    this.ariaStatus.setAttribute('aria-hidden', 'true')
    this.setAriaStatus(this.errorMessage)
  }

  setHighlightedResult(index) {
    this.highlightedResultIndex = index

    if (this.highlightedResultIndex === null) {
      this.input.removeAttribute('aria-activedescendant')
    } else if (this.numberOfResults) {
      this.resultOptions.forEach((option, optionIndex) => {
        if (optionIndex === index) {
          if (this.isAboveViewport(option)) {
            this.handleScroll(option, true)
          }
          if (this.isBelowViewport(option)) {
            this.handleScroll(option, false)
          }
          option.classList.add(`${this.stylingBaseClass}${classSuffixOptionFocused}`)
          option.setAttribute('aria-selected', true)
          this.input.setAttribute('aria-activedescendant', option.getAttribute('id'))
          const optionText = option.innerHTML.replace('<strong>', '').replace('</strong>', '')
          this.setAriaStatus(optionText)
        } else {
          option.classList.remove(`${this.stylingBaseClass}${classSuffixOptionFocused}`)
          option.removeAttribute('aria-selected')
        }
      })
    }
  }

  selectResult(index) {
    if (!this.results.length) return

    const result = this.results[index || this.highlightedResultIndex || 0]
    this.onSelect(result)
    this.clearListbox()
    this.setAriaStatus(`${this.ariaYouHaveSelected}: ${result.displayText}.`)
  }

  setAriaStatus(content) {
    if (!content) {
      const queryTooShort = this.sanitisedQuery.length < this.minChars
      const noResults = this.numberOfResults === 0
      if (queryTooShort) {
        content = this.ariaMinChars
      } else if (noResults) {
        content = `${this.noResults}: "${this.query}"`
      } else if (this.numberOfResults === 1) {
        content = this.ariaOneResult
      } else {
        content = this.ariaNResults.replace('{n}', this.numberOfResults)
      }
    }
    this.ariaStatus.innerHTML = content
  }

  emboldenMatch(string, query) {
    let reg = new RegExp(this.escapeRegExp(query).split(' ').join('[\\s,]*'), 'gi')

    return string.replace(reg, '<strong>$&</strong>')
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  isAboveViewport(element) {
    return element.getBoundingClientRect().top < 0
  }

  isBelowViewport(element) {
    return element.getBoundingClientRect().bottom > (window.innerHeight || document.documentElement.clientHeight)
  }
}
