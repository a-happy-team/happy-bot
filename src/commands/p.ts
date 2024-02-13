import crypto from "crypto";
import { Message } from "discord.js";
import Command from ".";
import HappyClient from "../client";
import Player from "../modules/music/player";
import Queue from "../modules/music/queue";
import SpotifyClient from "../modules/music/spotify";
import YoutubeSource, { SearchResult } from "../modules/music/youtube";

export default class P extends Command {
  prefix = "!p";
  description = "Play a song or add it to the queue.";

  constructor(
    public readonly client: HappyClient,
    private readonly youtube: YoutubeSource,
    private readonly queue: Queue,
    private readonly player: Player,
    private readonly spotify: SpotifyClient,
  ) {
    super();
  }

  async execute(message: Message) {
    if (!message.member) return;

    const voiceChannel = message.member.voice.channel;
    const isInDifferentChannel = this.client.connection?.joinConfig.channelId !== voiceChannel?.id;

    if (!voiceChannel) {
      return message.reply("Please join a voice channel to add a song to the queue.");
    }

    if (this.client.connection && isInDifferentChannel) {
      return message.reply("You need to be in the same voice channel as the bot to add a song to the queue.");
    }

    // !p gossip maneskin
    // ['!p ', 'gossip maneskin']
    const [, search] = message.content.split("!p ");

    const connection = this.client.joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    this.player.connect(connection);

    let youtubeSearch: SearchResult | null = null;

    if (this.spotify.isPlaylistUrl(search)) {
      const tracks = await this.spotify.getTracks(search);

      if (!tracks.length) {
        return message.reply("No playlist found.");
      }

      youtubeSearch = (await Promise.all(tracks.map((track) => this.youtube.search({ search: track.title }))))
        .flat()
        .filter(Boolean) as SearchResult;
    } else {
      youtubeSearch = await this.youtube.search({ search: search });
    }

    if (!youtubeSearch?.length) {
      return message.reply("No songs found with that name.");
    }

    const songs = youtubeSearch.map((song) => ({
      title: song.title,
      url: song.url,
      requestedBy: message.author.id,
      fileName: crypto.randomUUID(),
    }));

    await this.youtube.download(songs[0]);

    this.queue.add(songs);

    this.player.play();
  }
}
