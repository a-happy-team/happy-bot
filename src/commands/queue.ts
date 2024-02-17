import { Message } from "discord.js";
import Command from ".";
import ConnectionManager from "../connection-manager";
import MessagesBank from "../services/message/message-embedder";

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
      return message.channel.send({
        embeds: [MessagesBank.simple("I'm not in a voice channel.")],
      });
    }

    if (!connection.player.currentSong) {
      return message.channel.send({
        embeds: [MessagesBank.simple("The queue is empty.")],
      });
    }

    message.channel.send({
      embeds: [MessagesBank.simple(connection.queue.toDiscordMessage())],
    });
  }
}
