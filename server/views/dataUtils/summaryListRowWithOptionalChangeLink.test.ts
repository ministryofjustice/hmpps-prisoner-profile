import summaryListRowWithOptionalChangeLink, { listToSummaryListRows } from './summaryListRowWithOptionalChangeLink'

describe('summaryListRowWithOptionalChangeLink', () => {
  it('Creates a summary list row without a change link', () => {
    const res = summaryListRowWithOptionalChangeLink('key', 'value', { changeLinkEnabled: false })
    expect(res.key.text).toEqual('key')
    expect(res.value.text).toEqual('value')
    expect(res.actions.items).toEqual([])
  })

  it('Adds the correct class if the row has been updated', () => {
    const res = summaryListRowWithOptionalChangeLink('key', 'value', { rowUpdated: true })
    expect(res.classes).toContain('row-updated')
  })

  it('Wraps the key/value in a span if a data-qa value is provided', () => {
    const res = summaryListRowWithOptionalChangeLink('key', 'value', {
      rowUpdated: true,
      dataQa: 'used-for-tests',
    })

    expect(res.key.html).toContain('data-qa="used-for-tests-key"')
    expect(res.value.html).toContain('data-qa="used-for-tests"')
  })

  it('Allows HTML to be given for the value', () => {
    const res = summaryListRowWithOptionalChangeLink('key', 'value', {
      html: true,
    })

    expect(res.value.html).toEqual('value')
  })

  describe('When row is not visible', () => {
    it('Displays no value', () => {
      const res = summaryListRowWithOptionalChangeLink('key', 'value', { visible: false })
      expect(res.value.text).toEqual('')
    })

    it('Adds the data-qa to the key if provided', () => {
      const res = summaryListRowWithOptionalChangeLink('key', 'value', { dataQa: 'example', visible: false })
      expect(res.key.html).toContain('data-qa="hidden-example-key"')
    })

    it('Adds the hidden class to the row', () => {
      const res = summaryListRowWithOptionalChangeLink('key', 'value', { visible: false })
      expect(res.classes).toContain('govuk-summary-list__row--hidden')
    })
  })

  describe('When hide if empty is enabled', () => {
    it('Adds the data-qa to the key if provided', () => {
      const res = summaryListRowWithOptionalChangeLink('key', '', { dataQa: 'example', hideIfEmpty: true })
      expect(res.key.html).toContain('data-qa="hidden-example-key"')
    })

    it('Adds the hidden class to the row', () => {
      const res = summaryListRowWithOptionalChangeLink('key', '', { hideIfEmpty: true })
      expect(res.classes).toContain('govuk-summary-list__row--hidden')
    })
  })

  describe('With change link enabled', () => {
    it('Creates a list row with change link', () => {
      const res = summaryListRowWithOptionalChangeLink('key', 'value', { changeLinkEnabled: true, changeHref: 'href' })
      expect(res.actions.items).toEqual(
        expect.arrayContaining([expect.objectContaining({ text: 'Change', href: 'href', visuallyHiddenText: 'key' })]),
      )
    })

    it('Supports custom visually hidden text', () => {
      const res = summaryListRowWithOptionalChangeLink('key', 'value', {
        changeLinkEnabled: true,
        hiddenText: 'Change this',
      })
      expect(res.actions.items).toEqual(
        expect.arrayContaining([expect.objectContaining({ visuallyHiddenText: 'Change this' })]),
      )
    })
  })

  describe('Creating a list of summary row items', () => {
    it('Transforms all items into row items', () => {
      const res = listToSummaryListRows([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: 'value3' },
      ])

      expect(res.length).toEqual(3)
      expect(res[0].key.text).toEqual('key1')
      expect(res[1].key.text).toEqual('key2')
      expect(res[2].key.text).toEqual('key3')
    })
  })
})
