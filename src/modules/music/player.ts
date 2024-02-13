import {
  AudioPlayer,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnection,
  createAudioPlayer,
  createAudioResource,
} from "@discordjs/voice";
import fs from "fs";
import path from "path";
import ConnectionManager from "../../connection-manager";
import { SONGS_FOLDER } from "../../constants";
import Queue, { Song } from "./queue";
import YoutubeSource from "./youtube";

export default class Player {
  SONGS_FOLDER_PATH = '';
  PRELOAD_SONGS_COUNT = 5;

  DISCONNECT_AFTER = 300_000; // 5 minutes

  status: "playing" | "paused" | "stopped" = "stopped";
  _player: AudioPlayer;

  disconnectTimeout: NodeJS.Timeout | null = null;

  currentSong: Song | null = null;

  connection: VoiceConnection | null = null;

  constructor(
    private readonly _queue: Queue,
    private readonly youtube: YoutubeSource,
    private readonly connectionManager: ConnectionManager
  ) {
    this._player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Stop,
      },
    });

    this._player.on("stateChange", (oldState, newState) => {
      if (newState.status === "idle") {
        this.next();

        // Disconnect from the voice channel if the queue is empty for 5 minutes
        this.disconnectTimeout = setTimeout(() => {
          if (this._queue.isEmpty) {
            this.connectionManager.disconnect(this.connection?.joinConfig.guildId ?? '');
          }
        }, this.DISCONNECT_AFTER);
      }

      if (oldState.status === "idle" && newState.status === "playing") {
        clearTimeout(this.disconnectTimeout as NodeJS.Timeout);
      }
    });
  }

  connect(connection: VoiceConnection) {
    this.connection = connection;
    this.connection.subscribe(this._player);
    this.SONGS_FOLDER_PATH = path.join(__dirname, "..", "..", "..", SONGS_FOLDER, connection.joinConfig.guildId);

    if (!fs.existsSync(this.SONGS_FOLDER_PATH)) {
      fs.mkdirSync(this.SONGS_FOLDER_PATH);
    }
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

  skip() {
    this.next();
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
  private async preloadNextSongs(count: number) {
    const songs = this._queue.songs.slice(0, count);

    await Promise.all(songs.map((song) => this.youtube.download(this.connection?.joinConfig.guildId as string, song)));
  }
}
