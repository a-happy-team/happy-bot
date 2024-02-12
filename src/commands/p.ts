import crypto from "crypto";
import Command from ".";
import HappyClient from "../client";
import Player from "../modules/music/player";
import Queue from "../modules/music/queue";
import YoutubeModule from "../modules/music/youtube";
import { Message } from "discord.js";

export default class P extends Command {
  prefix = '!p';
  description = 'Add a song to the queue and play it. Usage: !p <song name>';

  constructor(
    public readonly client: HappyClient,
    private readonly youtube: YoutubeModule,
    private readonly queue: Queue,
    private readonly player: Player
    ) {
    super(client);
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
  
    const youtubeSearch = await this.youtube.search(songName);
    
    const song = {
      title: youtubeSearch.title ?? 'Unknown',
      url: youtubeSearch.url,
      requestedBy: message.author.id,
      fileName: crypto.randomUUID()
    }
  
    await this.youtube.download(song);
  
    this.queue.add(song);

    this.player.play();
  }
}