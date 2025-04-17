import OverviewPageData from '../../controllers/interfaces/OverviewPageData'

type Status = OverviewPageData['statuses'][number]
export const pregnantStatusMock: Status = {
  label: 'Pregnant',
  date: '20/01/2023',
}

export const recognisedListenerStatusMock: Status = {
  label: 'Recognised Listener',
}

export const suitableListenerStatusMock: Status = {
  label: 'Suitable Listener',
}

export const neurodiversityStatusMock: Status = {
  label: 'Support needed',
  subText: 'Has neurodiversity needs',
}

export const statusesMock: Status[] = [
  pregnantStatusMock,
  recognisedListenerStatusMock,
  suitableListenerStatusMock,
  neurodiversityStatusMock,
]
