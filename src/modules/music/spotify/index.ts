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

  async getTrackInfo(query: string): Promise<TrackInfo | null> {
    const searchResults = await this.spotifyApi.search(query, ["track"]);
    const track = searchResults.tracks.items[0];

    if (!track) {
      return null;
    }

    const artist = await this.spotifyApi.artists.get(track.artists[0].id);

    if (!artist) {
      return null;
    }

    return {
      title: track.name,
      artist: artist.name,
      genre: artist.genres[0],
    };
  }
}

type TrackInfo = {
  title: string;
  artist: string;
  genre: string;
};

new SpotifyClient("888cd697daaa4d3092bc2e0e8f4ff240", "e3875f1141394ac5824bf8f8699677b3")
  .getTrackInfo("i see fire")
  .then(console.log);

type GetTracksReturn = Array<{ title: string }>;
