import { Options, Partials } from "discord.js"
import { PhaseClient } from "phasebot"
import { BotPluginBuilder } from "phasebot/builders"

import { Emojis } from "~/lib/emojis"

import { Music } from "~/structures/music/Music"
import { StoreManager } from "~/structures/stores/StoreManager"
import { VoiceManager } from "~/structures/voice/VoiceManager"

declare module "discord.js" {
  interface Client {
    music: Music
    stores: StoreManager
    voices: VoiceManager
  }
}

const isDev = process.env.NODE_ENV === "development"

const phaseClient = new PhaseClient({
  config: {
    intents: [
      "Guilds",
      "GuildMembers",
      "GuildMessages",
      "GuildMessageReactions",
      "GuildModeration",
      "GuildInvites",
      "GuildVoiceStates",
    ],
    partials: [
      Partials.Channel,
      Partials.GuildMember,
      Partials.Message,
      Partials.Reaction,
      Partials.User,
    ],
    sweepers: {
      ...Options.DefaultSweeperSettings,
      messages: {
        interval: 60 * 60, // run every hour
        lifetime: 60 * 30, // only keep messages for 30 minutes
      },
    },
    makeCache: Options.cacheWithLimits({
      ...Options.DefaultMakeCacheSettings,
      ReactionManager: {
        maxSize: 0,
        keepOverLimit: (reaction) => {
          const reactionsToKeep = [Emojis.GiveawayReaction]
          return !!(
            reaction.me &&
            reaction.emoji.name &&
            reactionsToKeep.includes(reaction.emoji.name)
          )
        },
      },
    }),
  },
  dev: isDev,
  exports: {
    commands: "default",
    crons: "default",
    events: "default",
    middleware: "default",
    prestart: "default",
  },
  plugins: [
    new BotPluginBuilder()
      .setName("VoiceManager")
      .setVersion("1.0.0")
      .setOnLoad((client) => {
        client.voices = new VoiceManager(client)
        return client
      }),
    new BotPluginBuilder()
      .setName("Music")
      .setVersion("1.0.0")
      .setOnLoad((client) => {
        client.music = new Music(client)
        return client
      }),
    new BotPluginBuilder()
      .setName("StoreManager")
      .setVersion("1.0.0")
      .setOnLoad((client) => {
        client.stores = new StoreManager(client)
        return client
      }),
  ],
})

await phaseClient.start()
