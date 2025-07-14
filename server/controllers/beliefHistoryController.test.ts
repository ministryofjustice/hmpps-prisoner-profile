//
// describe('Prisoner belief history', () => {
//   const prisonerNumber = 'G6123VU'
//
//   let req: any
//   let res: any
//   let controller: BeliefHistoryController
//
//   beforeEach(() => {
//     req = {
//       middleware: {
//         clientToken: 'CLIENT_TOKEN',
//         prisonerData: PrisonerMockDataA,
//         inmateDetail: inmateDetailMock,
//       },
//       originalUrl: 'http://localhost',
//       params: { prisonerNumber },
//       query: {},
//       protocol: 'http',
//       get: jest.fn().mockReturnValue('localhost'),
//     }
//     res = {
//       locals: {
//         user: {
//           activeCaseLoadId: 'MDI',
//           userRoles: [Role.PrisonUser],
//           caseLoads: CaseLoadsDummyDataA,
//           token: 'TOKEN',
//         },
//       },
//       render: jest.fn(),
//       status: jest.fn(),
//     }
//     controller = new BeliefHistoryController(new BeliefService(null), auditServiceMock())
//   })
//
//   afterEach(() => {
//     const spy = jest.spyOn(Date, 'now')
//     spy.mockRestore()
//   })
//
//   describe('displayBeliefHistory', () => {
//     it('should call the service and render the page', async () => {
//       jest.spyOn<any, string>(controller['beliefService'], 'getBeliefHistory').mockResolvedValue(beliefHistoryMock)
//
//       await controller.displayBeliefHistory(req, res)
//       expect(res.render).toHaveBeenCalledWith('pages/beliefHistory', {
//         pageTitle: 'Religion, faith or belief history',
//         pageHeading: `John Saunders’ religion, faith or belief history`,
//         beliefs: beliefHistoryMock,
//         prisonerNumber,
//         breadcrumbPrisonerName: 'Saunders, John',
//       })
//     })
//
//     it('should use religion field date override values to render the belief descriptions', async () => {
//       jest
//         .spyOn<any, string>(controller['beliefService'], 'getBeliefHistory')
//         .mockResolvedValue(beliefHistoryOverrideMock)
//
//       await controller.displayBeliefHistory(req, res)
//       expect(res.render).toHaveBeenCalledWith('pages/beliefHistory', {
//         pageTitle: 'Religion, faith or belief history',
//         pageHeading: `John Saunders’ religion, faith or belief history`,
//         beliefs: [
//           { ...beliefHistoryOverrideMock[0], beliefDescription: 'Other religion, faith or belief' },
//           beliefHistoryOverrideMock[1],
//         ],
//         prisonerNumber,
//         breadcrumbPrisonerName: 'Saunders, John',
//       })
//     })
//   })
// })

it('foo', () => {})
