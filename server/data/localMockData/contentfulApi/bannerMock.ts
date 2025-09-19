import { Document } from '@contentful/rich-text-types'
import { BannerApollo } from '../../interfaces/contentfulApi/bannerApollo'

const bannerApolloMock: BannerApollo[] = [
  {
    text: {
      json: {
        data: {},
        content: [
          {
            data: {},
            content: [{ data: {}, marks: [], value: 'Banner', nodeType: 'text' }],
            nodeType: 'paragraph',
          },
        ],
        nodeType: 'document',
      } as Document,
    },
    prisons: [],
  },
]

export const bannerCollectionMock = {
  data: {
    bannerCollection: {
      items: bannerApolloMock,
    },
  },
}

export default { bannerCollectionMock }
