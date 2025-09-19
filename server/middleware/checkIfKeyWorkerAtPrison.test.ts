import { NextFunction, Request, Response } from 'express'
import { PrisonUser } from '../interfaces/HmppsUser'
import { prisonUserMock } from '../data/localMockData/user'
import { UserService } from '../services'
import { userServiceMock } from '../../tests/mocks/userServiceMock'
import checkIfKeyWorkerAtPrison from './checkIfKeyWorkerAtPrison'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'

let req: Request
let res: Response
let next: NextFunction

describe('checkIfKeyWorkerAtPrison', () => {
  const userService = userServiceMock() as UserService

  beforeEach(() => {
    req = { middleware: { prisonerData: PrisonerMockDataA }, session: {} } as Request
    res = { locals: { user: prisonUserMock } } as Response
    next = jest.fn()
  })

  it('uses the existing cache', async () => {
    req.session.keyWorkerAtPrisons = { MDI: true }

    await checkIfKeyWorkerAtPrison(userService)(req, res, next)

    expect(userService.isUserAKeyWorker).not.toHaveBeenCalled()
    const user = res.locals.user as PrisonUser
    expect(user.keyWorkerAtPrisons).toEqual({ MDI: true })
  })

  it('checks if user is a key worker if no existing cache', async () => {
    userService.isUserAKeyWorker = jest.fn(() => Promise.resolve(true))

    await checkIfKeyWorkerAtPrison(userService)(req, res, next)

    expect(req.session.keyWorkerAtPrisons).toEqual({ MDI: true })
    const user = res.locals.user as PrisonUser
    expect(user.keyWorkerAtPrisons).toEqual({ MDI: true })
  })

  it('checks if user is a key worker and adds to existing cache', async () => {
    userService.isUserAKeyWorker = jest.fn(() => Promise.resolve(true))

    req.session.keyWorkerAtPrisons = { LEI: false }

    await checkIfKeyWorkerAtPrison(userService)(req, res, next)

    expect(req.session.keyWorkerAtPrisons).toEqual({ LEI: false, MDI: true })
    const user = res.locals.user as PrisonUser
    expect(user.keyWorkerAtPrisons).toEqual({ LEI: false, MDI: true })
  })
})
