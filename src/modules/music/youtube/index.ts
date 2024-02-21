import fs from "fs";
import path from "path";
import ytdl from "@distube/ytdl-core";
import * as YoutubeSR from "youtube-sr";
import { SONGS_FOLDER } from "../../../constants";
import { Try } from "../../../decorators/try";
import SongRepository from "../../../services/database/repositories/song.repository";
import OpenAI from "../../../services/open-ai";
import { Song } from "../queue";
import SpotifyClient from "../spotify";

export type SearchParams = {
  search: string;
};

export type SearchResult = Array<{
  title: string;
  url: string;
  duration: string;
  thumbnail: string;
}>;
export default class YoutubeSource {
  SONGS_FOLDER_PATH = path.join(SONGS_FOLDER);
  youtubeSearch: typeof YoutubeSR.YouTube;

  constructor(
    private readonly songRepository: SongRepository,
    private readonly spotify: SpotifyClient,
  ) {
    this.youtubeSearch = YoutubeSR.YouTube;
  }

  @Try
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
              duration: video.durationFormatted,
              thumbnail: video.thumbnail?.url ?? "",
            }) satisfies SearchResult[number],
        );

        return videos;
      }
    }

    const search = await this.youtubeSearch.searchOne(params.search, "video", true);

    if (!search || !search.title) {
      return null;
    }

    const trackInfo = await this.spotify.getTrackInfo(search.title);
    const isSameSong = await new OpenAI().isSameSong(search.title, trackInfo);

    if (trackInfo && isSameSong) {
      this.songRepository.findOrCreate({
        name: trackInfo.title,
        artist: trackInfo.artist,
        genre: trackInfo.genre,
        url: search.url,
      });
    }

    return [
      {
        title: search.title || "Unknown",
        url: search.url,
        duration: search.durationFormatted,
        thumbnail: search.thumbnail?.url ?? "",
      },
    ];
  }

  @Try
  async download(guildId: string, song: Song) {
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

    return true;
  }
}
