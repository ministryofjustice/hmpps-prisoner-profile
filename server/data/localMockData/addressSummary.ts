import { GovSummaryItem } from '../../interfaces/govSummaryItem'

// eslint-disable-next-line import/prefer-default-export
export const addressSummaryMock: GovSummaryItem[] = [
  {
    key: { text: 'Address' },
    value: { html: 'Flat 7, premises address, street field<br/>Leeds<br/>West Yorkshire<br/>LS1 AAA<br/>England' },
  },
  {
    key: { text: 'Type of address' },
    value: { html: 'Discharge - Permanent Housing<br/>HDC Address<br/>Other' },
  },
  {
    key: { text: 'Phone' },
    value: { html: '4444555566<br/>0113444444<br/>0113 333444<br/>0800 222333' },
  },
  {
    key: { text: 'Comment' },
    value: {
      text: 'comment field goes here.  comment field goes here.  comment field goes here.  comment field goes here.  comment field goes here.  comment field goes here.  comment field goes here.  comment field goes here.  comment field goes here.',
    },
  },
]
