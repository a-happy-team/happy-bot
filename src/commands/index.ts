import { Message } from "discord.js";
import HappyClient from "../client";

export default abstract class Command {
  abstract prefix: string;
  abstract description?: string;

  public abstract execute(message: Message): void;
}