import { ModuleId } from "@repo/config/phase/modules.ts"

import { safeMs } from "~/lib/utils"

import type { GuildModulesWithData, ModulesFormValues } from "~/types/dashboard"
import type { GuildModules } from "~/types/db"
import type { APIMessage } from "discord-api-types/v10"

export const defaultEmptyFormValues: Required<ModulesFormValues> = {
  [ModuleId.AuditLogs]: {
    enabled: false,
    channels: {
      server: "",
      members: "",
      messages: "",
      punishments: "",
      voice: "",
      invites: "",
    },
  },
  [ModuleId.AutoMessages]: {
    enabled: false,
    messages: [],
  },
  [ModuleId.AutoRoles]: {
    enabled: false,
    roles: [],
  },
  [ModuleId.BumpReminders]: {
    enabled: false,
    time: "",
    initialMessage: "",
    reminderMessage: "",
  },
  [ModuleId.Counters]: {
    enabled: false,
    counters: [],
  },
  [ModuleId.Forms]: {
    enabled: false,
    channel: "",
    forms: [],
  },
  [ModuleId.JoinToCreates]: {
    enabled: false,
    channel: "",
    category: "",
    active: [],
  },
  [ModuleId.Levels]: {
    enabled: false,
    channel: "",
    message: "",
    background: "",
    mention: false,
    roles: [],
  },
  [ModuleId.ReactionRoles]: {
    enabled: false,
    messageUrl: "",
    reactions: [],
  },
  [ModuleId.SelfRoles]: {
    enabled: false,
    messages: [],
  },
  [ModuleId.Tickets]: {
    enabled: false,
    channel: "",
    message: "",
    max_open: Infinity,
    tickets: [],
  },
  [ModuleId.TwitchNotifications]: {
    enabled: false,
    streamers: [],
  },
  [ModuleId.Warnings]: {
    enabled: false,
    warnings: [],
  },
  [ModuleId.WelcomeMessages]: {
    enabled: false,
    channel: "",
    message: "",
    mention: false,
    card: {
      enabled: false,
      background: "",
    },
  },
}

export const getDirtyFields = <
  TData extends Partial<Record<keyof TDirtyItems, unknown>>,
  TDirtyItems extends Record<string, unknown>,
>(
  formValues: TData,
  dirtyItems: TDirtyItems,
): Partial<TData> => {
  return Object.entries(dirtyItems).reduce((dirtyData, [key, value]) => {
    if (value === false || !(key in formValues)) return dirtyData
    if (value === true) return { ...dirtyData, [key]: true }

    const child = getDirtyFields(
      formValues[key] as TData,
      dirtyItems[key] as TDirtyItems,
    )

    if (typeof child === "object" && Object.keys(child).length === 0) {
      return dirtyData
    }

    if (Array.isArray(child) && child.length === 0) {
      return dirtyData
    }

    return {
      ...dirtyData,
      [key]: child,
    }
  }, {})
}

export function getDefaultValues(
  guildId: string,
  modules: Partial<GuildModules>,
): ModulesFormValues {
  const parsedValues: ModulesFormValues = {}

  const moduleParsers: {
    [K in ModuleId]?: (
      data: Required<GuildModulesWithData>[K],
    ) => ModulesFormValues[K]
  } = {
    [ModuleId.AutoMessages]: (data) => ({
      ...data,
      messages: data.messages.map((msg) => ({
        ...msg,
        interval: safeMs(msg.interval, { long: true })!,
        content: msg.message,
      })),
    }),
    [ModuleId.BumpReminders]: (data) => ({
      ...data,
      time: safeMs(data.time, { long: true })!,
    }),
    [ModuleId.ReactionRoles]: (data) => ({
      ...data,
      messageUrl: `https://discord.com/channels/${guildId}/${data.channel}/${data.message}`,
    }),
    [ModuleId.SelfRoles]: (data) => ({
      ...data,
      messages: data.messages.map((message) => ({
        ...message,
        methods: message.methods.map(({ roles, ...method }) => ({
          ...method,
          rolesToAdd: roles
            .filter((role) => role.action === "add")
            .map(({ id }) => id),
          rolesToRemove: roles
            .filter((role) => role.action === "remove")
            .map(({ id }) => id),
        })),
      })) as Required<ModulesFormValues>[ModuleId.SelfRoles]["messages"],
    }),
    [ModuleId.Tickets]: (data) => {
      const message = data._data?.message as APIMessage | undefined
      const messageContent = message?.embeds?.[0]?.description

      return {
        ...data,
        message: messageContent ?? "",
      }
    },
    [ModuleId.TwitchNotifications]: (data) => ({
      ...data,
      streamers: data.streamers.map((streamer, index) => {
        const streamerNames = data._data?.streamerNames as string[] | undefined
        const streamerName = streamerNames?.[index]

        return {
          ...streamer,
          id: streamerName ?? "unknown",
        }
      }),
    }),
    [ModuleId.Warnings]: (data) => ({
      ...data,
      warnings: data.warnings.map((role: string) => ({
        role,
      })),
    }),
  }

  for (const [moduleId, moduleData] of Object.entries(modules) as [
    ModuleId,
    GuildModulesWithData[ModuleId],
  ][]) {
    const moduleParser = moduleParsers[moduleId]

    // @ts-expect-error type safety is very tricky here
    parsedValues[moduleId] = moduleParser
      ? moduleParser(moduleData as never)
      : moduleData
  }

  return parsedValues
}
