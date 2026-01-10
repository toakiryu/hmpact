
/**
 * フォーマット文字列内の $` を `&` に変換
 * @param format フォーマット文字列 (例: "//api.motion.dev/registry?package={pkg}$version={ver}")
 * @returns 変換されたフォーマット文字列
 */
export function convertFormatToUrl(format: string): string {
  return format.replace(/#/g, "&");
}

/**
 * フォーマット文字列内のプレースホルダーを置換
 * @param format フォーマット文字列
 * @param pkg パッケージ名
 * @param ver バージョン
 * @param envVars 環境変数オブジェクト
 * @returns 置換されたURL
 */
export function interpolateFormat(
  format: string,
  pkg: string,
  ver: string,
  envVars: Record<string, string> = {},
): string {
  let url = convertFormatToUrl(format);

  url = url.replace(/{pkg}/g, pkg);
  url = url.replace(/{ver}/g, ver);
  url = url.replace(/{:env\.(\w+)}/g, (_, envKey) => {
    return envVars[envKey] || process.env[envKey] || "";
  });

  return url;
}
