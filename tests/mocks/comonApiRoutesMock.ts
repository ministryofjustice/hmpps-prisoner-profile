import CommonApiRoutes from '../../server/routes/common/api'

export const commonApiRoutesMock = () =>
  ({
    distinguishingMarkImage: jest.fn(),
    image: jest.fn(),
    prisonerImage: jest.fn(),
  }) as unknown as CommonApiRoutes

export default { commonApiRoutesMock }
