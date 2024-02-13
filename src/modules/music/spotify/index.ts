import { SpotifyApi } from "@spotify/web-api-ts-sdk";

export default class SpotifyClient {
  bearerToken: string | null = null;
  spotifyApi: SpotifyApi;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {
    this.spotifyApi = SpotifyApi.withClientCredentials(this.clientId, this.clientSecret);
  }

  isPlaylistUrl(url: string): boolean {
    return url.includes("spotify.com/playlist");
  }

  async getTracks(playlistUrl: string): Promise<GetTracksReturn> {
    const PLAYLIST_ID_REGEX = /playlist\/([a-zA-Z0-9]+)/;
    const playlistId = playlistUrl.match(PLAYLIST_ID_REGEX)?.[1];

    if (!playlistId) {
      return [];
    }

    const playlist = await this.spotifyApi.playlists.getPlaylist(playlistId);

    if (!playlist) {
      return [];
    }

    return playlist.tracks.items.map((track) => ({
      title: `${track.track.name} - ${track.track.artists[0].name}`,
    }));
  }
}

type GetTracksReturn = Array<{ title: string }>;
