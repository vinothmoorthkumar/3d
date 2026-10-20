/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of a proxy to https://careers.un.org/api. Defaults to the dev/preview proxy at /un-api. */
  readonly VITE_UN_API_BASE?: string;
}
