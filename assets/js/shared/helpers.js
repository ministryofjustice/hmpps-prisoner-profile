export function nodeListForEach(nodes, callback) {
  if (window.NodeList.prototype.forEach) {
    return nodes.forEach(callback)
  }
  for (let i = 0; i < nodes.length; i++) {
    callback.call(window, nodes[i], i, nodes)
  }
}

export function getParentConditionalRadioInput(element) {
  return element?.closest('.govuk-radios__conditional')?.previousElementSibling?.querySelector('input')
}
