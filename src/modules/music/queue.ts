export type Song = {
  title: string;
  url: string;
  requestedBy: string;
  fileName: string;
  duration: string;
  thumbnail: string;

  /**
   * The votes to skip the song.
   * @value The user ID of the voter.
   */
  skipVotes: Set<string>;
};

export default class Queue {
  songs: Song[] = [];
  currentSong: Song | null = null;
  MAX_PRINTING_LENGTH = 20;

  add(songs: Song[]) {
    if (!this.currentSong) {
      this.currentSong = songs.shift() ?? null;
    }

    this.songs.push(...songs);
  }

  remove(fileName: string) {
    this.songs = this.songs.filter((song) => song.fileName !== fileName);
  }

  next() {
    this.currentSong = this.songs.shift() ?? null;
  }

  clear() {
    this.songs = [];
  }

  get length() {
    return this.songs.length;
  }

  get isEmpty() {
    return this.songs.length === 0;
  }

  get skipVotes() {
    return this.currentSong?.skipVotes.size ?? 0;
  }

  shuffle() {
    if (this.songs.length === 0) return;

    let currentIndex = this.songs.length;
    let temporaryValue: Song;
    let randomIndex: number;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = this.songs[currentIndex];
      this.songs[currentIndex] = this.songs[randomIndex];
      this.songs[randomIndex] = temporaryValue;
    }
  }

  alreadyVoted(userId: string) {
    return this.currentSong?.skipVotes.has(userId) ?? false;
  }

  skip(userId: string) {
    const song = this.currentSong;

    if (!song) return;

    song.skipVotes.add(userId);
  }

  toDiscordMessage() {
    let queueMessage = `**Now Playing:**\n${this.currentSong?.title} - Requested by <@${this.currentSong?.requestedBy}>\n\n**Queue:**\n`;

    if (this.length === 0) {
      queueMessage += "The queue is empty.";

      return queueMessage;
    }

    if (this.length > this.MAX_PRINTING_LENGTH) {
      queueMessage += `_Showing the first ${this.MAX_PRINTING_LENGTH} songs of ${this.length}_\n`;
    }

    queueMessage += this.songs
      .slice(0, this.MAX_PRINTING_LENGTH)
      .map((song, index) => {
        return `${index + 1}. ${song.title} - Requested by <@${song.requestedBy}>`;
      })
      .join("\n");

    return queueMessage;
  }
}
