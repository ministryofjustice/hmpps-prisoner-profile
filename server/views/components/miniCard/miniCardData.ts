export interface MiniCardDataItem {
  text?: string
  showWarningIcon?: boolean
  classes?: string
}

export interface MiniCardData {
  heading: string
  id?: string
  label?: string
  items?: MiniCardDataItem[]
  topLabel?: string
  topContent?: string | number
  topClass?: 'big' | 'small'
  bottomLabel?: string
  bottomContentLine1?: string | number
  bottomContentLine1Href?: string
  bottomContentLine2?: string | number
  bottomContentLine3?: string | number
  bottomContentError?: string
  bottomClass?: 'big' | 'small'
  linkHref?: string
  linkLabel?: string
}

export type MiniCardMapper<T, A extends unknown[] = unknown[]> = (data: T, ...args: A) => MiniCardData
