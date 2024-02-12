type Song = {
  title: string;
  url: string;
  requestedBy: string;
  file: string | null;
}
export default class Queue {
  songs: Song[] = [];
  currentSong: Song | null = null;

  add(song: Song) {
    this.songs.push(song);
  }

  next() {
    return this.songs.shift() ?? null
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
}