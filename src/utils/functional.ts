export const isNil = (variable: unknown): variable is null | undefined => {
  return variable === null || variable === undefined
}

export const prop = <O extends Record<string, unknown>, P extends keyof O>(
  property: P,
) => (obj: O) => obj[property] ?? null

export const propEq = <O extends Record<string, unknown>, P extends keyof O>(
  property: P,
  value: O[P],
) => (obj: O) => obj[property] === value
