import { Message } from "discord.js";
import Command from ".";
import ConnectionManager from "../connection-manager";
import MessagesBank from "../services/message/message-embedder";

export default class Clear extends Command {
  name = "!clear";
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
      return message.channel.send({
        embeds: [MessagesBank.error("You need to be in the same voice channel as the bot to clear the queue!")],
      });
    }

    connection.player.clearQueue();

    message.channel.send({
      embeds: [MessagesBank.simple("The queue has been cleared.")],
    });
  }
}
