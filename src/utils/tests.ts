export const assertObjectEquals = <T extends Record<string, unknown>>(
  result: T,
  user: T,
) => {
  expect(JSON.stringify(result, null, 2)).toEqual(JSON.stringify(user, null, 2))
}
