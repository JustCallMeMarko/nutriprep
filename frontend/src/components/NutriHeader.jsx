import { RoleNavigation } from "@/components/RoleShell"

export default function NutriHeader({
  type = "client", // "client" | "admin"
}) {
  return <RoleNavigation role={type === "admin" ? "admin" : "client"} />
}
