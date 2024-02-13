import { DiscordGatewayAdapterCreator, VoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { Client, GatewayIntentBits, Interaction, Message } from "discord.js";
import Command from "./commands";

type EventMap = {
  ready: Array<() => void>;
  messageCreate: Array<(message: Message) => void>;
};

type Event = keyof EventMap;

export default class HappyClient {
  client: Client;

  events: EventMap = {
    ready: [],
    messageCreate: [],
  };

  connection: VoiceConnection | null = null;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

  on<T extends Event>(event: T, callback: EventMap[T][number]) {
    this.events[event].push(callback as never);
  }

  addCommand(command: Command) {
    this.on("messageCreate", (message) => {
      const prefix = message.content.split(" ")[0];

      if (prefix === command.prefix) {
        command.execute(message);
      }
    });
  }

  joinVoiceChannel(params: JoinVoiceChannelParams) {
    if (this.connection) {
      // TODO: Message the user that the bot is already in a voice channel

      return this.connection;
    }

    this.connection = joinVoiceChannel(params);

    return this.connection;
  }

  login() {
    this.client.on("ready", () => {
      this.events.ready.forEach((callback) => callback());

      console.log("Bot is ready");
    });

    this.client.on("messageCreate", (message) => {
      this.events.messageCreate.forEach((callback) => callback(message));
    });

    this.client.login(process.env.BOT_TOKEN);
  }
}

export type JoinVoiceChannelParams = {
  channelId: string;
  guildId: string;
  adapterCreator: DiscordGatewayAdapterCreator;
};
