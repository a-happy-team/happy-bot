import { AudioPlayer, NoSubscriberBehavior, StreamType, VoiceConnection, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import HappyClient from "../../client";
import Queue from "./queue";
import path from "path"
import { SONGS_FOLDER } from "../../constants";

export default class Player {
  status: 'playing' | 'paused' | 'stopped' = 'stopped';
  _player: AudioPlayer;

  constructor(
    private readonly _queue: Queue,
    private readonly connection: VoiceConnection
  ) {
    this._player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Stop,
      }
    });

    this._player.on('stateChange', (oldState, newState) => {
      if (newState.status === 'idle') {
        this.connection.destroy();
      }
    });
  }

  play() {
    const song = this._queue.next();

    if (!song || !song.file) {
      // TODO: Send message to channel that queue is empty
      this.skip();

      return
    }
    const songPath = path.join(__dirname, SONGS_FOLDER, song.file)
    const resource = createAudioResource(songPath, {
      inputType: StreamType.Arbitrary,
      inlineVolume: true
    })
    resource.volume?.setVolume(0.2);

    this._player.play(resource);
    this.connection.subscribe(this._player);

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
  }

  skip() {
    this.play();
  }

  queue() {
    return this._queue.songs;
  }
}