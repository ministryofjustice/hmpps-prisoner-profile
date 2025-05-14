import { NextFunction } from 'express'
import { prisonUserMock } from '../data/localMockData/user'
import { UserService } from '../services'
import { userServiceMock } from '../../tests/mocks/userServiceMock'
import checkIfKeyWorkerAtPrison from './checkIfKeyWorkerAtPrison'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'

let req: any
let res: any
let next: NextFunction

describe('checkIfKeyWorkerAtPrison', () => {
  const userService = userServiceMock() as UserService

  beforeEach(() => {
    req = { middleware: { prisonerData: PrisonerMockDataA }, session: {} }
    res = { locals: { user: prisonUserMock } }
    next = jest.fn()
  })

  it('uses the existing cache', async () => {
    req.session.keyWorkerAtPrisons = { MDI: true }

    await checkIfKeyWorkerAtPrison(userService)(req, res, next)

    expect(userService.isUserAKeyWorker).not.toHaveBeenCalled()
    expect(res.locals.user.keyWorkerAtPrisons).toEqual({ MDI: true })
  })

  it('checks if user is a key worker if no existing cache', async () => {
    userService.isUserAKeyWorker = jest.fn(() => Promise.resolve(true))

    await checkIfKeyWorkerAtPrison(userService)(req, res, next)

    expect(req.session.keyWorkerAtPrisons).toEqual({ MDI: true })
    expect(res.locals.user.keyWorkerAtPrisons).toEqual({ MDI: true })
  })

  it('checks if user is a key worker and adds to existing cache', async () => {
    userService.isUserAKeyWorker = jest.fn(() => Promise.resolve(true))

    req.session.keyWorkerAtPrisons = { LEI: false }

    await checkIfKeyWorkerAtPrison(userService)(req, res, next)

    expect(req.session.keyWorkerAtPrisons).toEqual({ LEI: false, MDI: true })
    expect(res.locals.user.keyWorkerAtPrisons).toEqual({ LEI: false, MDI: true })
  })
})
