export default class ProblemSavingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProblemSavingError'
  }
}
