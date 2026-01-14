import { z } from "zod";

const __schemaRegistryRule = z.object({
  format: z.string(),
  header: z.record(z.string(), z.string()).optional(),
});

const __schemaRegistriesSchema = z.record(
  z.string(),
  z.object({
    rule: __schemaRegistryRule,
  }),
);

const __schemaDependenciesSchema = z.record(
  z.string(),
  z.record(z.string(), z.string()),
);

const __schemaManifest = z.object({
  registries: __schemaRegistriesSchema.optional(),
  dependencies: __schemaDependenciesSchema.optional(),
});

export const manifestSchema = {
  zod: __schemaManifest,
  includes: {
    __schemaRegistriesSchema,
    __schemaDependenciesSchema,
    __schemaRegistryRule,
  },
};

export namespace ManifestSchemaType {
  export type zod = z.infer<typeof __schemaManifest>;
  export namespace includes {
    export type __schemaRegistriesSchema = z.infer<
      typeof __schemaRegistriesSchema
    >;
    export type __schemaDependenciesSchema = z.infer<
      typeof __schemaDependenciesSchema
    >;
    export type __schemaRegistryRule = z.infer<typeof __schemaRegistryRule>;
  }
}
