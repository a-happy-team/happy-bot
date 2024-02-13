import path from "path";
import { Message } from "discord.js";
import Command from ".";
import Queue from "../modules/music/queue";

export default class Clear extends Command {
  prefix = "!clear";
  description = "Clear the queue.";

  constructor(private readonly queue: Queue) {
    super();
  }

  async execute(message: Message) {
    this.queue.clear();

    message.reply("The queue has been cleared.");
  }
}
