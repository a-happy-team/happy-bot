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
import Cron from "./services/cron";
import SpotifyClient from "./services/spotify";
import YoutubeSource from "./services/youtube";

const main = async () => {
  try {
    const client = new HappyClient();
    const spotify = new SpotifyClient(
      process.env.SPOTIFY_CLIENT_ID as string,
      process.env.SPOTIFY_CLIENT_SECRET as string,
    );
    const youtube = new YoutubeSource(spotify);
    const cronJobs = new Cron();

    const connectionManager = ConnectionManager.getInstance(youtube, spotify);

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
