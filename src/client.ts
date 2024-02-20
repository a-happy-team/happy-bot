import { DiscordGatewayAdapterCreator } from "@discordjs/voice";
import { ActivityType, Client, GatewayIntentBits, Message } from "discord.js";
import Command from "./commands";

type EventMap = {
  ready: Array<() => void>;
  messageCreate: Array<(message: Message) => void>;
};

type Event = keyof EventMap;

export default class HappyClient {
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

      if (prefix === command.prefix) {
        const isValid = await command.validate(message);

        if (isValid) {
          command.execute(message);
          // TODO: track command usage
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
}

export type JoinVoiceChannelParams = {
  channelId: string;
  guildId: string;
  adapterCreator: DiscordGatewayAdapterCreator;
};
