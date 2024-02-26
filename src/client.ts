import { inject } from "@a-happy-team/dependo";
import { DiscordGatewayAdapterCreator } from "@discordjs/voice";
import { ActivityType, Client, GatewayIntentBits, Message } from "discord.js";
import Command from "./commands";
import { Try } from "./decorators/try";
import CommandUsageRepository from "./services/database/repositories/command-usage.repository";
import CommandRepository from "./services/database/repositories/command.repository";

type EventMap = {
  ready: Array<() => void>;
  messageCreate: Array<(message: Message) => void>;
};

type Event = keyof EventMap;

export default class HappyClient {
  @inject(CommandRepository) commandsRepository: CommandRepository;
  @inject(CommandUsageRepository) commandsUsageRepository: CommandUsageRepository;

  discordClient: Client;

  events: EventMap = {
    ready: [],
    messageCreate: [],
  };

  constructor() {
    this.discordClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
      ],
      presence: {
        activities: [
          {
            name: "Happy Music! 🎶",
            type: ActivityType.Playing,
          },
        ],
      },
    });
  }

  on<T extends Event>(event: T, callback: EventMap[T][number]) {
    this.events[event].push(callback as never);
  }

  addCommand(command: Command) {
    this.on("messageCreate", async (message) => {
      const prefix = message.content.trim().split(" ")[0];

      if (prefix === command.name) {
        const isValid = await command.validate(message);

        if (isValid) {
          command.execute(message);
          this.recordCommandUsage(command, message);
        }

        return;
      }
    });
  }

  login() {
    this.discordClient.on("ready", () => {
      this.events.ready.forEach((callback) => callback());

      console.log("Bot is ready");
    });

    this.discordClient.on("messageCreate", (message) => {
      this.events.messageCreate.forEach((callback) => callback(message));
    });

    this.discordClient.login(process.env.BOT_TOKEN);
  }

  @Try private async recordCommandUsage(command: Command, message: Message) {
    const dbCommand = await this.commandsRepository.findOrCreate({
      name: command.name,
    });

    if (!dbCommand) {
      throw new Error("Command not found");
    }

    await this.commandsUsageRepository
      .add({
        channelId: message.channel.id,
        guildId: message.guild?.id ?? "UNKNOWN",
        usedBy: message.author.id,
        commandId: dbCommand.id,
      })
      .then(() => {
        console.log(`${command.name} - Command usage recorded`);
      });
  }
}

export type JoinVoiceChannelParams = {
  channelId: string;
  guildId: string;
  adapterCreator: DiscordGatewayAdapterCreator;
};
