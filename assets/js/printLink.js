function PrintLinkComponent($module, config) {
  if (!$module) {
    return this
  }
  const collection = document.getElementsByClassName('printLink')
  for (let i = 0; i < collection.length; i++) {
    clickHandler(collection[i])
  }
  function clickHandler(element, index) {
    element.addEventListener('click', function () {
      window.print()
    })
  }
}

const $printLinkComponents = document.querySelector('.printLink')
new PrintLinkComponent($printLinkComponents, {})
