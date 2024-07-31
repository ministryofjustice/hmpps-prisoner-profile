const notStandardPlurals: Record<string, string> = {
  person: 'people',
  man: 'men',
  woman: 'women',
  child: 'children',
  knife: 'knives',
  life: 'lives',
  wife: 'wives',
  foot: 'feet',
  tooth: 'teeth',
}

/**
 * Pluralises a given word based on a count provided.
 *
 * Uses `nonStandardPlurals` if the word is defined, else just adds an 's'
 *
 * Both can be overridden by using the `plural` option
 *
 * Added as Nunjucks filter for use in templates, e.g.
 * - {{ prisonersArray.length | pluralise('person') }} // 'people'
 * - {{ countOfChildren | pluralise('child') }} // 'children'
 * - {{ countOfChildren | pluralise('child', 'kids') }} // 'kids'
 *
 * Limitations: entries in `nonStandardPlurals` are case-sensitive, so 'Person' will return 'Persons'
 *
 * @param count - denotes if `word` should be pluralised or not
 * @param word - the singular form of the word to be pluralised
 * @param options - plural, includeCount, emptyMessage
 * @param options.plural - return this specific plural if count !== [1,-1]
 * @param options.includeCount - prefix the return string with `count` (e.g. '3 people') - defaults to true
 * @param options.emptyMessage - return this string if `count` is Falsy
 * @return pluralised form of word if count !== [1,-1] else just word
 */
export const pluralise = (
  count: number,
  word: string,
  options?: { plural?: string; includeCount?: boolean; emptyMessage?: string },
): string => {
  const includeCount = options?.includeCount ?? true
  if (!count && options?.emptyMessage) {
    return options.emptyMessage
  }
  const pluralised = [1, -1].includes(count) ? word : options?.plural || notStandardPlurals[word] || `${word}s`
  return includeCount ? `${count} ${pluralised}` : pluralised
}
