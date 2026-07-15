import { describe, expect, it } from "vitest";
import { GOLDEN_VENDORS, runFirmScenario } from "./harness.js";

describe("golden Firm evals", () => {
  it("rejects transferred-identity and sybil vendors during diligence", async () => {
    const result = await runFirmScenario({
      task: "Prepare a treasury diligence memo",
      budgetCap: { token: "USDT", amount: "1500000", decimals: 6 },
      vendors: [GOLDEN_VENDORS[1]!, GOLDEN_VENDORS[2]!],
    });

    expect(result.status).toBe("no_qualified_vendor");
    expect(result.hires).toEqual([]);
    expect(result.memo).toContain("No vendor cleared diligence");
  });

  it("halts on budget breach before procurement goes through", async () => {
    const result = await runFirmScenario(
      {
        task: "Prepare a treasury diligence memo",
        budgetCap: { token: "USDT", amount: "250000", decimals: 6 },
        vendors: [GOLDEN_VENDORS[0]!],
      },
      {
        outboundMockCost: { token: "USDT", amount: "500000", decimals: 6 },
      },
    );

    expect(result.status).toBe("halted");
    expect(result.halt_reason).toBe("BUDGET_EXCEEDED");
    expect(result.receipts).toEqual([]);
  });

  it("assembles a provenance-complete result for a qualified vendor", async () => {
    const result = await runFirmScenario(
      {
        task: "Prepare a treasury diligence memo",
        budgetCap: { token: "USDT", amount: "500000", decimals: 6 },
        vendors: [GOLDEN_VENDORS[0]!],
      },
      {
        outboundMockCost: { token: "USDT", amount: "250000", decimals: 6 },
      },
    );

    expect(result.status).toBe("completed");
    expect(result.plan).toEqual(["plan", "source", "diligence", "procure", "qa", "assemble"]);
    expect(result.hires).toHaveLength(1);
    expect(result.hires[0]?.kya_summary.score).toBe(85);
    expect(result.receipts).toHaveLength(1);
    expect(result.receipts[0]?.tool).toBe("deliver_memo");
    expect(result.treasury_statement).toContain("| kind | time | tx | token |");
    expect(result.memo).toContain("Assembled memo");
  });
});
