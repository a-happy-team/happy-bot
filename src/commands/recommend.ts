import { inject } from "@a-happy-team/dependo";
import { Message } from "discord.js";
import Command from ".";
import ConnectionManager from "../connection-manager";
import SongPlayRepository from "../services/database/repositories/song-play.repository";
import MessagesBank from "../services/message/message-embedder";
import SpotifyClient from "../services/spotify";

export default class Recommend extends Command {
  name = "!recommend";
  description = "Recommends 5 songs based on your listening history.";

  @inject(SongPlayRepository) songPlayRepository: SongPlayRepository;
  @inject(SpotifyClient) spotifyClient: SpotifyClient;

  constructor(private readonly connectionManager: ConnectionManager) {
    super();
  }
  async execute(message: Message) {
    if (!this.validate(message)) {
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
