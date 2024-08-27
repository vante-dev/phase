import { ModuleId } from "@repo/config/phase/modules.ts"
import { z } from "zod"

import { safeMs } from "~/lib/utils"

export const auditLogsSchema = z.object({
  enabled: z.boolean(),
  channels: z.object({
    server: z.string().optional(),
    messages: z.string().optional(),
    voice: z.string().optional(),
    invites: z.string().optional(),
    members: z.string().optional(),
    punishments: z.string().optional(),
  }),
})

export const autoMessagesSchema = z.object({
  enabled: z.boolean(),
  messages: z.array(
    z.object({
      name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name cannot be longer than 100 characters"),
      channel: z.string().min(1, "Channel is required"),
      content: z
        .string()
        .min(1, "Content is required")
        .max(2000, "Content cannot be longer than 2000 characters"),
      mention: z.string().optional(),
      interval: z
        .string()
        .min(2, { message: "Interval is required" })
        .max(100, { message: "Interval cannot be longer than 100 characters" })
        .refine(safeMs, { message: "Invalid interval format" }),
    }),
  ),
})

export const autoRolesSchema = z.object({
  enabled: z.boolean(),
  roles: z
    .array(
      z.object({
        id: z.string().min(1, {
          message: "Role is required",
        }),
      }),
    )
    .max(10),
})

export const bumpRemindersSchema = z.object({
  enabled: z.boolean(),
  time: z
    .string()
    .min(2, { message: "Time is required" })
    .max(100, { message: "Time cannot be longer than 100 characters" })
    .refine(safeMs, { message: "Invalid time format" }),
  initialMessage: z
    .string()
    .min(1, { message: "Initial message is required" })
    .max(2000, {
      message: "Initial message cannot be longer than 2000 characters",
    }),
  reminderMessage: z
    .string()
    .min(1, { message: "Reminder message is required" })
    .max(2000, {
      message: "Reminder message cannot be longer than 2000 characters",
    }),
  mention: z.string().optional(),
})

export const countersSchema = z.object({
  enabled: z.boolean(),
  counters: z.array(
    z.object({
      name: z.string().min(1, {
        message: "You must provide a counter name",
      }),
      channel: z.string().min(1, {
        message: "You must select a channel",
      }),
      content: z
        .string()
        .min(1, {
          message: "Content must be at least 1 character",
        })
        .max(100, {
          message: "Content cannot be longer than 100 characters",
        }),
    }),
  ),
})

export const formsSchema = z.object({
  enabled: z.boolean(),
  channel: z.string().min(1, {
    message: "You must select a channel",
  }),
  forms: z
    .array(
      z.object({
        id: z.string(),
        name: z
          .string()
          .min(1, {
            message: "Name must be at least 1 character",
          })
          .max(32, {
            message: "Name cannot be longer than 32 characters",
          }),
        channel: z.string().min(1, {
          message: "You must select a channel",
        }),
        questions: z
          .array(
            z.object({
              question: z
                .string()
                .min(1, {
                  message: "Question must be at least 1 character",
                })
                .max(100, {
                  message: "Question cannot be longer than 100 characters",
                }),
            }),
          )
          .min(1)
          .max(100),
      }),
    )
    .max(10),
})

export const joinToCreatesSchema = z.object({
  enabled: z.boolean(),
  channel: z.string().min(1, {
    message: "Channel is required",
  }),
  category: z.string().min(1, {
    message: "Category is required",
  }),
  active: z.string().array(),
})

export const levelsSchema = z.object({
  enabled: z.boolean(),
  channel: z.string().min(1, {
    message: "Channel is required",
  }),
  message: z
    .string()
    .min(1, {
      message: "Message is required",
    })
    .max(2000, {
      message: "Message must be less than 2000 characters",
    }),
  background: z
    .string()
    .url()
    .max(256, {
      message: "Background must be less than 256 characters",
    })
    .refine((value) => /\.(jpeg|jpg|png)$/.exec(value), {
      message: "Background must be a valid PNG or JPEG image URL",
    })
    .optional(),
  mention: z.boolean(),
  roles: z
    .array(
      z.object({
        level: z.number().min(1).max(100).int(),
        role: z.string(),
      }),
    )
    .max(100),
})

export const reactionRolesSchema = z.object({
  enabled: z.boolean(),
  messageUrl: z
    .string()
    .url()
    .refine(
      (url) => {
        const discordChannelRegex =
          /^https:\/\/discord\.com\/channels\/\d+\/\d+\/\d+$/
        return discordChannelRegex.test(url)
      },
      {
        message: "URL does not match the Discord message URL pattern",
      },
    ),
  reactions: z
    .array(
      z.object({
        emoji: z.string().emoji().min(1, {
          message: "Emoji is required",
        }),
        role: z.string().min(1, {
          message: "Role is required",
        }),
      }),
    )
    .max(20),
})

export const ticketsSchema = z.object({
  enabled: z.boolean(),
  channel: z.string().min(1, {
    message: "Channel is required",
  }),
  message: z.string().min(1, {
    message: "Message is required",
  }),
  max_open: z.number().int().optional(),
  tickets: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1, {
          message: "Name is required",
        }),
        message: z.string().min(1, {
          message: "Message is required",
        }),
        mention: z.string().optional(),
      }),
    )
    .max(5),
})

export const twitchNotificationsSchema = z.object({
  enabled: z.boolean(),
  streamers: z
    .array(
      z.object({
        id: z
          .string()
          .min(4, {
            message: "The streamer name must be at least 4 characters",
          })
          .max(25, {
            message: "The streamer name must be less than 25 characters",
          }),
        channel: z.string().min(1, {
          message: "You must select a channel",
        }),
        mention: z.string().optional(),
      }),
    )
    .max(5),
})

export const warningsSchema = z.object({
  enabled: z.boolean(),
  warnings: z
    .array(
      z.object({
        role: z.string().min(1, {
          message: "Role is required",
        }),
      }),
    )
    .max(10),
})

export const welcomeMessagesSchema = z.object({
  enabled: z.boolean(),
  channel: z.string().min(1, {
    message: "Channel is required",
  }),
  message: z.string(),
  mention: z.boolean(),
  card: z.object({
    enabled: z.boolean(),
    background: z.string().url().optional(),
  }),
  // .refine(
  //   (card) =>
  //     card.enabled &&
  //     card.background &&
  //     (card.background.endsWith(".png") ||
  //       card.background.endsWith(".jpg") ||
  //       card.background.endsWith(".jpeg") ||
  //       card.background.endsWith(".webp")),
  //   {
  //     message: "Background image must be either png, jpg, or webp",
  //     path: ["background"]
  //   },
  // ),
})

export const modulesSchema = z.object({
  [ModuleId.AuditLogs]: auditLogsSchema.optional(),
  [ModuleId.AutoMessages]: autoMessagesSchema.optional(),
  [ModuleId.AutoRoles]: autoRolesSchema.optional(),
  [ModuleId.BumpReminders]: bumpRemindersSchema.optional(),
  [ModuleId.Counters]: countersSchema.optional(),
  [ModuleId.Forms]: formsSchema.optional(),
  [ModuleId.JoinToCreates]: joinToCreatesSchema.optional(),
  [ModuleId.Levels]: levelsSchema.optional(),
  [ModuleId.ReactionRoles]: reactionRolesSchema.optional(),
  [ModuleId.Tickets]: ticketsSchema.optional(),
  [ModuleId.TwitchNotifications]: twitchNotificationsSchema.optional(),
  [ModuleId.Warnings]: warningsSchema.optional(),
  [ModuleId.WelcomeMessages]: welcomeMessagesSchema.optional(),
})
