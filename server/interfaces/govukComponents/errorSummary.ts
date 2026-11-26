import type { Attributes, Either, OptionalEither, TextOrHtml } from './_internal'

export type GovukErrorSummary = Either<'titleText', 'titleHtml'> &
  OptionalEither<'descriptionText', 'descriptionHtml'> & {
    errorList: GovukErrorSummaryItem[]
    disableAutoFocus?: boolean
    classes?: string
    attributes?: Attributes
  }

type GovukErrorSummaryItem = TextOrHtml & {
  href: string
  attributes?: Attributes
}
