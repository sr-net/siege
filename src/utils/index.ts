export type OptionalUuid<T extends { uuid: string }> = Omit<T, "uuid"> & {
  uuid?: string
}
