import crypto from "crypto";
import { inject } from "@a-happy-team/dependo";
import { Message } from "discord.js";
import Command from ".";
import ConnectionManager from "../connection-manager";
import { Song } from "../modules/music/queue";
import SongPlayRepository from "../services/database/repositories/song-play.repository";
import MessagesBank from "../services/message/message-embedder";
import SpotifyClient from "../services/spotify";
import YoutubeSource, { SearchResult } from "../services/youtube";

export default class Recommend extends Command {
  name = "!recommend";
  description = "Recommends 5 songs based on your listening history.";

  @inject(SongPlayRepository) songPlayRepository: SongPlayRepository;
  @inject(SpotifyClient) spotifyClient: SpotifyClient;
  @inject(YoutubeSource) youtubeSource: YoutubeSource;

  constructor(private readonly connectionManager: ConnectionManager) {
    super();
  }
  async execute(message: Message) {
    const connection = this.connectionManager.getConnection(message);

    if (!this.validate(message) || !connection) {
      return message.channel.send({
        embeds: [MessagesBank.error("You need to be in the same voice channel as the bot to recommend songs!")],
      });
    }

    const songs = await this.songPlayRepository.getTopSongs({ userId: message.author.id });

    if (songs.length < 5) {
      return message.channel.send({
        embeds: [MessagesBank.error("You need to listen to at least 5 songs to get recommendations!")],
      });
    }

    const recommendations = await this.spotifyClient.getRecommendations({
      seeds: {
        tracks: songs.map((song) => song.spotifyTrackId),
      },
      limit: 10,
    });

    const youtubeSongs = (
      await Promise.all(recommendations.map((song) => this.youtubeSource.search({ search: song.title })))
    )
      .flat()
      .filter(Boolean) as SearchResult;

    const songsToQueue: Song[] = youtubeSongs.map((song) => ({
      title: song.title,
      url: song.url,
      duration: song.duration,
      thumbnail: song.thumbnail,
      requestedBy: message.author.id,
      fileName: crypto.randomUUID(),
      skipVotes: new Set(),
    }));

    const firstSong = songsToQueue.shift() as Song;

    if (connection.player.status !== "playing") {
      const downloaded = await this.youtubeSource.download(message.guildId as string, firstSong);

      if (!downloaded) {
        return message.channel.send({
          embeds: [MessagesBank.error("This song is not available, sorry.")],
        });
      }
    }

    connection.queue.add([firstSong, ...songsToQueue]);
    connection.player.play();
    connection.player.preloadNextSongs(5);

    return message.channel.send({
      embeds: [MessagesBank.success(recommendations.map((song) => song.title).join("\n"))],
    });
  }

  validate(message: Message) {
    if (!message.member) return false;

    const notInChannel = !message.member.voice.channel;
    const isInDifferentChannel = !this.connectionManager.isInSameChannel(message);
    const connection = this.connectionManager.getConnection(message);

    if (notInChannel || isInDifferentChannel || !connection) {
      return false;
    }

    return true;
  }
}
