export default <T>(object: T): T => {
  return Object.entries(object).reduce<T>((acc, [key, value]) => {
    return value ? { ...acc, [key]: value } : acc
  }, {} as T)
}
