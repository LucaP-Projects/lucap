import { test, expect } from "@playwright/test";

test.describe("Company Formation Wizard", () => {
  test.use({ storageState: ".auth/admin.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/create-company");
    await page.waitForLoadState("domcontentloaded");
    // Wait for the wizard heading to confirm the page loaded
    await expect(page.locator("h2").first()).toContainText("Choose your company type", { timeout: 30000 });
  });

  test("full wizard flow creates a company", async ({ page }) => {
    const ts = Date.now();

    // === STEP 1: Company Type ===
    const sarlCard = page.locator("button[type='button']").filter({ hasText: "SARL" }).first();
    await sarlCard.click();
    await expect(sarlCard.locator("svg.lucide-check")).toBeVisible();

    await page.locator("button[type='button']").filter({ hasText: "Continue" }).click();
    await page.waitForTimeout(300);
    await expect(page.locator("h2").first()).toContainText("Company details & tax regime");

    // === STEP 2: Company Details & Tax ===
    const companyName = `E2E Test SARL ${ts}`;
    await page.locator("#wiz-name").fill(companyName);
    await page.locator("#wiz-taxId").fill("1234567X/A/M/000");
    await page.locator("#wiz-email").fill("e2e@test.tn");
    await page.locator("#wiz-phone").fill("+216 99 999 999");
    await page.locator("#wiz-website").fill("https://e2e-test.tn");
    await page.locator("#wiz-addr1").fill("1 Rue de Test");
    await page.locator("#wiz-city").fill("Tunis");
    await page.locator("#wiz-state").fill("Tunis");
    await page.locator("#wiz-zip").fill("1000");
    await page.locator("#wiz-country").fill("Tunisia");

    await page.locator("button[type='button']").filter({ hasText: "Continue" }).click();
    await page.waitForTimeout(300);
    await expect(page.locator("h2").first()).toContainText("Capital structure");

    // === STEP 3: Capital Structure ===
    const capitalInput = page.locator("#wiz-capital");
    await capitalInput.clear();
    await capitalInput.fill("50000");

    const sharesInput = page.locator("#wiz-shares");
    await sharesInput.clear();
    await sharesInput.fill("500");

    await page.locator("input[placeholder='Shareholder name']").first().fill("Founder One");
    await page.locator("input[placeholder='1']").first().fill("500");
    await page.locator("input[placeholder='e.g. Gérant']").first().fill("Gérant");

    await page.locator("button[type='button']").filter({ hasText: "Continue" }).click();
    await page.waitForTimeout(300);
    await expect(page.locator("h2").first()).toContainText("Review your company");

    // === STEP 4: Review ===
    await expect(page.locator(`text=${companyName}`)).toBeVisible();
    await expect(page.locator("text=1234567X/A/M/000")).toBeVisible();
    await expect(page.locator("text=e2e@test.tn")).toBeVisible();
    await expect(page.locator("text=50,000 TND")).toBeVisible();
    await expect(page.locator("text=Founder One")).toBeVisible();
    await expect(page.locator("text=500 shares")).toBeVisible();

    await page.locator("button[type='button']").filter({ hasText: "Submit Formation Request" }).click();

    // Wait for the success view
    await expect(page.locator("h2")).toContainText("Formation request submitted", { timeout: 15000 });
    await expect(page.locator("text=Your company formation request has been sent")).toBeVisible();
  });

  test("validates required fields on each step", async ({ page }) => {
    const continueBtn = page.locator("button[type='button']").filter({ hasText: "Continue" });

    // Step 1: Try to continue without selecting a type — should stay on step 1
    await continueBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator("h2").first()).toContainText("Choose your company type");

    // Select SARL and continue
    await page.locator("button[type='button']").filter({ hasText: "SARL" }).first().click();
    await continueBtn.click();
    await page.waitForTimeout(300);
    await expect(page.locator("h2").first()).toContainText("Company details & tax regime");

    // Step 2: Clear name and try to continue — should stay on step 2
    await page.locator("#wiz-name").fill("");
    await continueBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator("h2").first()).toContainText("Company details & tax regime");

    // Fill name and continue
    await page.locator("#wiz-name").fill("Validation Test SARL");
    await continueBtn.click();
    await page.waitForTimeout(300);
    await expect(page.locator("h2").first()).toContainText("Capital structure");

    // Step 3: Default values + fill shareholder name to pass validation
    await page.locator("input[placeholder='Shareholder name']").first().fill("Founder");
    await continueBtn.click();
    await page.waitForTimeout(300);
    await expect(page.locator("h2").first()).toContainText("Review your company");
  });

  test("shows entity info cards with correct data", async ({ page }) => {
    // Verify all 4 entity cards are displayed
    await expect(page.locator("button[type='button']").filter({ hasText: "SARL" }).first()).toBeVisible();
    await expect(page.locator("button[type='button']").filter({ hasText: "SUARL" }).first()).toBeVisible();
    await expect(page.locator("button[type='button']").filter({ hasText: "SA" }).first()).toBeVisible();
    await expect(page.locator("button[type='button']").filter({ hasText: "SCA" }).first()).toBeVisible();

    // Verify descriptions
    await expect(page.locator("text=Société à Responsabilité Limitée").first()).toBeVisible();
    await expect(page.locator("text=Société Unipersonnelle à Responsabilité Limitée").first()).toBeVisible();
    await expect(page.locator("text=Société Anonyme").first()).toBeVisible();
    await expect(page.locator("text=Société en Commandite par Actions").first()).toBeVisible();
  });
});
