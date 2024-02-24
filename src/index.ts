import HappyClient from "./client";
import Command from "./commands";
import Clear from "./commands/clear";
import Commands from "./commands/commands";
import Help from "./commands/help";
import P from "./commands/p";
import Pause from "./commands/pause";
import QueueCommand from "./commands/queue";
import Resume from "./commands/resume";
import Skip from "./commands/skip";
import Stop from "./commands/stop";
import ConnectionManager from "./connection-manager";
import SpotifyClient from "./modules/music/spotify";
import YoutubeSource from "./modules/music/youtube";
import Cron from "./services/cron";
import { db } from "./services/database/connection";
import CommandUsageRepository from "./services/database/repositories/command-usage.repository";
import CommandRepository from "./services/database/repositories/command.repository";
import SongPlayRepository from "./services/database/repositories/song-play.repository";
import SongRepository from "./services/database/repositories/song.repository";

const main = async () => {
  try {
    const commandsRepo = new CommandRepository(db);
    const commandsUsageRepo = new CommandUsageRepository(db);

    const client = new HappyClient(commandsRepo, commandsUsageRepo);
    const spotify = new SpotifyClient(
      process.env.SPOTIFY_CLIENT_ID as string,
      process.env.SPOTIFY_CLIENT_SECRET as string,
    );
    const songRepository = new SongRepository(db);
    const songPlayRepository = new SongPlayRepository(db);
    const youtube = new YoutubeSource(songRepository, spotify);
    const cronJobs = new Cron(songRepository, songPlayRepository);

    const connectionManager = ConnectionManager.getInstance(youtube, spotify, db);

    const commands: Command[] = [
      new P(connectionManager),
      new Pause(connectionManager),
      new Resume(connectionManager),
      new Skip(connectionManager),
      new QueueCommand(connectionManager),
      new Help(),
      new Clear(connectionManager),
      new Stop(connectionManager),
      new Commands(),
    ];

    commands.sort((a, b) => a.name.localeCompare(b.name));

    commands.forEach((command) => client.addCommand(command));

    cronJobs.initialize();
    client.login();
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

main();
