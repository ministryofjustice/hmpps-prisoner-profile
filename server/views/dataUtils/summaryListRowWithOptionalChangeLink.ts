interface Options {
  changeLinkEnabled?: boolean
  changeText?: string
  changeHref?: string
  rowUpdated?: boolean
  hiddenText?: string
  hideIfEmpty?: boolean
  visible?: boolean
  dataQa?: string
  html?: boolean
  mergeKeyDown?: boolean
  classes?: string[]
  anchor?: string
}

const defaultOptions: Options = {
  changeLinkEnabled: false,
  rowUpdated: false,
  hideIfEmpty: true,
  mergeKeyDown: false,
  classes: [],
}

export const listToSummaryListRows = (
  items: {
    key: string
    value: string
    options?: Options
  }[],
) => {
  return items.map(i => summaryListRowWithOptionalChangeLink(i.key, i.value, i.options))
}

const summaryListRowWithOptionalChangeLink = (
  key: string,
  value: string,
  opts: Options = {},
): {
  key: { html?: string; text?: string }
  value: { html?: string; text?: string }
  actions: { items: { href: string; text: string; visuallyHiddenText: string; classes: string }[] }
  classes: string
} => {
  const options = { ...defaultOptions, ...opts }
  const rowHidden = (options.hideIfEmpty && !value) || options.visible === false

  const valueResult = (): { text?: string; html?: string } => {
    const isNotEntered = typeof value === 'string' && value.includes('Not entered')

    if (options.dataQa) {
      return {
        html: `<span data-qa="${options.dataQa}" ${isNotEntered ? 'class="not-entered-tag"' : ''}>${value}</span>`,
      }
    }

    return options.html ? { html: value } : { text: value }
  }

  const items = [
    ...(options.changeLinkEnabled
      ? [
          {
            href: options.changeHref,
            text: options.changeText || 'Change',
            visuallyHiddenText: options.hiddenText || key,
            classes: 'govuk-link--no-visited-state',
          },
        ]
      : []),
  ]

  const classes = [
    options.rowUpdated ? 'row-updated' : '',
    rowHidden ? 'govuk-summary-list__row--hidden' : '',
    options.mergeKeyDown ? 'hmpps-merged-key-summary-list-row' : '',
    ...options.classes,
  ].join(' ')

  const anchorSpan = options.anchor ? `<span class="anchor-center" id="${options.anchor}"></span>` : ''
  const keyResult = options.dataQa
    ? {
        html: `<div>${anchorSpan}<span data-qa="${rowHidden ? 'hidden-' : ''}${options.dataQa}-key">${key}</span></div>`,
      }
    : { text: key }

  return {
    key: keyResult,
    value: rowHidden ? { text: '' } : valueResult(),
    actions: { items },
    classes,
  }
}

export default summaryListRowWithOptionalChangeLink
