import { Message } from "discord.js";
import Command from ".";
import ConnectionManager from "../connection-manager";

export default class Queue extends Command {
  prefix = "!queue";
  description = "Show the current queue.";

  constructor(private readonly connectionManager: ConnectionManager) {
    super();
  }

  async execute(message: Message) {
    if (!message.member) return;

    const connection = this.connectionManager.getConnection(message);

    if (!connection) {
      return message.reply("I'm not in a voice channel.");
    }

    if (!connection.player.currentSong) {
      return message.reply("The queue is empty.");
    }

    message.reply(connection.queue.toDiscordMessage());
  }
}
