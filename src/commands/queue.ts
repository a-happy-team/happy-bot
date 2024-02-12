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


    let queueMessage = `**Now Playing:**\n${currentSong.title} - Requested by <@${currentSong.requestedBy}>\n\n**Queue:**\n`

    if (queue.length === 0) {
      queueMessage += 'The queue is empty.'

      return message.reply(queueMessage);
    }

    for (let i = 0; i < queue.length; i++) {
      queueMessage += `${i}. ${queue[i].title} - Requested by <@${queue[i].requestedBy}>\n`
    }

    message.reply(queueMessage);
  }
}