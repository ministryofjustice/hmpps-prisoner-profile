import NotFoundError from './notFoundError'
import ServerError from './serverError'
import { errorHasStatus, getErrorStatus } from './errorHelpers'

describe('Error helpers', () => {
  const errorWithStatus = {
    status: 404,
  }

  const errorWithResponseStatus = {
    responseStatus: 500,
  }

  const errorWithNeither = {}

  describe('getErrorStatus', () => {
    it.each([
      ['Error with status', errorWithStatus, 404],
      ['Error with responseStatus', errorWithResponseStatus, 500],
      ['NotFoundError', new NotFoundError(), 404],
      ['ServerError', new ServerError(), 500],
      ['Error with neither', errorWithNeither, undefined],
      ['Generic Error', new Error('problem'), undefined],
      ['undefined', undefined, undefined],
      ['null', null, undefined],
    ])('Gets the correct error code: %s', (_, err, expected) => {
      expect(getErrorStatus(err)).toEqual(expected)
    })
  })

  describe('errorHasStatus', () => {
    it.each([
      ['Error with status: true', errorWithStatus, 404, true],
      ['Error with status: false', errorWithStatus, 500, false],
      ['Error with responseStatus: true', errorWithResponseStatus, 500, true],
      ['Error with responseStatus: false', errorWithResponseStatus, 404, false],
      ['NotFoundError has status 404', new NotFoundError(), 404, true],
      ['ServerError does not have status 404', new ServerError(), 404, false],
      ['Error with neither', errorWithNeither, 400, false],
      ['Generic Error', new Error('problem'), 400, false],
      ['undefined', undefined, 400, false],
      ['null', null, 400, false],
    ])('Gets the correct error code: %s', (_, err, status, expected) => {
      expect(errorHasStatus(err, status)).toEqual(expected)
    })
  })
})
