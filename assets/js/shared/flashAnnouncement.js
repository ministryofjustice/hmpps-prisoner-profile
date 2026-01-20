export function announceFlash() {
  setTimeout(function () {
    const content = document.getElementById('flash-content')

    if (content) {
      document.getElementById('flash-announcement').innerHTML = `<p>${content.innerText}</p>`
    }
  }, 1000)
}
