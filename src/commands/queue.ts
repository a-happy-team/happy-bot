import { Message } from "discord.js";
import QueueModule from "../modules/music/queue";
import Command from ".";
import Player from "../modules/music/player";

export default class Queue extends Command {
  prefix = '!queue';
  description = 'Show the current queue.';

  constructor(
    private readonly player: Player,
    private readonly queue: QueueModule
  ) {
    super();
  }

  async execute(message: Message) {
    if (!message.member) return

    const queue = this.queue.songs;
    const currentSong = this.player.currentSong;

    if (!currentSong) {
      return message.reply('The queue is empty.');
    }




    message.reply(this.queue.toDiscordMessage());
  }
}