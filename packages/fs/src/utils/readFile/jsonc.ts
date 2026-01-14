import { parse, ParseError, printParseErrorCode } from "jsonc-parser";

export type JsoncParseOptions = {
  path?: string;
};

export type __helperFileParseJsoncResponse<T = unknown> =
  | {
      status: "success";
      data: T;
    }
  | {
      status: "error";
      message: string;
    };

export const __helperFileParseJsonc = <T = unknown>(
  row: string,
  options?: JsoncParseOptions,
): __helperFileParseJsoncResponse<T> => {
  const errors: ParseError[] = [];
  const parsed = parse(row, errors);

  if (errors.length > 0) {
    errors.forEach((error) => {
      console.error(
        `エラー: ${printParseErrorCode(error.error)} at ${error.offset}`,
      );
    });
    return {
      status: "error",
      message: `Failed to parse JSONC file at ${options?.path || "unknown path"}.`,
    };
  }

  return {
    status: "success",
    data: parsed as T,
  };
};
