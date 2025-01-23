export function checkedItemsFromRequestBodyField(body: string[] | string) {
  if (typeof body === 'string') return [body]
  return body
}
