import { stubFor } from './wiremock'

export function stubGetWithBody<T>({ path, body }: { path: string; body: T }) {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: path,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: body,
    },
  })
}

export function stubPutWithResponse<TResponse>({ path, responseBody }: { path: string; responseBody: TResponse }) {
  return stubFor({
    request: {
      method: 'PUT',
      urlPattern: path,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: responseBody,
    },
  })
}

export function stubPostWithResponse<TResponse>({ path, responseBody }: { path: string; responseBody: TResponse }) {
  return stubFor({
    request: {
      method: 'POST',
      urlPattern: path,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: responseBody,
    },
  })
}

export function stubPatchWithResponse<TResponse>({ path, responseBody }: { path: string; responseBody: TResponse }) {
  return stubFor({
    request: {
      method: 'PATCH',
      urlPattern: path,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: responseBody,
    },
  })
}

export function stubDeleteWithResponse<TResponse>({ path, responseBody }: { path: string; responseBody: TResponse }) {
  return stubFor({
    request: {
      method: 'DELETE',
      urlPattern: path,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: responseBody,
    },
  })
}
