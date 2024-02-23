import crypto from "crypto";
import { Message } from "discord.js";
import Command from ".";
import ConnectionManager from "../connection-manager";
import { Song } from "../modules/music/queue";
import { SearchResult } from "../modules/music/youtube";
import MessagesBank from "../services/message/message-embedder";

export default class P extends Command {
  prefix = "!p";
  description = "Plays music, accepts playlist URLs and song names, separated by commas.";
  detailedDescription = `Accepts two formats:
    1. **Song name/artist:** Search and play a specific song.
       (e.g., \`!p Adele - Skyfall\`)
    
    2. **Playlist URL:** Add all songs from a Youtube or Spotify playlist to the queue.
       (e.g., \`!p https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M\`)

    If no song is currently playing, the bot will start playing the first song from the playlist or search result.`;

  constructor(private readonly connectionManager: ConnectionManager) {
    super();
  }

  async execute(message: Message) {
    if (!message.member || !message.guild) return;

    if (!message.member.voice.channel) {
      return message.channel.send({
        embeds: [MessagesBank.error("Please join a voice channel to add a song to the queue.")],
      });
    }

    let connection = this.connectionManager.getConnection(message);

    if (connection && !this.connectionManager.isInSameChannel(message)) {
      return message.channel.send({
        embeds: [MessagesBank.error("You need to be in the same voice channel as the bot to add a song to the queue.")],
      });
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

    const isPlaylist = connection.spotify.isPlaylistUrl(search);

    if (isPlaylist) {
      const tracks = await connection.spotify.getTracks(search);

      if (!tracks.length) {
        return message.channel.send({
          embeds: [MessagesBank.error("No playlist found.")],
        });
      }

      youtubeSearch = (await Promise.all(tracks.map((track) => connection?.youtube.search({ search: track.title }))))
        .flat()
        .filter(Boolean) as SearchResult;
    } else {
      youtubeSearch = await connection.youtube.search({ search: search });
    }

    if (!youtubeSearch?.length) {
      return message.channel.send({
        embeds: [MessagesBank.error(isPlaylist ? "No songs found in the playlist." : "No songs found.")],
      });
    }

    const songs: Song[] = youtubeSearch.map((song) => ({
      title: song.title,
      url: song.url,
      duration: song.duration,
      thumbnail: song.thumbnail,
      requestedBy: message.author.id,
      fileName: crypto.randomUUID(),
      skipVotes: new Set(),
    }));

    const song = songs[0];

    const downloaded = await connection.youtube.download(message.guildId as string, song);

    if (!downloaded) {
      return message.channel.send({
        embeds: [
          MessagesBank.error(isPlaylist ? "No songs found in the playlist." : "This song is not available, sorry."),
        ],
      });
    }

    connection.queue.add(songs);

    connection.player.play();

    return message.channel.send({
      embeds: [MessagesBank.newSongAdded(song)],
    });
  }

  public validate(message: Message<boolean>): boolean {
    const search = message.content.replace(/(!p )|(!p)/, "");

    if (search.length === 0) {
      message.channel.send({
        embeds: [MessagesBank.simple("Please, provide a song name or a playlist URL.")],
      });
      return false;
    }

    return true;
  }
}
