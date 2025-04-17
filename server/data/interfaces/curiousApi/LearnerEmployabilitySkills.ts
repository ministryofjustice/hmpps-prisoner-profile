export default interface LearnerEmployabilitySkills {
  content: [
    {
      prn: string
      establishmentId: string
      establishmentName: string
      employabilitySkill: string
      activityStartDate: string
      activityEndDate: string
      deliveryLocationPostCode: string
      deliveryMethodType: string
      activityLocation: string
      reviews: [
        {
          reviewDate: string
          currentProgression: string
          comment: string
        },
      ]
    },
  ]
  empty: boolean
  first: boolean
  last: boolean
  number: number
  numberOfElements: number
  pageable: {
    offset: number
    pageNumber: number
    pageSize: number
    paged: boolean
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    unpaged: boolean
  }
  size: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  totalElements: number
  totalPages: number
}
