export default function appendRefererToUrl(url: string, referer: string) {
  if (referer) return `${url}?referer=${referer}`
  return url
}
