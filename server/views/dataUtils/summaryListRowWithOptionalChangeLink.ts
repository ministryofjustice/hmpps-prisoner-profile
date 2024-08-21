interface Options {
  changeLinkEnabled?: boolean
  changeHref?: string
  rowUpdated?: boolean
  hiddenText?: string
  hideIfEmpty?: boolean
  visible?: boolean
  dataQa?: string
  html?: boolean
  historyLinkEnabled?: boolean
  historyHref?: string
}

const defaultOptions: Options = {
  changeLinkEnabled: false,
  rowUpdated: false,
  hideIfEmpty: true,
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

const summaryListRowWithOptionalChangeLink = (key: string, value: string, opts: Options = {}) => {
  const options = { ...defaultOptions, ...opts }
  const rowHidden = (options.hideIfEmpty && !value) || options.visible === false

  const valueResult = (): { text?: string; html?: string } => {
    if (options.dataQa) {
      return { html: `<span data-qa="${options.dataQa}">${value}</span>` }
    }

    return options.html ? { html: value } : { text: value }
  }

  const items = [
    ...(options.historyLinkEnabled
      ? [
          {
            href: options.historyHref,
            text: 'History',
            visuallyHiddenText: options.hiddenText || key,
            classes: 'govuk-link--no-visited-state',
          },
        ]
      : []),
    ...(options.changeLinkEnabled
      ? [
          {
            href: options.changeHref,
            text: 'Change',
            visuallyHiddenText: options.hiddenText || key,
            classes: 'govuk-link--no-visited-state',
          },
        ]
      : []),
  ]

  const classes = [options.rowUpdated ? 'row-updated' : '', rowHidden ? 'govuk-summary-list__row--hidden' : ''].join(
    ' ',
  )

  const keyResult = options.dataQa
    ? { html: `<span data-qa="${rowHidden ? 'hidden-' : ''}${options.dataQa}-key">${key}</span>` }
    : { text: key }

  return {
    key: keyResult,
    value: rowHidden ? { text: '' } : valueResult(),
    actions: { items },
    classes,
  }
}

export default summaryListRowWithOptionalChangeLink
