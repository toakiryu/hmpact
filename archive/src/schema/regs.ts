import z from "zod";

const __schemaRegsRegistryRule = z.object({
  format: z.string(),
  header: z.record(z.string(), z.string()).optional(),
});

const __schemaRegsRegistry = z.object({
  id: z.string(),
  rule: __schemaRegsRegistryRule,
});

const __schemaRegs = z.object({
  registries: z.array(__schemaRegsRegistry),
});

export const regsSchema = {
  zod: __schemaRegs,
  includes: {
    __schemaRegsRegistry,
    __schemaRegsRegistryRule,
  },
};
export namespace RegsSchemaType {
  export type zod = z.infer<typeof __schemaRegs>;
  export namespace includes {
    export type __schemaRegsRegistry = z.infer<typeof __schemaRegsRegistry>;
    export type __schemaRegsRegistryRule = z.infer<
      typeof __schemaRegsRegistryRule
    >;
  }
}
