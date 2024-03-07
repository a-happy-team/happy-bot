import { Message } from "discord.js";
import Command from ".";
import ConnectionManager from "../connection-manager";
import { Try } from "../decorators/try";
import MessagesBank from "../services/message/message-embedder";

export default class Shuffle extends Command {
  name = "!shuffle";
  description = "Shuffles the queue.";

  constructor(private readonly connectionManager: ConnectionManager) {
    super();
  }

  @Try async execute(message: Message) {
    const connection = this.connectionManager.getConnection(message);

    if (!connection) {
      return;
    }

    if (!this.connectionManager.isInSameChannel(message)) {
      return message.reply({
        embeds: [MessagesBank.error("You're not even here, why are you trying to shuffle the queue!?")],
      });
    }

    connection.player.shuffle();

    return message.channel.send({
      embeds: [MessagesBank.success("Queue shuffled.")],
    });
  }
}
