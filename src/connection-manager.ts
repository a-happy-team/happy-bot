import { VoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { Message } from "discord.js";
import { Kysely } from "kysely";
import { DB } from "kysely-codegen";
import { JoinVoiceChannelParams } from "./client";
import Player from "./modules/music/player";
import Queue from "./modules/music/queue";
import SpotifyClient from "./modules/music/spotify";
import YoutubeSource from "./modules/music/youtube";
import SongRepository from "./services/database/repositories/song.repository";

export default class ConnectionManager {
  static instance: ConnectionManager;
  connections: Map<string, Connection>;

  private constructor(
    public readonly youtube: YoutubeSource,
    public readonly spotify: SpotifyClient,
    public readonly db: Kysely<DB>,
  ) {
    this.connections = new Map();
  }

  static getInstance(youtube: YoutubeSource, spotify: SpotifyClient, db: Kysely<DB>) {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager(youtube, spotify, db);
    }

    return ConnectionManager.instance;
  }

  joinVoiceChannel(params: JoinVoiceChannelParams) {
    if (this.connections.has(params.guildId)) {
      return this.connections.get(params.guildId) as Connection;
    }

    const voiceConnection = joinVoiceChannel(params);

    const queue = new Queue();
    const player = new Player(queue, this.youtube, this, new SongRepository(this.db));

    const newConnection = {
      voiceConnection,
      player,
      queue,
      youtube: this.youtube,
      spotify: this.spotify,
    };

    this.connections.set(params.guildId, newConnection);

    return newConnection;
  }

  getConnection(message: Message) {
    if (!message.guildId) {
      return null;
    }

    return this.connections.get(message.guildId);
  }

  disconnect(guildId: string) {
    const connection = this.connections.get(guildId);

    if (!connection) {
      return;
    }

    connection.voiceConnection.destroy();
    connection.player.deleteAllSongsFromDisk();
    this.connections.delete(guildId);
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
};
