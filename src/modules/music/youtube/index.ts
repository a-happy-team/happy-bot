import { Song } from "../queue";
import * as YoutubeSR from "youtube-sr";
import path from "path";
import { SONGS_FOLDER } from "../../../constants";
import ytdl from "ytdl-core";
import fs from 'fs'
import { Source } from "../source";


export default class YoutubeSource implements Source.Contract {
  SONGS_FOLDER_PATH = path.join(__dirname, '..', '..', '..', '..', SONGS_FOLDER);
  youtubeSearch: typeof YoutubeSR.YouTube;

  constructor() {
    this.youtubeSearch = YoutubeSR.YouTube;
  }

  async search(params: Source.SearchParams): Promise<Source.SearchResult | null> {
    const search = await this.youtubeSearch.searchOne(params.search, "video", true);

    if (!search) {
      return null;
    }

    return {
      title: search.title || "Unknown",
      url: search.url,
      source: 'youtube'
    };
  }

  async download(song: Song) {
    const songPath = path.join(this.SONGS_FOLDER_PATH, `${song.fileName}.mp3`);

    if (fs.existsSync(songPath)) {
      return;
    }

    return await new Promise((resolve, reject) => {
      ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' })
        .pipe(fs.createWriteStream(songPath))
        .on('finish', resolve)
        .on('error', reject)
    })
  }
}

