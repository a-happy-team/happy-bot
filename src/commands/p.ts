import crypto from "crypto";
import Command from ".";
import HappyClient from "../client";
import Player from "../modules/music/player";
import Queue from "../modules/music/queue";
import YoutubeModule from "../modules/music/youtube";
import { Message } from "discord.js";
import { Source } from "../modules/music/source";

export default class P extends Command {
  prefix = '!p';
  description = 'Play a song or add it to the queue.';

  constructor(
    public readonly client: HappyClient,
    private readonly musicSource: Source.Contract,
    private readonly queue: Queue,
    private readonly player: Player
    ) {
      super();
    }

  async execute(message: Message) {
    if (!message.member) return 

    const voiceChannel = message.member.voice.channel;
    const isInDifferentChannel = this.client.connection?.joinConfig.channelId !== voiceChannel?.id;

    if (!voiceChannel) {
      return message.reply(
        "Please join a voice channel to add a song to the queue."
      );
    }

    if (this.client.connection && isInDifferentChannel) {
      return message.reply(
        "You need to be in the same voice channel as the bot to add a song to the queue."
      );
    }
    
    // !p gossip maneskin
    // ['!p ', 'gossip maneskin']
    const [, songName] = message.content.split("!p ");
  
    const connection = this.client.joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
  
    this.player.connect(connection);
  
    const youtubeSearch = await this.musicSource.search({ search: songName });
    
    if (!youtubeSearch) {
      return message.reply("No songs found with that name.");
    }

    const song = {
      title: youtubeSearch.title ?? 'Unknown',
      url: youtubeSearch.url,
      requestedBy: message.author.id,
      fileName: crypto.randomUUID()
    }
  
    await this.musicSource.download(song);
  
    this.queue.add(song);

    this.player.play();
  }
}