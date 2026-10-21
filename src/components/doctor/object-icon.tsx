import {
  Building2, Calendar, FileSignature, Handshake, Megaphone, Receipt, SquareCheck, Table2, Target, TrendingUp, Users, UsersRound,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  users: Users,
  "building-2": Building2,
  target: Target,
  handshake: Handshake,
  "check-square": SquareCheck,
  receipt: Receipt,
  "trending-up": TrendingUp,
  "file-signature": FileSignature,
  megaphone: Megaphone,
  "users-round": UsersRound,
  calendar: Calendar,
};

export function ObjectIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && ICONS[name]) || Table2;
  return <Icon className={className} aria-hidden="true" />;
}
