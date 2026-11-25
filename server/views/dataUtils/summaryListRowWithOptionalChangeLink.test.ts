import type { SummaryListRowItem } from '../../utils/utils'
import summaryListRowWithOptionalChangeLink, { listToSummaryListRows } from './summaryListRowWithOptionalChangeLink'

const textItem = (item: SummaryListRowItem): string | null => ('text' in item && item.text) ?? null
const htmlItem = (item: SummaryListRowItem): string | null => ('html' in item && item.html) ?? null

describe('summaryListRowWithOptionalChangeLink', () => {
  it('Creates a summary list row without a change link', () => {
    const res = summaryListRowWithOptionalChangeLink('key', 'value', { changeLinkEnabled: false })
    expect(textItem(res.key)).toEqual('key')
    expect(textItem(res.value)).toEqual('value')
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

    expect(htmlItem(res.key)).toContain('data-qa="used-for-tests-key"')
    expect(htmlItem(res.value)).toContain('data-qa="used-for-tests"')
  })

  it('Allows HTML to be given for the value', () => {
    const res = summaryListRowWithOptionalChangeLink('key', 'value', {
      html: true,
    })

    expect(htmlItem(res.value)).toEqual('value')
  })

  describe('With the merge key down option enabled', () => {
    it('Adds the correct CSS class', () => {
      const res = summaryListRowWithOptionalChangeLink('key', 'value', { mergeKeyDown: true })
      expect(res.classes.includes('hmpps-merged-key-summary-list-row')).toBe(true)
    })
  })

  describe('When row is not visible', () => {
    it('Displays no value', () => {
      const res = summaryListRowWithOptionalChangeLink('key', 'value', { visible: false })
      expect(textItem(res.value)).toEqual('')
    })

    it('Adds the data-qa to the key if provided', () => {
      const res = summaryListRowWithOptionalChangeLink('key', 'value', { dataQa: 'example', visible: false })
      expect(htmlItem(res.key)).toContain('data-qa="hidden-example-key"')
    })

    it('Adds the hidden class to the row', () => {
      const res = summaryListRowWithOptionalChangeLink('key', 'value', { visible: false })
      expect(res.classes).toContain('govuk-summary-list__row--hidden')
    })
  })

  describe('When hide if empty is enabled', () => {
    it('Adds the data-qa to the key if provided', () => {
      const res = summaryListRowWithOptionalChangeLink('key', '', { dataQa: 'example', hideIfEmpty: true })
      expect(htmlItem(res.key)).toContain('data-qa="hidden-example-key"')
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

    it('Supports custom visually hidden text with screenreader display options', () => {
      const testCases = [
        { activateHiddenText: true, expected: 'Change this' },
        { activateHiddenText: false, expected: '' },
      ]

      testCases.forEach(({ activateHiddenText, expected }) => {
        const res = summaryListRowWithOptionalChangeLink('key', 'value', {
          changeLinkEnabled: true,
          hiddenText: 'Change this',
          activateHiddenText,
        })
        expect(res.actions.items).toEqual(
          expect.arrayContaining([expect.objectContaining({ visuallyHiddenText: expected })]),
        )
      })
    })
  })

  describe('Creating a list of summary row items', () => {
    it.each([
      {
        scenario: 'Transforms all items into row items',
        input: [
          { key: 'key1', value: 'value1' },
          { key: 'key2', value: 'value2' },
          { key: 'key3', value: 'value3' },
        ],
      },
      {
        scenario: 'Skips falsey items',
        input: [
          { key: 'key1', value: 'value1' },
          undefined,
          { key: 'key2', value: 'value2' },
          null,
          { key: 'key3', value: 'value3' },
        ],
      },
    ])('$scenario', ({ input }) => {
      const res = listToSummaryListRows(input)

      expect(res.length).toEqual(3)
      expect(textItem(res[0].key)).toEqual('key1')
      expect(textItem(res[1].key)).toEqual('key2')
      expect(textItem(res[2].key)).toEqual('key3')
    })
  })
})
