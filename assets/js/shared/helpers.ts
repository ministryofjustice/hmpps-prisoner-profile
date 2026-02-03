export function nodeListForEach<E extends Element>(
  nodes: NodeListOf<E>,
  callback: (this: Window, node: E, index: number, nodes: NodeListOf<E>) => void,
) {
  if (window.NodeList.prototype.forEach) {
    return nodes.forEach(callback)
  }
  for (let i = 0; i < nodes.length; i++) {
    callback.call(window, nodes[i], i, nodes)
  }
}

export function getParentConditionalRadioInput(element: Element): HTMLInputElement | undefined {
  return element?.closest('.govuk-radios__conditional')?.previousElementSibling?.querySelector('input')
}
