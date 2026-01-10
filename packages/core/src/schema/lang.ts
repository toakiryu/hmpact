import z from "zod";

const __schemaLangMapping = z.record(z.string(), z.string());

const __schemaLang = z.object({
  version: z.string(),
  lang: z.string(),
  mapping: __schemaLangMapping,
});

export const langSchema = {
  zod: __schemaLang,
  includes: {
    __schemaLangMapping,
  },
};

export namespace LangSchemaType {
  export type zod = z.infer<typeof __schemaLang>;
  export namespace includes {
    export type __schemaLangMapping = z.infer<typeof __schemaLangMapping>;
  }
}
