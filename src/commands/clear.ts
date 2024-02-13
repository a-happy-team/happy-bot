import { Message } from "discord.js";
import Command from ".";
import ConnectionManager from "../connection-manager";

export default class Clear extends Command {
  prefix = "!clear";
  description = "Clear the queue.";

  constructor(private readonly connectionManager: ConnectionManager) {
    super();
  }

  async execute(message: Message) {
    if (!message.member) return;

    const notInChannel = !message.member.voice.channel;
    const isInDifferentChannel = !this.connectionManager.isInSameChannel(message);
    const connection = this.connectionManager.getConnection(message);

    if (notInChannel || isInDifferentChannel || !connection) {
      return message.reply("You need to be in the same voice channel as the bot to clear the queue!");
    }

    connection.player.clearQueue();

    message.reply("The queue has been cleared.");
  }
}
