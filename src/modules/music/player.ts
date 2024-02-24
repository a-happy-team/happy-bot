import fs from "fs";
import path from "path";
import {
  AudioPlayer,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnection,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
} from "@discordjs/voice";
import ConnectionManager from "../../connection-manager";
import { SONGS_FOLDER } from "../../constants";
import { Try } from "../../decorators/try";
import SongPlayRepository from "../../services/database/repositories/song-play.repository";
import YoutubeSource from "../../services/youtube";
import Queue, { Song } from "./queue";

export default class Player {
  SONGS_FOLDER_PATH = "";
  PRELOAD_SONGS_COUNT = 5;

  /**
   * The percentage of votes needed to skip the current song.
   * If the number of votes to skip is greater than this percentage, the song will be skipped.
   * @value The percentage of votes needed to skip the song. Ranging from 0 to 1.
   */
  PERCENTAGE_OF_VOTES_TO_SKIP = 0.5;

  DISCONNECT_AFTER = 300_000; // 5 minutes

  status: "playing" | "paused" | "stopped" = "stopped";
  _player: AudioPlayer;

  disconnectTimeout: NodeJS.Timeout | null = null;

  currentSong: Song | null = null;

  connection: VoiceConnection | null = null;

  constructor(
    private readonly _queue: Queue,
    private readonly youtube: YoutubeSource,
    private readonly connectionManager: ConnectionManager,
    private readonly songPlayRepository: SongPlayRepository,
  ) {
    this._player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Stop,
      },
    });

    this._player.on("stateChange", (oldState, newState) => {
      if (newState.status === "idle" && this.status === "playing") {
        this.next();
        this.startDisconnectTimeout();
      }

      if (newState.status === "playing") {
        this.clearDisconnectTimeout();
      }
    });
  }

  connect(connection: VoiceConnection) {
    this.connection = connection;
    this.connection.subscribe(this._player);
    this.SONGS_FOLDER_PATH = path.join(SONGS_FOLDER, connection.joinConfig.guildId);

    if (!fs.existsSync(this.SONGS_FOLDER_PATH)) {
      fs.mkdirSync(this.SONGS_FOLDER_PATH);
    }

    this.connection?.on("stateChange", (oldState, newState) => {
      const wasReady = oldState.status === VoiceConnectionStatus.Ready;
      const isConnecting = newState.status === VoiceConnectionStatus.Connecting;

      console.log(`[Connection] State change: ${oldState.status} -> ${newState.status}`);

      if (wasReady && isConnecting) {
        this.connection?.configureNetworking();
      }
    });

    this.connection?.on("debug", (message) => {
      console.log(`[Connection] Debug: ${message}`);
    });
  }

  play() {
    const song = this._queue.currentSong;

    if (this.currentSong?.fileName === song?.fileName || !song) {
      return;
    }

    const songPath = path.join(this.SONGS_FOLDER_PATH, `${song.fileName}.mp3`);

    const resource = createAudioResource(songPath, {
      inputType: StreamType.Arbitrary,
      inlineVolume: true,
    });
    resource.volume?.setVolume(0.2);

    this._player.play(resource);
    this.status = "playing";
    this.currentSong = song;
    this.preloadNextSongs(this.PRELOAD_SONGS_COUNT);
    this.songPlayRepository.add({
      url: song.url,
      guildId: this.connection?.joinConfig.guildId as string,
      channelId: this.connection?.joinConfig.channelId as string,
      requestedBy: song.requestedBy,
    });
  }

  resume() {
    if (this.status !== "paused") {
      return;
    }

    this._player.unpause();
    this.status = "playing";
  }

  pause() {
    if (this.status !== "playing") {
      // TODO: Send message to channel that player is not playing

      return;
    }

    this._player.pause();

    this.status = "paused";
  }

  stop() {
    if (this.status === "stopped") {
      // TODO: Send message to channel that player is already stopped

      return;
    }

    this.deleteAllSongsFromDisk();
    this._player.stop();
    this._queue.clear();
    this.status = "stopped";
    this._queue.currentSong = null;
    this.currentSong = null;
  }

  skip(userId: string, membersInChannel: number) {
    this._queue.skip(userId);

    const votes = this._queue.skipVotes;

    if (votes / membersInChannel >= this.PERCENTAGE_OF_VOTES_TO_SKIP) {
      this.next();

      return true;
    }

    return false;
  }

  next() {
    if (this._queue.isEmpty) return this.stop();

    this.deleteSongFromDisk(this.currentSong?.fileName as string);
    this._queue.next();
    this.play();
  }

  clearQueue() {
    this.deleteAllSongsFromDisk();
    this._queue.clear();
  }

  deleteSongFromDisk(name: string) {
    if (fs.existsSync(path.join(this.SONGS_FOLDER_PATH, `${name}.mp3`))) {
      fs.unlinkSync(path.join(this.SONGS_FOLDER_PATH, `${name}.mp3`));
    }
  }

  deleteAllSongsFromDisk() {
    if (fs.existsSync(this.SONGS_FOLDER_PATH)) {
      fs.rmSync(this.SONGS_FOLDER_PATH, { recursive: true, force: true });

      fs.mkdirSync(this.SONGS_FOLDER_PATH);
    }
  }

  /**
   * Downloads `count` songs from the queue.
   * It's safe to call this method multiple times, as it will only download the songs that are not already downloaded.
   */
  @Try private async preloadNextSongs(count: number) {
    const songs = this._queue.songs.slice(0, count);

    await Promise.all(
      songs.map(async (song) => {
        const downloaded = await this.youtube.download(this.connection?.joinConfig.guildId as string, song);

        if (!downloaded) {
          this._queue.remove(song.fileName);
        }
      }),
    );
  }

  private startDisconnectTimeout() {
    this.disconnectTimeout = setTimeout(() => {
      if (this._queue.isEmpty) {
        this.connectionManager.disconnect(this.connection?.joinConfig.guildId ?? "");
      }
    }, this.DISCONNECT_AFTER);
  }
  private clearDisconnectTimeout() {
    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = null;
    }
  }
}
