import { Message } from "discord.js";
import Command from ".";
import ConnectionManager from "../connection-manager";
import MessagesBank from "../services/message/message-embedder";

export default class Skip extends Command {
  name = "!skip";
  description = "Skip the current song. If there are no songs in the queue, the bot will leave the voice channel.";

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
        embeds: [MessagesBank.error("You need to be in the same voice channel as the bot to skip the song!")],
      });
    }

    if (!connection.player.currentSong) {
      return message.channel.send({
        embeds: [MessagesBank.simple("There is no song to skip!")],
      });
    }

    if (connection.queue.alreadyVoted(message.author.id)) {
      return message.channel.send({
        embeds: [MessagesBank.simple("You have already voted to skip this song!")],
      });
    }

    /**
     * The number of members in the voice channel, excluding the bot
     */
    const membersInChannel = message.member.voice.channel.members.size - 1;

    const wasSkipped = connection.player.skip(message.author.id, membersInChannel);

    if (!wasSkipped) {
      return message.channel.send({
        embeds: [
          MessagesBank.success(
            "**Vote to skip** received! You need at least 50% of the members in the voice channel to skip the song.",
          ),
        ],
      });
    }

    return message.channel.send({
      embeds: [MessagesBank.success("The song was skipped!")],
    });
  }
}
