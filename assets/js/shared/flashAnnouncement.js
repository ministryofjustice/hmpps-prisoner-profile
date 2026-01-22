export function announceFlash() {
  setTimeout(function () {
    const content = document.getElementById('flash-content')
    if (content) {
      const message = content.innerText
      document.getElementById('flash-announcement').innerHTML = `<p>${message}</p>`
    }
  }, 500)
}
