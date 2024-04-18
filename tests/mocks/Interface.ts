type Interface<T> = {
  [P in keyof T]: T[P]
}

export default Interface
