export function getParentConditionalRadioInput(element: Element): HTMLInputElement | undefined {
  return element?.closest('.govuk-radios__conditional')?.previousElementSibling?.querySelector('input')
}
