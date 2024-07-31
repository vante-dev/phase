"use client"

import * as changeCase from "change-case"
import { toast } from "sonner"

import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "~/components/credenza"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Switch } from "~/components/ui/switch"

import { useDashboardContext } from "~/hooks/use-dashboard-context"
import { useMediaQuery } from "~/hooks/use-media-query"

import { modulesConfig } from "~/config/modules"

import { updateModule } from "~/app/dashboard/_actions/updateModule"
import { AuditLogs } from "~/app/dashboard/modules/_forms/audit-logs"
import { AutoMessages } from "~/app/dashboard/modules/_forms/auto-messages"
import { AutoRoles } from "~/app/dashboard/modules/_forms/auto-roles"
import { BumpReminders } from "~/app/dashboard/modules/_forms/bump-reminders"
import { Forms } from "~/app/dashboard/modules/_forms/forms"
import { JoinToCreates } from "~/app/dashboard/modules/_forms/join-to-creates"
import { Levels } from "~/app/dashboard/modules/_forms/levels"
import { ReactionRoles } from "~/app/dashboard/modules/_forms/reaction-roles"
import { Tickets } from "~/app/dashboard/modules/_forms/tickets"
import { TwitchNotifications } from "~/app/dashboard/modules/_forms/twitch-notifications"
import { Warnings } from "~/app/dashboard/modules/_forms/warnings"
import { WelcomeMessages } from "~/app/dashboard/modules/_forms/welcome-messages"

import type { GuildModules } from "~/lib/db"

const moduleForms = {
  AuditLogs,
  AutoMessages,
  AutoRoles,
  BumpReminders,
  Forms,
  JoinToCreates,
  Levels,
  ReactionRoles,
  Tickets,
  TwitchNotifications,
  Warnings,
  WelcomeMessages,
} as const

export { moduleForms }

export default function ModulesPage() {
  const dashboard = useDashboardContext()

  const isOneColumn = useMediaQuery("(max-width: 1024px)")
  const isTwoColumn = useMediaQuery("(max-width: 1280px)")
  const columnCount = isOneColumn ? 1 : isTwoColumn ? 2 : 3

  return (
    <div className="grid gap-2 [--column_count:1] lg:grid-cols-2 lg:gap-4 lg:[--column_count:2] xl:grid-cols-3 xl:[--column_count:3]">
      {modulesConfig.map((moduleConfig, index) => {
        const { name, description } = moduleConfig

        const dashboardModuleKey = changeCase.pascalCase(
          name,
        ) as keyof typeof moduleForms

        const dashboardModuleData =
          dashboard.guild.modules?.[dashboardModuleKey]

        const DashboardModuleForm: () => JSX.Element | undefined =
          moduleForms[dashboardModuleKey]

        if (!DashboardModuleForm) return null

        return (
          <Card
            key={name}
            className="animate-in slide-in-from-top-2 fade-in fill-mode-backwards flex flex-col duration-700"
            style={{
              animationDelay: `calc(150ms * ${Math.floor(index / columnCount)})`,
            }}
          >
            <CardHeader className="flex-row justify-between space-y-0">
              <CardTitle>{name}</CardTitle>
              <ModuleSwitch
                moduleKey={dashboardModuleKey}
                moduleData={dashboardModuleData}
              />
            </CardHeader>
            <CardContent>
              <CardDescription>{description}</CardDescription>
            </CardContent>
            <CardFooter className="h-full">
              <Credenza>
                <CredenzaContent className="max-h-[90%] overflow-auto lg:max-h-[70%]">
                  <CredenzaHeader>
                    <CredenzaTitle>{name}</CredenzaTitle>
                    <CredenzaDescription>{description}</CredenzaDescription>
                  </CredenzaHeader>
                  <CredenzaBody>
                    <DashboardModuleForm />
                  </CredenzaBody>
                </CredenzaContent>
                <CredenzaTrigger asChild>
                  <Button variant="secondary" className="mt-auto w-full">
                    {dashboardModuleData ? "Edit module" : "Setup module"}
                  </Button>
                </CredenzaTrigger>
              </Credenza>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

const ModuleSwitch = <T extends keyof GuildModules>({
  moduleKey,
  moduleData,
}: {
  moduleKey: T
  moduleData: GuildModules[T] | undefined
}) => {
  const dashboard = useDashboardContext()

  const onCheckedChange = async (checked: boolean) => {
    try {
      const updatedModuleData = await updateModule(moduleKey, {
        enabled: checked,
      } as GuildModules[T])

      dashboard.setData((dashboardData) => {
        if (!dashboardData.guild.modules) dashboardData.guild.modules = {}
        dashboardData.guild.modules[moduleKey] = updatedModuleData
        return dashboardData
      })
    } catch {
      const enabledStatus = checked ? "enabled" : "disabled"
      toast.error(`Failed to ${enabledStatus} module`)
    }
  }

  return (
    <Switch
      defaultChecked={moduleData?.enabled ?? false}
      onCheckedChange={moduleData ? onCheckedChange : undefined}
      disabled={!moduleData}
      title={!moduleData ? "Module not configured" : undefined}
    />
  )
}
