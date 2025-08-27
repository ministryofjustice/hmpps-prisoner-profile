// Based on ONSDigital's https://github.com/ONSdigital/design-system/blob/main/src/js/abortable-fetch.js

export const FetchStatus = {
  unsent: 'UNSENT',
  loading: 'LOADING',
  done: 'DONE',
}

export const abortError = 'AbortError'
export const abortTimeout = 'AbortTimeout'

class AbortableFetch {
  constructor(url) {
    this.url = url
    this.controller = new window.AbortController()
    this.status = FetchStatus.unsent
  }

  async send() {
    this.status = FetchStatus.loading
    try {
      setTimeout(() => {
        this.controller.abort(abortTimeout)
      }, 5000)
      const response = await window.fetch(this.url, { signal: this.controller.signal })

      if (!(+response.status === 200)) {
        const error = new Error(`API error: ${response?.status ?? 500}`)
        error.response = response
        throw error
      }
      return response
    } finally {
      this.status = FetchStatus.done
    }
  }

  abort() {
    this.controller.abort()
  }
}

export const abortableFetch = (url, options) => new AbortableFetch(url, options)
