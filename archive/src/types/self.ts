
export interface hmpactrcType {
  // パッケージ名
  name: string;
  // バージョン
  version: string;
  manifestFile: {
    name: string | string[];
  };
}
