export default (
  key: string,
  value: string,
  href: string,
  options: { changeLinkEnabled: boolean; rowUpdated: boolean; hiddenText?: string },
) => {
  const items = options.changeLinkEnabled
    ? [{ href, text: 'Change', visuallyHiddenText: options.hiddenText || key, classes: 'govuk-link--no-visited-state' }]
    : []
  const classes = options.rowUpdated ? 'row-updated' : ''

  return {
    key: { text: key },
    value: { text: value },
    actions: { items },
    classes,
  }
}
