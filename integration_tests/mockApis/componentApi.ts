import type Service from '@ministryofjustice/hmpps-connect-dps-components/dist/types/Service'
import type Component from '@ministryofjustice/hmpps-connect-dps-components/dist/types/Component'
import { stubFor } from './wiremock'
import {
  componentsCaseLoadMock,
  componentsFooterMock,
  componentsHeaderMock,
  componentsServicesMock,
} from '../../server/data/localMockData/componentApi/componentsMock'
import CaseLoad from '../../server/data/interfaces/prisonApi/CaseLoad'

export default {
  stubComponentsData: (
    options: {
      header?: Component
      footer?: Component
      caseLoads?: CaseLoad[]
      services?: Service[]
    } = {},
  ) => {
    const {
      header = componentsHeaderMock,
      footer = componentsFooterMock,
      caseLoads = [componentsCaseLoadMock],
      services = componentsServicesMock,
    } = options

    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/component/.*',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          header,
          footer,
          meta: {
            caseLoads,
            activeCaseLoad: caseLoads.find(caseLoad => caseLoad.currentlyActive === true),
            services,
          },
        },
      },
    })
  },
}
