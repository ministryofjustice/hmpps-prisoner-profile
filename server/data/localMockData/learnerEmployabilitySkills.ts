import { LearnerEmployabilitySkills } from '../../interfaces/learnerEmployabilitySkills'

export const learnerEmployabilitySkills: LearnerEmployabilitySkills = {
  content: [
    {
      prn: 'G6123VU',
      establishmentId: 'string',
      establishmentName: 'string',
      employabilitySkill: 'string',
      activityStartDate: '2023-02-28',
      activityEndDate: '2023-02-28',
      deliveryLocationPostCode: 'string',
      deliveryMethodType: 'string',
      activityLocation: 'string',
      reviews: [
        {
          reviewDate: '2023-02-28',
          currentProgression: 'string',
          comment: 'string',
        },
      ],
    },
  ],
  empty: true,
  first: true,
  last: true,
  number: 0,
  numberOfElements: 0,
  pageable: {
    offset: 0,
    pageNumber: 0,
    pageSize: 0,
    paged: true,
    sort: {
      empty: true,
      sorted: true,
      unsorted: true,
    },
    unpaged: true,
  },
  size: 0,
  sort: {
    empty: true,
    sorted: true,
    unsorted: true,
  },
  totalElements: 0,
  totalPages: 0,
}

export default {
  learnerEmployabilitySkills,
}
