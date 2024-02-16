import { ProbationDocuments } from '../../../interfaces/deliusApi/probationDocuments'

export const mockProbationDocumentsResponse: ProbationDocuments = {
  crn: 'crn',
  name: { forename: 'first', middleName: 'middle', surname: 'last' },
  convictions: [
    {
      active: true,
      date: '2018-09-04',
      offence: 'Petting too many cats',
      title: 'CJA - Indeterminate Public Prot. (5 Years)',
      institutionName: 'Berwyn (HMP)',
      documents: [
        {
          id: '12345',
          name: 'Document One',
          description: 'Document description',
          type: 'type',
          author: 'Author',
          createdAt: '2018-09-04',
        },
        {
          id: '54321',
          name: 'Document two',
          description: 'Second doc',
          type: 'another type',
          author: 'author 2',
          createdAt: '2020-09-04',
        },
      ],
    },

    {
      active: false,
      date: '2021-09-04',
      offence: 'too many dogs',
      title: 'Conviction title',
      institutionName: 'Leeds (HMP)',
      documents: [
        {
          id: '11111',
          name: 'Document three',
          description: 'another description',
          type: 'third type',
          author: 'author 3',
          createdAt: '2021-09-04',
        },
        {
          id: '22222',
          name: 'Document four',
          description: 'fourth doc',
          type: 'yet another type',
          author: 'author 4',
          createdAt: '2022-09-04',
        },
      ],
    },
  ],
  documents: [
    {
      id: '1e593ff6-d5d6-4048-a671-cdeb8f65608b',
      name: 'PRE-CONS.pdf',
      author: 'Andy Marke',
      type: 'PNC previous convictions',
      description: 'Previous convictions as of 01/09/2019',
      createdAt: '2018-09-04',
    },
  ],
}

export default { mockProbationDocumentsResponse }
