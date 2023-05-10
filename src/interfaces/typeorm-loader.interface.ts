export interface PolymorphicLoaderOptions {
  entityType: string | number,
  entityId: number | string,
}

/**
 * Specific options for the typeorm loader itself.
 */
export interface TypeormLoaderOptions {
  selfKey?: boolean;
  polymorphic?: PolymorphicLoaderOptions;
}
