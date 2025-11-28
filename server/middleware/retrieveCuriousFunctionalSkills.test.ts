import { Request, Response } from 'express'
import { startOfDay } from 'date-fns'
import retrieveCuriousFunctionalSkills from './retrieveCuriousFunctionalSkills'
import CuriousService from '../services/curiousService'
import { FunctionalSkills } from '../services/interfaces/curiousService/CuriousFunctionalSkillsAssessments'

jest.mock('../services/curiousService')

describe('retrieveCuriousFunctionalSkills', () => {
  const curiousService = new CuriousService(null, null, null) as jest.Mocked<CuriousService>
  const requestHandler = retrieveCuriousFunctionalSkills(curiousService)

  const prisonerNumber = 'A1234GC'

  let req: Request
  const res = {
    locals: {} as Record<string, unknown>,
  } as unknown as Response
  const next = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    req = {
      params: { prisonerNumber },
    } as unknown as Request
  })

  it('should retrieve prisoner functional skills', async () => {
    // Given

    const expectedFunctionalSkills: FunctionalSkills = {
      assessments: [
        {
          prisonId: 'MDI',
          type: 'MATHS',
          assessmentDate: startOfDay('2025-10-01'),
          level: 'Level 2',
          levelBanding: '2.1',
          nextStep: 'Progress to course at level consistent with assessment result',
          referral: ['Education Specialist'],
          source: 'CURIOUS2',
        },
      ],
    }
    curiousService.getPrisonerFunctionalSkills.mockResolvedValue(expectedFunctionalSkills)

    // When
    await requestHandler(req, res, next)

    // Then
    expect(res.locals.prisonerFunctionalSkills.isFulfilled()).toEqual(true)
    expect(res.locals.prisonerFunctionalSkills.value).toEqual(expectedFunctionalSkills)
    expect(curiousService.getPrisonerFunctionalSkills).toHaveBeenCalledWith(prisonerNumber)
    expect(next).toHaveBeenCalled()
  })
})
