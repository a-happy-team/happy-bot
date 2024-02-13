import crypto from "crypto";
import { Message } from "discord.js";
import Command from ".";
import HappyClient from "../client";
import { SearchResult } from "../modules/music/youtube";
import ConnectionManager from "../connection-manager";

export default class P extends Command {
  prefix = "!p";
  description = "Play a song or add it to the queue.";

  constructor(
    public readonly client: HappyClient,
    private readonly connectionManager: ConnectionManager
  ) {
    super();
  }

  async execute(message: Message) {
    if (!message.member || !message.guild) return;

    if (!message.member.voice.channel) {
      return message.reply("Please join a voice channel to add a song to the queue.");
    }

    let connection = this.connectionManager.getConnection(message);

    if (connection && !this.connectionManager.isInSameChannel(message)) {
      return message.reply("You need to be in the same voice channel as the bot to add a song to the queue.");
    }


    if (!connection) {
      connection = this.connectionManager.joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });
    }

    const [, search] = message.content.split("!p ");

    connection.player.connect(connection?.voiceConnection);

    let youtubeSearch: SearchResult | null = null;

    if (connection.spotify.isPlaylistUrl(search)) {
      const tracks = await connection.spotify.getTracks(search);

      if (!tracks.length) {
        return message.reply("No playlist found.");
      }

      youtubeSearch = (await Promise.all(tracks.map((track) => connection?.youtube.search({ search: track.title }))))
        .flat()
        .filter(Boolean) as SearchResult;
    } else {
      youtubeSearch = await connection.youtube.search({ search: search });
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

    await connection.youtube.download(songs[0]);

    connection.queue.add(songs);

    connection.player.play();
  }
}
