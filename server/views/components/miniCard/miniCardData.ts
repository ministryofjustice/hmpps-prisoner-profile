export interface MiniCardDataItem {
  text: string
  classes?: string
}

export interface MiniCardData {
  heading: string
  label?: string
  items: MiniCardDataItem[]
  linkHref?: string
  linkLabel?: string
}
