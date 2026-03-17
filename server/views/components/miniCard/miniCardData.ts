export interface MiniCardDataItem {
  text?: string
  showWarningIcon?: boolean
  classes?: string
}

export interface MiniCardData {
  heading: string
  label?: string
  items: MiniCardDataItem[]
  linkHref?: string
  linkLabel?: string
}
