/**
 * Simple nunjucks filter to filter an array on the specified property and value
 */
export default function filterArrayOnPropertyFilter(array: unknown[], property: string, value: unknown) {
  return (array as never[]).filter(item => item[property] === value)
}
