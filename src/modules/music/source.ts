import { Song } from "./queue";

export namespace Source {
  export interface Contract {
    search(params: SearchParams): Promise<SearchResult | null>;
    download(song: Song): Promise<unknown>;
  }
  export type SearchParams = {
    search: string;
  }

  export type SearchResult = Array<{
    title: string;
    url: string;
    source: 'youtube' | 'spotify'
  }>
}
