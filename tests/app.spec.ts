import { test, expect } from "@playwright/test";
test("complete flood awareness and evacuation flow", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your local flood outlook" }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  await page
    .getByRole("button", { name: "Demo controls", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "03 Yellow alert" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Yellow alert for Tapesia",
  );
  await page.getByRole("button", { name: "Open notifications" }).click();
  await expect(page.locator(".notification-panel")).toContainText(
    "Avoid low-lying roads",
  );
  await page.getByRole("button", { name: "Close notifications" }).click();
  await page
    .getByRole("button", { name: "View safety instructions", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "During heavy rainfall" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Report Flooding", exact: true })
    .click();
  await page.getByLabel("What is happening?").selectOption("Flooded road");
  await page
    .getByLabel("Describe what you see")
    .fill("Floodwater is covering the school access road.");
  await page.getByRole("button", { name: "Submit report" }).click();
  await expect(
    page.getByRole("heading", { name: "Your community report is added." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Evacuate Safely", exact: true })
    .first()
    .click();
  await expect(page.locator(".route-steps")).toContainText(
    "Tapesia ridge road",
  );
  await expect(page.locator(".route-summary")).toContainText("3.9");
  await page.screenshot({ path: "test-results/route.png", fullPage: true });
  await page
    .getByRole("button", { name: "Demo controls", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "05 Red emergency" }).click();
  await expect(
    page.getByRole("heading", { name: "No available safe demo route" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Demo controls", exact: true })
    .last()
    .click();
  await page
    .getByRole("button", { name: "Reset all demo conditions and reports" })
    .click();
  await expect(page.locator(".route-summary")).toContainText("1.2");
  await page.getByLabel("Select your area").selectOption("baren");
  await expect(page.locator(".route-steps")).toContainText("Baren upland road");
  await page.getByRole("button", { name: "Alerts", exact: true }).click();
  await page.getByRole("button", { name: "Preferences", exact: true }).click();
  await page.getByLabel("Demo SMS", { exact: false }).check();
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(
    page.getByRole("button", { name: "Preferences saved for this session" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  expect(errors).toEqual([]);
});
test("mobile pages fit and navigation works", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
  for (const name of [
    "Local Risk Map",
    "Report Flooding",
    "Safety Guide",
    "Evacuate Safely",
    "Alerts",
    "Overview",
  ]) {
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await page
      .locator(".sidebar")
      .getByRole("button", { name, exact: true })
      .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
test("map layers, searchable locations and keyboard modal focus", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Local Risk Map", exact: true })
    .click();
  await page.getByLabel("Search locations").fill("son");
  await page.locator(".search-results button").click();
  await expect(page.getByLabel("Select your area")).toHaveValue("sonapur");
  await page.getByLabel("Risk zones", { exact: true }).uncheck();
  await expect(
    page.getByLabel("Risk zones", { exact: true }),
  ).not.toBeChecked();
  await page
    .getByRole("button", { name: "Digaru bridge: Open", exact: true })
    .click();
  await expect(page.locator(".road-detail")).toContainText(
    "Demo community report",
  );
  await page
    .getByRole("button", { name: "Demo controls", exact: true })
    .last()
    .click();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Reset all demo conditions and reports" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Close demo controls" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
