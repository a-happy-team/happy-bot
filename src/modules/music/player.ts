import { AudioPlayer, NoSubscriberBehavior, StreamType, VoiceConnection, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import Queue, { Song } from "./queue";
import path from "path"
import { SONGS_FOLDER } from "../../constants";
import fs from 'fs'

export default class Player {
  SONGS_FOLDER_PATH = path.join(__dirname, '..', '..', '..', SONGS_FOLDER);
  status: 'playing' | 'paused' | 'stopped' = 'stopped';
  _player: AudioPlayer;

  currentSong: Song | null = null

  connection: VoiceConnection | null = null;

  constructor(
    private readonly _queue: Queue,
  ) {
    this._player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Stop,
      }
    });

    this._player.on('stateChange', (oldState, newState) => {
      if (newState.status === 'idle') {
        this.next();
      }
    });
  }

  connect(connection: VoiceConnection) {
    this.connection = connection;
    this.connection.subscribe(this._player);
  }

  play() {
    const song = this._queue.currentSong;

    if (this.currentSong?.fileName === song?.fileName) {
      return;
    }

    if (!song || !song.fileName) {
      // TODO: Send message to channel that queue is empty

      return
    }

    const songPath = path.join(__dirname, '..', '..', '..', SONGS_FOLDER, `${song.fileName}.mp3`)

    const resource = createAudioResource(songPath, {
      inputType: StreamType.Arbitrary,
      inlineVolume: true
    })
    resource.volume?.setVolume(0.2);

    this._player.play(resource);

    this.status = 'playing';
    this.currentSong = song;
  }

  resume() {
    if (this.status !== 'paused') {
      return
    }

    this._player.unpause();
    this.status = 'playing';
  }

  pause() {
    if (this.status !== 'playing') {
      // TODO: Send message to channel that player is not playing

      return;
    }

    this._player.pause();

    this.status = 'paused';
  }

  stop() {
    if (this.status === 'stopped') {
      // TODO: Send message to channel that player is already stopped

      return;
    }

    this._player.stop();
    this._queue.clear();
    this.status = 'stopped';
    this.deleteSongFromDisk();
    this.currentSong = null
  }

  skip() {
    this.next();
  }

  next() {
    if (this._queue.isEmpty) return this.stop();

    this.deleteSongFromDisk(this.currentSong?.fileName);
    this._queue.next();
    this.play();
  }

  queue() {
    return this._queue.songs;
  }

  /**
   * Deletes the specified song from disk. If no song is specified, it will delete all songs from disk.
   */
  private deleteSongFromDisk(name?: string | null) {

    if (!name) {
      fs.readdir(path.join(this.SONGS_FOLDER_PATH), (err, files) => {
        if (err) {
          console.error(err);
          return;
        }

        files.forEach(file => {
          fs.unlinkSync(path.join(this.SONGS_FOLDER_PATH, file));
        });
      });

      return
    }

    fs.unlinkSync(path.join(this.SONGS_FOLDER_PATH, `${name}.mp3`));
  }
}