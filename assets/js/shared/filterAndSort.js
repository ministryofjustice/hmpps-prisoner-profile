function filterAndSort(options) {
  const scoreBySubstringIndex = (query, option) => {
    const index = option.toLowerCase().indexOf(query.toLowerCase())
    return index === -1 ? Infinity : index
  }

  return (query, populateResults) => {
    const lowerCasedQuery = query.trim().toLowerCase()

    if (!lowerCasedQuery) {
      populateResults(options)
      return
    }

    const filteredOptions = options.filter(option => option.toLowerCase().includes(lowerCasedQuery))

    const sortedOptions = filteredOptions.sort((left, right) => {
      return scoreBySubstringIndex(query, left) - scoreBySubstringIndex(query, right)
    })

    populateResults(sortedOptions)
  }
}

module.exports = { filterAndSort }
