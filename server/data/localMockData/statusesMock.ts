import { Status } from '../../interfaces/status'

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

export const statusesMock: Status[] = [pregnantStatusMock, recognisedListenerStatusMock, suitableListenerStatusMock]
