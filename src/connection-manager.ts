import { VoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { JoinVoiceChannelParams } from "./client";
import Player from "./modules/music/player";
import Queue from "./modules/music/queue";
import YoutubeSource from "./modules/music/youtube";
import { Message } from "discord.js";
import SpotifyClient from "./modules/music/spotify";

export default class ConnectionManager {
  static instance: ConnectionManager;
  connections: Map<string, Connection>;

  constructor(
    public readonly youtube: YoutubeSource,
    public readonly spotify: SpotifyClient,
  ) {
    this.connections = new Map();
  }

  joinVoiceChannel(params: JoinVoiceChannelParams) {
    if (this.connections.has(params.guildId)) {
      return this.connections.get(params.guildId) as Connection;
    }

    const voiceConnection = joinVoiceChannel(params);

    const queue = new Queue();
    const player = new Player(queue, this.youtube);


    const newConnection = {
      voiceConnection,
      player,
      queue,
      youtube: this.youtube,
      spotify: this.spotify,
    }

    this.connections.set(params.guildId, newConnection);

    return newConnection;
  }

  getConnection(message: Message) {
    if (!message.guildId) {
      return null;
    }

    return this.connections.get(message.guildId);
  }

  isInSameChannel(message: Message) {
    const voiceChannel = message.member?.voice.channel;
    const connection = this.getConnection(message);

    if (!voiceChannel || !connection) {
      return false;
    }

    return voiceChannel.id === connection.voiceConnection.joinConfig.channelId;
  }
}

type Connection = {
  voiceConnection: VoiceConnection;
  player: Player;
  queue: Queue;
  youtube: YoutubeSource;
  spotify: SpotifyClient;
}