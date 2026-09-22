const RESULT_SELECTOR = '.hmpps-profile-banner-search__result'

function renderSuggestionText(link: HTMLAnchorElement, suggestion: string, query: string) {
  const textContainer = link.querySelector<HTMLElement>('.hmpps-profile-banner-search__result-text')

  if (!textContainer) {
    return
  }

  textContainer.textContent = ''

  const matchIndex = suggestion.toLowerCase().indexOf(query.toLowerCase())

  if (!query || matchIndex === -1) {
    textContainer.append(document.createTextNode(suggestion))
    return
  }

  // GOV.UK emboldens the parts of the suggestion the user has not typed
  const before = suggestion.slice(0, matchIndex)
  const match = suggestion.slice(matchIndex, matchIndex + query.length)
  const after = suggestion.slice(matchIndex + query.length)

  if (before) {
    const beforeElement = document.createElement('strong')
    beforeElement.textContent = before
    textContainer.append(beforeElement)
  }

  textContainer.append(document.createTextNode(match))

  if (after) {
    const afterElement = document.createElement('strong')
    afterElement.textContent = after
    textContainer.append(afterElement)
  }
}

export function profileBannerSearch() {
  document.querySelectorAll<HTMLElement>('[data-profile-banner-search]').forEach(search => {
    const input = search.querySelector<HTMLInputElement>('.hmpps-profile-banner-search__input')
    const clearButton = search.querySelector<HTMLButtonElement>('.hmpps-profile-banner-search__clear')
    const submitButton = search.querySelector<HTMLButtonElement>('.hmpps-profile-banner-search__submit')
    const resultsList = search.querySelector<HTMLUListElement>('.hmpps-profile-banner-search__results')
    const resultItems = Array.from(search.querySelectorAll<HTMLElement>(RESULT_SELECTOR))

    if (!input || !resultsList || !resultItems.length) {
      return
    }

    const suggestions = resultItems.map(item => ({
      item,
      link: item.querySelector<HTMLAnchorElement>('a'),
      text: (item.dataset.searchText || item.textContent || '').trim(),
    }))

    const visibleLinks = () =>
      suggestions.filter(suggestion => !suggestion.item.hidden && suggestion.link).map(suggestion => suggestion.link)

    const closeResults = () => {
      resultsList.hidden = true
      input.setAttribute('aria-expanded', 'false')
    }

    const filterResults = () => {
      const query = input.value.trim()
      let visibleCount = 0

      suggestions.forEach(({ item, link, text }) => {
        const matches = Boolean(query) && text.toLowerCase().includes(query.toLowerCase())

        item.hidden = !matches

        if (matches) {
          visibleCount += 1
          if (link) {
            renderSuggestionText(link, text, query)
          }
        }
      })

      const showResults = Boolean(query) && visibleCount > 0
      resultsList.hidden = !showResults
      input.setAttribute('aria-expanded', String(showResults))

      if (clearButton) {
        clearButton.hidden = !input.value.length
      }
    }

    const navigateToBestMatch = () => {
      const [firstMatch] = visibleLinks()

      if (firstMatch?.href) {
        window.location.assign(firstMatch.href)
        return
      }

      const query = input.value.trim()
      if (query) {
        window.location.assign(`https://www.gov.uk/search/all?keywords=${encodeURIComponent(query)}`)
      }
    }

    input.addEventListener('input', filterResults)
    input.addEventListener('focus', filterResults)

    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault()
        navigateToBestMatch()
      }

      if (event.key === 'Escape') {
        closeResults()
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        visibleLinks()[0]?.focus()
      }
    })

    clearButton?.addEventListener('click', () => {
      input.value = ''
      filterResults()
      input.focus()
    })

    submitButton?.addEventListener('click', event => {
      event.preventDefault()
      navigateToBestMatch()
    })

    document.addEventListener('click', event => {
      if (!search.contains(event.target as Node)) {
        closeResults()
      }
    })

    filterResults()
  })
}
