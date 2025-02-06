import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavButtonProps {
  icon: LucideIcon
  label: string
  active: boolean
  onClick: () => void
}

export const NavButton = ({
  icon: Icon,
  label,
  active,
  onClick,
}: NavButtonProps) => (
  <Button
    variant={active ? "default" : "ghost"}
    size="icon"
    onClick={onClick}
    className="w-12 h-12 mb-4"
    title={label}
  >
    <Icon className="h-6 w-6" />
  </Button>
)
