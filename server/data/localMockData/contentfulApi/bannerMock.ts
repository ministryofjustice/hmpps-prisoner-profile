import { Document } from '@contentful/rich-text-types'
import { BannerApollo } from '../../interfaces/contentfulApi/bannerApollo'

export const bannerApolloMock: BannerApollo[] = [
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
      } as unknown as Document,
    },
  },
]

export const bannerCollectionMock = {
  data: {
    bannerCollection: {
      items: bannerApolloMock,
    },
  },
}
