import z from "zod";

const __helperSchemaSafeCheckFunc = async <T>(
  data: any,
  schema: z.ZodType<T>,
): Promise<z.ZodSafeParseResult<T>> => {
  try {
    // スキーマで検証
    const parsedValue = schema.safeParse(data);
    return parsedValue;
  } catch (e) {
    throw new Error(`Error loading JSONC file: ${e}`);
  }
};

const _helperSchemaFunction = {
  safeCheck: __helperSchemaSafeCheckFunc,
};

export default _helperSchemaFunction;
