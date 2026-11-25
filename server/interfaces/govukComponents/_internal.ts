export type Attributes = Record<string, unknown>

export type Either<A extends string, B extends string, T = string> = { [a in A]: T } | { [b in B]: T }
export type OptionalEither<A extends string, B extends string, T = string> = { [a in A]?: T } | { [b in B]?: T }

export type TextOrHtml = Either<'text', 'html'>
