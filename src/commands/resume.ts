import { Message } from "discord.js";
import Command from ".";
import HappyClient from "../client";
import Player from "../modules/music/player";

export default class Resume extends Command {
  prefix = '!resume';
  description = 'Resume the current song if it\'s paused.';

  constructor(
    public readonly client: HappyClient,
    private readonly player: Player
    ) {
    super();
  }

  async execute (message: Message) {
    if (!message.member) return

    const voiceChannel = message.member.voice.channel;
    const isInDifferentChannel = this.client.connection?.joinConfig.channelId !== voiceChannel?.id;

    if (isInDifferentChannel) {
      return message.reply(
        "You need to be in the same voice channel as me to resume the song.");
    }

    this.player.resume();
  }
}