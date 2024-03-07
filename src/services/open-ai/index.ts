import { injectable } from "@a-happy-team/dependo";
import OpenAISDK from "openai";

@injectable({ singleton: true })
export default class OpenAI {
  client: OpenAISDK;

  constructor() {
    this.client = new OpenAISDK({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async isSameSong(title: string, songInfo?: SongInfo | null) {
    if (!songInfo) {
      return false;
    }

    const chat = await this.client.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        {
          role: "user",
          content: `Are the provided music title and song info referring to the same song?
            
            ${title}
            ${songInfo ? JSON.stringify(songInfo, null, 2) : ""}
            `,
        },
      ],
    });

    return !!Number(chat.choices[0].message.content);
  }
}

type SongInfo = {
  title: string;
  artist: string;
};
