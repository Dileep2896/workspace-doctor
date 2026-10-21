import type { Metadata } from "next";
import { StoryView } from "@/components/story/story-view";

export const metadata: Metadata = { title: "Story", description: "Why agent-built CRMs need a Workspace Doctor." };

export default function StoryPage() {
  return <StoryView />;
}
