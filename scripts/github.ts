export interface TreeAPI {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: null | string;
  type: Type;
  _links: Links;
}

export interface Links {
  self: string;
  git: string;
  html: string;
}

export enum Type {
  Dir = 'dir',
  File = 'file'
}
