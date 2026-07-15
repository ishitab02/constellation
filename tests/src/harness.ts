import { MockPaymentAdapter, type Money } from "@constellation/payment-adapter";
import {
  KyaMockService,
  TreasuryMockService,
  walletWithHistory,
  type AgentRef,
  type KyaReport,
} from "@constellation/mocks";
import type { Statement } from "@constellation/indexer";

const DILIGENCE_POLICY = {
  min_score: 60,
  hard_block_flags: ["IDENTITY_TRANSFERRED_RECENTLY"] as const,
  hard_block_above: { token: "USDT", amount: "1000000", decimals: 6 },
};

export interface VendorRecord {
  readonly agent_ref: AgentRef;
  readonly name: string;
  readonly tool: string;
  readonly endpoint: string;
  readonly pricing_hint: string;
  readonly source: "marketplace" | "curated";
}

export interface ScenarioInput {
  readonly task: string;
  readonly budgetCap: Money;
  readonly vendors: readonly VendorRecord[];
}

export interface ScenarioResult {
  readonly status: "completed" | "halted" | "no_qualified_vendor";
  readonly plan: readonly string[];
  readonly hires: readonly {
    readonly vendor: VendorRecord;
    readonly kya_summary: { readonly score: number; readonly flags: readonly string[] };
  }[];
  readonly receipts: readonly {
    readonly id: string;
    readonly endpoint: string;
    readonly tool: string;
    readonly cost: Money;
    readonly status: "paid";
  }[];
  readonly treasury_statement: string;
  readonly memo: string;
  readonly halt_reason?: string;
}

function expectStatement(value: Statement | { readonly error: { readonly message: string } }): Statement {
  if ("error" in value) {
    throw new Error(value.error.message);
  }
  return value;
}

function lteMoney(left: Money, right: Money): boolean {
  return left.token === right.token && left.decimals === right.decimals && BigInt(left.amount) <= BigInt(right.amount);
}

function shouldReject(report: KyaReport, budgetCap: Money): string | null {
  if (report.score < DILIGENCE_POLICY.min_score) {
    return `score ${report.score} below minimum ${DILIGENCE_POLICY.min_score}`;
  }
  if (
    report.flags.some((flag: string) =>
      DILIGENCE_POLICY.hard_block_flags.includes(flag as "IDENTITY_TRANSFERRED_RECENTLY"),
    ) &&
    !lteMoney(budgetCap, DILIGENCE_POLICY.hard_block_above)
  ) {
    return "hard block: IDENTITY_TRANSFERRED_RECENTLY";
  }
  return null;
}

export async function runFirmScenario(
  input: ScenarioInput,
  options: { outboundMockCost?: Money } = {},
): Promise<ScenarioResult> {
  const kya = new KyaMockService("mixed");
  const treasury = new TreasuryMockService();
  const payments = new MockPaymentAdapter({
    prices: {},
    outboundMockCost: options.outboundMockCost,
    now: () => Date.parse("2026-07-15T12:00:00.000Z"),
  });

  const plan = [
    "plan",
    "source",
    "diligence",
    "procure",
    "qa",
    "assemble",
  ];

  const hires: Array<ScenarioResult["hires"][number]> = [];
  const receipts: Array<ScenarioResult["receipts"][number]> = [];

  for (const vendor of input.vendors) {
    const report = await kya.check_agent({ agent_ref: vendor.agent_ref });
    const rejection = shouldReject(report, input.budgetCap);
    if (rejection !== null) {
      continue;
    }

    const paid = await payments.payAndCall<{ result: string }>(
      vendor.endpoint,
      vendor.tool,
      { task: input.task, vendor: vendor.name },
      input.budgetCap,
    );
    if (!paid.ok) {
      const statement = expectStatement(await treasury.export_statement({
        wallet_id: walletWithHistory.wallet_id,
        period: { from: "2026-06-15T00:00:00.000Z", to: "2026-07-15T23:59:59.999Z" },
        format: "md",
      }));
      return {
        status: "halted",
        plan,
        hires,
        receipts,
        treasury_statement: statement.content,
        memo: "Budget halt before procurement completed.",
        halt_reason: paid.error.code,
      };
    }

    hires.push({
      vendor,
      kya_summary: { score: report.score, flags: report.flags },
    });
    receipts.push(paid.receipt);
  }

  if (hires.length === 0) {
    const statement = expectStatement(await treasury.export_statement({
      wallet_id: walletWithHistory.wallet_id,
      period: { from: "2026-06-15T00:00:00.000Z", to: "2026-07-15T23:59:59.999Z" },
      format: "md",
    }));
    return {
      status: "no_qualified_vendor",
      plan,
      hires,
      receipts,
      treasury_statement: statement.content,
      memo: "No vendor cleared diligence.",
    };
  }

  const statement = expectStatement(await treasury.export_statement({
    wallet_id: walletWithHistory.wallet_id,
    period: { from: "2026-06-15T00:00:00.000Z", to: "2026-07-15T23:59:59.999Z" },
    format: "md",
  }));
  return {
    status: "completed",
    plan,
    hires,
    receipts,
    treasury_statement: statement.content,
    memo: `Assembled memo for "${input.task}" with ${hires.length} qualified vendor(s).`,
  };
}

export const GOLDEN_VENDORS: readonly VendorRecord[] = [
  {
    agent_ref: {
      kind: "erc8004",
      chain: "eip155:8453",
      registry: "0x0000000000000000000000000000000000001f44",
      agent_id: 42,
    },
    name: "Good Vendor",
    tool: "deliver_memo",
    endpoint: "mock://vendor/good",
    pricing_hint: "0.25 USDT",
    source: "marketplace",
  },
  {
    agent_ref: {
      kind: "erc8004",
      chain: "eip155:8453",
      registry: "0x0000000000000000000000000000000000001f44",
      agent_id: 43,
    },
    name: "Transferred Identity Vendor",
    tool: "deliver_memo",
    endpoint: "mock://vendor/transferred",
    pricing_hint: "0.25 USDT",
    source: "marketplace",
  },
  {
    agent_ref: {
      kind: "erc8004",
      chain: "eip155:1",
      registry: "0x0000000000000000000000000000000000001f44",
      agent_id: 44,
    },
    name: "Sybil Burst Vendor",
    tool: "deliver_memo",
    endpoint: "mock://vendor/sybil",
    pricing_hint: "0.25 USDT",
    source: "marketplace",
  },
];
