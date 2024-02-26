import { inject } from "@a-happy-team/dependo";
import { CronJob } from "cron";
import { Try } from "../../decorators/try";
import SongPlayRepository from "../database/repositories/song-play.repository";
import SongRepository from "../database/repositories/song.repository";

const CRON_SCHEDULES = {
  EVERY_15_MINUTES: "*/15 * * * *",
  EVERY_10_SECONDS: "*/10 * * * * *",
} as const;

export default class Cron {
  @inject(SongRepository) songRepository: SongRepository;
  @inject(SongPlayRepository) songPlayRepository: SongPlayRepository;

  initialize() {
    this.schedule(CRON_SCHEDULES.EVERY_15_MINUTES, "Process Song Plays", this.processSongPlays.bind(this));
  }

  private schedule(time: string, name: string, callback: () => Promise<void>) {
    console.info(`[${new Date().toISOString()}] CRON - ${name} - Scheduled`);
    new CronJob(time, async () => {
      try {
        console.info(`[${new Date().toISOString()}] CRON - ${name} - Started`);
        await callback();
      } catch (error) {
        console.error(`[${new Date().toISOString()}] CRON - ${name} - Error: ${error}`);
      } finally {
        console.info(`[${new Date().toISOString()}] CRON - ${name} - Finished`);
      }
    }).start();
  }

  @Try private async processSongPlays() {
    const total = await this.songPlayRepository.countUnprocessed();

    if (total === 0) {
      return;
    }

    // Process in chunks of 30 songs at a time.
    const CHUNK_SIZE = 30;

    for (let offset = 0; offset < total; offset += CHUNK_SIZE) {
      const songPlays = await this.songPlayRepository.getUnprocessed({
        limit: CHUNK_SIZE,
        offset,
      });

      for (const songPlay of songPlays) {
        await this.songRepository.updatePlayedCount({
          songId: songPlay.songId,
          count: Number(songPlay.count),
        });

        await this.songPlayRepository.markAsProcessed(songPlay.songId);

        // Sleep for a bit to avoid rate limiting.
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
}
