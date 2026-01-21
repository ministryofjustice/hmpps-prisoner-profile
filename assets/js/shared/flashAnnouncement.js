export function announceFlash() {
  // Short initial delay, as we need to get the flash content before it's cleared
  setTimeout(function () {
    const content = document.getElementById('flash-content')

    if (content) {
      const message = content.innerText
      // Long delay, as the govuk skip link clears the voiceover buffer, so we need to load in after that
      setTimeout(function () {
        document.getElementById('flash-announcement').innerHTML = `<p>${message}</p>`
      }, 4000)
    }
  }, 1000)
}
