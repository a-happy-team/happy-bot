import { ColorResolvable, EmbedBuilder } from "discord.js";
import { Song } from "../../modules/music/queue";

type Field = {
  name: string;
  value: string;
  inline: boolean;
};

type Author = {
  name: string;
  url: string;
};

interface MessageInfo {
  thumbnail?: string;
  author?: Author;
  description?: string;
  fields?: Field[];
  color?: string;
}

export default class MessagesBank {
  static _defaultColor: ColorResolvable = "DarkButNotBlack";
  static _errorColor = "Red";
  static _successColor = "Green";

  static simple(params: string) {
    return MessagesBank.custom({ description: params });
  }

  static error(params: string) {
    return MessagesBank.custom({ description: params, color: MessagesBank._errorColor });
  }

  static success(params: string) {
    return MessagesBank.custom({ description: params, color: MessagesBank._successColor });
  }

  static newSongAdded(params: Song) {
    return MessagesBank.custom({
      thumbnail: params.thumbnail,
      author: {
        name: params.title,
        url: params.url,
      },
      fields: [
        {
          name: "Duration",
          value: params.duration,
          inline: true,
        },
        {
          name: "Requested by",
          value: `<@${params.requestedBy}>`,
          inline: true,
        },
      ],
    });
  }

  static custom(params: MessageInfo) {
    return new EmbedBuilder()
      .setDescription(params.description ?? null)
      .setAuthor(params.author ?? null)
      .addFields(params.fields ?? [])
      .setImage(params.thumbnail ?? null)
      .setColor(MessagesBank._defaultColor);
  }
}
