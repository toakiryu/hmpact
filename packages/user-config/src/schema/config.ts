import z from "zod";

const __schemaLanguagePack = z.record(z.string(), z.string());

const __schemaLanguage = z.object({
  default: z.string(),
  packs: z.record(z.string(), __schemaLanguagePack),
});

const __schemaUserConfig = z.object({
  lang: __schemaLanguage,
});

export const userConfigSchema = {
  zod: __schemaUserConfig,
  includes: {
    __schemaLanguage,
  },
};

export namespace UserConfigSchemaType {
  export type zod = z.infer<typeof __schemaUserConfig>;
  export namespace includes {
    export type __schemaLanguage = z.infer<typeof __schemaLanguage>;
    export type __schemaLanguagePack = z.infer<typeof __schemaLanguagePack>;
  }
}
