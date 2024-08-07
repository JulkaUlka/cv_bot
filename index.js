import OpenAI from "openai";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config();

//OpenAi
const info = process.env.INFO;
const error = "Ask the answer to this question directly from Yulia😉";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main(question) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a personal, friendly assistant who knows everything about Yuliia Hlushko. You talk to HR about Yuliia. Your goal is to help Yuliia pass her interview by providing answers based only on the information provided below. It is important to respond in a way that pleases her and to use the language of the user's question. If there is no information available to answer a specific question, please write "${error}" in the language of the user's question or give your funny answer.

        Info about Yuliia:${info};`,
      },
      { role: "user", content: `my question:${question}` },
    ],
    model: "gpt-4o-mini-2024-07-18",
  });

  return completion.choices[0].message.content;
}

//Bot
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  bot.sendChatAction(chatId, "typing");

  let answer;

  try {
    answer = await main(messageText);
  } catch (error) {
    console.error("Error:", error);
    answer = "Sorry, something went wrong. Try again later 😩";
  }

  if (messageText === "/start") {
    bot.sendMessage(
      chatId,
      "Hello, I am Yuliia's personal assistant. I can guide you through her CV. Please write your question 🙂"
    );
  } else {
    bot.sendMessage(chatId, answer);
    sendToSecondBot(messageText, answer);
  }
});

//Monitor chat
const token2 = process.env.BOT2_TOKEN;
const bot2 = new TelegramBot(token2, { polling: true });

async function sendToSecondBot(messageText, answer) {
  const secondBotChatId = process.env.SECOND_BOT_CHAT_ID;

  try {
    await bot2.sendMessage(
      secondBotChatId,
      `User: ${messageText}\nBot: ${answer}`
    );
  } catch (error) {
    console.error("Error:", error);
  }
}
