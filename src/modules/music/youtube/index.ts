import ytdl from "@distube/ytdl-core";
import fs from "fs";
import path from "path";
import * as YoutubeSR from "youtube-sr";
import { SONGS_FOLDER } from "../../../constants";
import { Song } from "../queue";

export type SearchParams = {
  search: string;
};

export type SearchResult = Array<{
  title: string;
  url: string;
  source: "youtube";
}>;
export default class YoutubeSource {
  SONGS_FOLDER_PATH = path.join(SONGS_FOLDER);
  youtubeSearch: typeof YoutubeSR.YouTube;

  constructor() {
    this.youtubeSearch = YoutubeSR.YouTube;
  }

  async search(params: SearchParams): Promise<SearchResult | null> {
    const YOUTUBE_PLAYLIST_REGEX = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;

    const isPlaylist = YOUTUBE_PLAYLIST_REGEX.test(params.search);

    if (isPlaylist) {
      const playlist = await this.youtubeSearch.getPlaylist(params.search);

      if (playlist) {
        const videos = playlist.videos.map(
          (video) =>
            ({
              title: video.title || "Unknown",
              url: video.url,
              source: "youtube",
            }) satisfies SearchResult[number],
        );

        return videos;
      }
    }

    const search = await this.youtubeSearch.searchOne(params.search, "video", true);

    if (!search) {
      return null;
    }

    return [
      {
        title: search.title || "Unknown",
        url: search.url,
        source: "youtube",
      },
    ];
  }

  async download(guildId: string, song: Song) {
    try {

      const songPath = path.join(this.SONGS_FOLDER_PATH, guildId, `${song.fileName}.mp3`);
      
      if (fs.existsSync(songPath)) {
        return true;
      }
      
      await new Promise((resolve, reject) => {
        ytdl(song.url, { filter: "audioonly", quality: "highestaudio" })
        .on("error", reject)
        .pipe(fs.createWriteStream(songPath))
        .on("finish", resolve)
        .on("error", reject);
      });

      return true
    } catch (error) {
      return false
    }
  }
}
