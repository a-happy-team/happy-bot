import { EmbedBuilder, Message } from "discord.js";

type Field = {
  name: string;
  value: string;
  inline: boolean;
};

type Author = {
  name: string;
  url: string;
};

interface MessageOptions {
  thumbnail?: string;
  author?: Author;
  description?: string;
  fields: Field[] | undefined;
}

export function sendMessage(message: Message, options: MessageOptions) {
  const embed = new EmbedBuilder()
    .setDescription(options.description ?? null)
    .setAuthor(options.author ?? null)
    .addFields(options.fields ?? [])
    .setImage(options.thumbnail ?? null)
    .setColor("DarkRed");

  return message.channel.send({ embeds: [embed] });
}
