export type Song = {
  title: string;
  url: string;
  requestedBy: string;
  fileName: string | null;
}
export default class Queue {
  songs: Song[] = [];
  currentSong: Song | null = null;

  add(song: Song) {
    if (!this.currentSong) {
      this.currentSong = song;

      return
    }

    this.songs.push(song);    
  }

  next() {
    this.currentSong = this.songs.shift() ?? null
  }

  clear() {
    this.songs = [];
    this.currentSong = null;
  }

  get length() {
    return this.songs.length;
  }

  get isEmpty() {
    return this.songs.length === 0;
  }
}