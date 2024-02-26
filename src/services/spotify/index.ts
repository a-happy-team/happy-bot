import { injectable } from "@a-happy-team/dependo";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

@injectable({ singleton: true })
export default class SpotifyClient {
  bearerToken: string | null = null;
  spotifyApi: SpotifyApi;

  constructor() {
    this.spotifyApi = SpotifyApi.withClientCredentials(
      process.env.SPOTIFY_CLIENT_ID as string,
      process.env.SPOTIFY_CLIENT_SECRET as string,
    );
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
      id: track.id,
    };
  }

  async getRecommendations(params: GetRecommendationsParams): Promise<GetTracksReturn> {
    const recommendations = await this.spotifyApi.recommendations.get({
      seed_tracks: params.seeds.tracks,
      limit: params.limit ?? 10,
    });

    return await Promise.all(
      recommendations.tracks.map(async (track) => {
        const artist = await this.spotifyApi.artists.get(track.artists[0].id);

        return {
          title: track.name,
          artist: artist.name,
          genre: artist.genres[0],
          id: track.id,
        };
      }),
    );
  }
}

type GetRecommendationsParams = {
  seeds: {
    /**
     * Genres available at https://api.spotify.com/v1/recommendations/available-genre-seeds
     */
    genres?: string[];

    /**
     * Spotify artist IDs
     */
    artists?: string[];

    /**
     * Spotify track IDs
     */
    tracks?: string[];
  };
  limit: 5 | 10 | 15 | 20;
};

type TrackInfo = {
  title: string;
  artist: string;
  genre: string;
  id: string;
};

type GetTracksReturn = Array<{ title: string }>;
