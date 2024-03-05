import { ReasonableAdjustments } from '../interfaces/prisonApi/ReasonableAdjustment'

export const mockReasonableAdjustments: ReasonableAdjustments = {
  reasonableAdjustments: [
    {
      personalCareNeedId: 1,
      treatmentCode: 'BEH/BODY LAN',
      commentText: 'psych care type adjustment comment goes here',
      startDate: '1999-06-09',
      endDate: null,
      agencyId: 'MDI',
      agencyDescription: 'Moorland (HMP & YOI)',
      treatmentDescription: 'Behavioural responses/Body language',
    },
    {
      personalCareNeedId: 1,
      treatmentCode: 'CDA',
      commentText: null,
      startDate: '2020-06-09',
      endDate: null,
      agencyId: 'MDI',
      agencyDescription: 'Moorland (HMP & YOI)',
      treatmentDescription: 'Comfort and Dressing Aids',
    },
    {
      personalCareNeedId: 1,
      treatmentCode: 'AC',
      commentText: 'maternity care type adjustment comment goes here',
      startDate: '2020-06-09',
      endDate: null,
      agencyId: 'MDI',
      agencyDescription: 'Moorland (HMP & YOI)',
      treatmentDescription: 'Accessible Cell',
    },
    {
      personalCareNeedId: 1,
      treatmentCode: 'AUD/VISUAL',
      commentText: 'visual impairment disability adjustment comment goes here',
      startDate: '1996-06-09',
      endDate: null,
      agencyId: 'MDI',
      agencyDescription: 'Moorland (HMP & YOI)',
      treatmentDescription: 'Audio/visual aids',
    },
  ],
}
