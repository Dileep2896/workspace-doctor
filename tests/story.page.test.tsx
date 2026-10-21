import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

const reduced = vi.hoisted(() => ({ value: false }));
vi.mock("framer-motion", async (orig) => {
  const mod = await orig<typeof import("framer-motion")>();
  return { ...mod, useReducedMotion: () => reduced.value };
});

import { StoryView } from "@/components/story/story-view";

afterEach(() => {
  reduced.value = false;
});

describe("/story", () => {
  it("renders all six sections", () => {
    render(<StoryView />);
    const names = screen.getAllByRole("region").map((r) => r.getAttribute("aria-label"));
    expect(names).toEqual(["The domain", "Pain point", "Why it breaks", "The decision", "The feature", "Impact"]);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Agent-built CRMs hand the whole workspace to an AI agent/);
    expect(screen.getByText(/The agent wrote the rows/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open the Doctor/ })).toHaveAttribute("href", "/doctor");
  });

  it("reduced motion shows the final impact values immediately", () => {
    reduced.value = true;
    render(<StoryView />);
    expect(screen.getByTestId("impact-score").textContent).toBe("100");
    expect(screen.getByTestId("impact-visible").textContent).toBe("11/11");
    expect(screen.getByTestId("impact-findings").textContent).toBe("0");
    expect(screen.getByTestId("pain-counter").textContent).toBe("6");
  });

  it("impact numbers come from the live engine, not constants", () => {
    reduced.value = true;
    render(<StoryView />);
    expect(screen.getByTestId("impact-from").textContent).toMatch(/40.*6\/11.*13/);
  });
});
