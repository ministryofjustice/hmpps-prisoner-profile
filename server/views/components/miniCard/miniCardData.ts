export interface MiniCardDataItem {
  text: string
  classes?: string
}

export interface MiniCardData {
  heading: string
  items: MiniCardDataItem[]
  linkHref?: string
  linkLabel?: string
}
