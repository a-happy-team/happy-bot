import fs from "fs";
import path from "path";
import * as YoutubeSR from "youtube-sr";
import ytdl from "ytdl-core";
import { SONGS_FOLDER } from "../../../constants";
import { Song } from "../queue";
import { Source } from "../source";

export default class YoutubeSource implements Source.Contract {
  SONGS_FOLDER_PATH = path.join(__dirname, "..", "..", "..", "..", SONGS_FOLDER);
  youtubeSearch: typeof YoutubeSR.YouTube;

  constructor() {
    this.youtubeSearch = YoutubeSR.YouTube;
  }

  async search(params: Source.SearchParams): Promise<Source.SearchResult | null> {
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
            }) satisfies Source.SearchResult[number],
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

  async download(song: Song) {
    const songPath = path.join(this.SONGS_FOLDER_PATH, `${song.fileName}.mp3`);

    if (fs.existsSync(songPath)) {
      return;
    }

    return await new Promise((resolve, reject) => {
      ytdl(song.url, { filter: "audioonly", quality: "highestaudio" })
        .pipe(fs.createWriteStream(songPath))
        .on("finish", resolve)
        .on("error", reject);
    });
  }
}
