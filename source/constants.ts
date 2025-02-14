export const LOADER_NAME = 'wext-manifest-loader';

export const ENVKeys = {
  DEV: 'dev',
  PROD: 'prod',
} as const;

export const Browser = {
  CHROME: 'chrome',
  FIREFOX: 'firefox',
  OPERA: 'opera',
  EDGE: 'edge',
  SAFARI: 'safari',
} as const;
export type BrowserType = (typeof Browser)[keyof typeof Browser];

export const browserVendors: BrowserType[] = [
  Browser.CHROME,
  Browser.FIREFOX,
  Browser.OPERA,
  Browser.EDGE,
  Browser.SAFARI,
];
export const envVariables: string[] = [ENVKeys.DEV, ENVKeys.PROD];

// Refer: https://regex101.com/r/ddSEHh/1
export const CUSTOM_PREFIX_REGEX = new RegExp(
  `^__((?:(?:${[...browserVendors, ...envVariables].join('|')})\\|?)+)__(.*)`
);
