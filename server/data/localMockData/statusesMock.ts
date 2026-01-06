import type { OverviewStatus } from '../../controllers/interfaces/OverviewPageData'

export const pregnantStatusMock: OverviewStatus = {
  label: 'Pregnant',
  date: '20/01/2023',
}

export const recognisedListenerStatusMock: OverviewStatus = {
  label: 'Recognised Listener',
}

export const suitableListenerStatusMock: OverviewStatus = {
  label: 'Suitable Listener',
}

export const statusesMock = [pregnantStatusMock, recognisedListenerStatusMock, suitableListenerStatusMock]
