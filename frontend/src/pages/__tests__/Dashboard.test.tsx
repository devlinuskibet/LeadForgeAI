import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Dashboard from "../Dashboard";

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            pipeline_value: 12500,
            drafts_ready: 3,
            emails_sent: 15,
            emails_opened: 5,
            top_priorities: [],
          }),
      })
    );
  });

  it("renders dashboard greeting and stat card headings", async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Good morning, Linus/i)).toBeDefined();
    expect(screen.getByText(/Pipeline Value/i)).toBeDefined();
    expect(screen.getByText(/Drafts Ready/i)).toBeDefined();
  });
});
