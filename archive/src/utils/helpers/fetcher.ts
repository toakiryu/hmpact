import fetch from "isomorphic-unfetch";

const __helperFetcherFunc = (url: string) =>
  fetch(url, {
    headers: {},
  }).then((r) => r.json());

const _helperFetcherFunction = __helperFetcherFunc;

export default _helperFetcherFunction;
