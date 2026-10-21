import { describe, it, expect } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DoctorView } from "@/components/doctor/doctor-view";

const score = () => screen.getByTestId("score-value").getAttribute("data-value");
const visible = () => screen.getByTestId("visible-count").textContent;
const findingButtons = () => within(screen.getByRole("list", { name: "Findings" })).queryAllByRole("button");

describe("/doctor", () => {
  it("renders score 40, 6/11 visible and 13 findings for acme", () => {
    render(<DoctorView />);
    expect(score()).toBe("40");
    expect(screen.getByText("Health score 40 of 100")).toBeInTheDocument();
    expect(visible()).toBe("6/11");
    expect(findingButtons()).toHaveLength(13);
  });

  it("selecting a finding shows its why and SQL", async () => {
    const user = userEvent.setup();
    render(<DoctorView />);
    await user.click(screen.getByRole("button", { name: /campaign: hidden, no pivot view/ }));
    const detail = screen.getByRole("region", { name: "Finding detail" });
    expect(within(detail).getByText(/the sidebar loader/)).toBeInTheDocument();
    expect(within(detail).getByTestId("sql-block").textContent).toContain('CREATE OR REPLACE VIEW "v_campaign"');
  });

  it("Apply fix removes the finding and raises the score", async () => {
    const user = userEvent.setup();
    render(<DoctorView />);
    await user.click(screen.getByRole("button", { name: /campaign: hidden, no pivot view/ }));
    await user.click(screen.getByRole("button", { name: "Apply fix" }));
    await waitFor(() => expect(findingButtons()).toHaveLength(12));
    expect(score()).toBe("48");
    expect(visible()).toBe("7/11");
  });

  it("Fix all safe issues -> 11/11 and score 87; Undo restores the prior state", async () => {
    const user = userEvent.setup();
    render(<DoctorView />);
    await user.click(screen.getByRole("button", { name: /Fix all safe issues/ }));
    await waitFor(() => expect(visible()).toBe("11/11"));
    expect(score()).toBe("87");
    await waitFor(() => expect(findingButtons()).toHaveLength(5));
    await user.click(screen.getByRole("button", { name: "Undo" }));
    await waitFor(() => expect(visible()).toBe("6/11"));
    expect(score()).toBe("40");
  });

  it("a review fix asks for confirmation first", async () => {
    const user = userEvent.setup();
    render(<DoctorView />);
    await user.click(screen.getByRole("button", { name: /vendor\/: folder with \.object\.yaml/ }));
    await user.click(screen.getByRole("button", { name: "Apply fix" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getAllByText(/tmp\/doctor-archive/).length).toBeGreaterThan(0);
    await user.click(within(dialog).getByRole("button", { name: "Apply anyway" }));
    await waitFor(() => expect(findingButtons()).toHaveLength(12));
  });

  it("Escape closes the confirm dialog without applying", async () => {
    const user = userEvent.setup();
    render(<DoctorView />);
    await user.click(screen.getByRole("button", { name: /vendor\/: folder with \.object\.yaml/ }));
    await user.click(screen.getByRole("button", { name: "Apply fix" }));
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(findingButtons()).toHaveLength(13);
  });

  it("severity filter narrows the list", async () => {
    const user = userEvent.setup();
    render(<DoctorView />);
    await user.click(screen.getByRole("radio", { name: /Critical/ }));
    await waitFor(() => expect(findingButtons()).toHaveLength(5));
  });

  it("switching to the clean scenario shows the empty state", async () => {
    const user = userEvent.setup();
    render(<DoctorView />);
    await user.click(screen.getByRole("radio", { name: /Clean/ }));
    expect(await screen.findByText(/All clear: every object is visible/)).toBeInTheDocument();
    expect(score()).toBe("100");
  });

  it("sidebar preview toggles to the after-fix view", async () => {
    const user = userEvent.setup();
    render(<DoctorView />);
    const preview = screen.getByRole("region", { name: "Sidebar preview" });
    expect(within(preview).getByText("6 of 11 shown")).toBeInTheDocument();
    await user.click(within(preview).getByRole("radio", { name: /After safe fixes/ }));
    expect(within(preview).getByText("11 of 11 shown")).toBeInTheDocument();
  });
});
