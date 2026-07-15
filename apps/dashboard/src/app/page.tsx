"use client";

import { useState, useEffect, useRef } from "react";
import {
  walletWithHistory,
  walletTransfers,
  walletGas,
  walletLabels,
  mockAgentReports,
  firmScenarios,
  KyaReport,
} from "./data";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"treasury" | "kya" | "firm">("treasury");

  // --- DEMO 1: TREASURY BOOKKEEPER STATE ---
  const [treasuryStep, setTreasuryStep] = useState<"initial" | "challenge" | "signed" | "active">("initial");
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [nonce, setNonce] = useState("");
  const [signature, setSignature] = useState("");
  const [treasuryActiveReport, setTreasuryActiveReport] = useState<"runway" | "revenue" | "expense" | "statement">("runway");
  const [receipts, setReceipts] = useState<Array<{ id: string; tool: string; price: string; status: "due" | "paid"; tx: string }>>([
    { id: "rcpt_01", tool: "register_wallet", price: "Free", status: "paid", tx: "N/A" },
    { id: "rcpt_02", tool: "get_runway", price: "Free", status: "paid", tx: "N/A" },
    { id: "rcpt_03", tool: "get_revenue_report", price: "0.10 USDT", status: "due", tx: "0xpay_rev_196" },
    { id: "rcpt_04", tool: "get_expense_report", price: "0.10 USDT", status: "due", tx: "0xpay_exp_196" },
    { id: "rcpt_05", tool: "export_statement", price: "0.20 USDT", status: "due", tx: "0xpay_stmt_196" },
  ]);

  const handleRequestChallenge = () => {
    const randomNonce = Math.floor(100000 + Math.random() * 900000).toString();
    setNonce(randomNonce);
    setTreasuryStep("challenge");
  };

  const handleSignChallenge = () => {
    // Simulate signing
    setSignature("0x" + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
    setTreasuryStep("signed");
  };

  const handleRegister = () => {
    setSelectedWalletId(walletWithHistory.wallet_id);
    setTreasuryStep("active");
  };

  const payAndFetch = (tool: string) => {
    setReceipts(prev =>
      prev.map(r => r.tool === tool ? { ...r, status: "paid" } : r)
    );
  };

  // --- DEMO 2: KYA AGENT TRUST STATE ---
  const [activeAgent, setActiveAgent] = useState<"agent_good" | "agent_transferred_identity" | "agent_sybil_burst">("agent_good");
  const [showZkDetails, setShowZkDetails] = useState(false);
  const agentReport = mockAgentReports[activeAgent] as KyaReport;

  // --- DEMO 3: THE FIRM RUN TIMELINE STATE ---
  const [activeScenarioId, setActiveScenarioId] = useState("happy_path");
  const scenario = firmScenarios.find(s => s.id === activeScenarioId) || firmScenarios[0];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playState, setPlayState] = useState<"idle" | "playing" | "paused">("idle");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentStepIndex(0);
    setPlayState("idle");
    if (timerRef.current) clearInterval(timerRef.current);
  }, [activeScenarioId]);

  useEffect(() => {
    if (playState === "playing") {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= scenario.steps.length - 1) {
            setPlayState("paused");
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playState, scenario]);

  const stepNext = () => {
    if (currentStepIndex < scenario.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const stepBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const resetTimeline = () => {
    setCurrentStepIndex(0);
    setPlayState("idle");
  };

  // Helper formatting functions
  const formatUSDT = (amountStr: string) => {
    const val = parseInt(amountStr) / 1000000;
    return val.toFixed(2) + " USDT";
  };

  const formatOKB = (amountStr: string) => {
    const val = parseInt(amountStr) / 1e18;
    return val.toFixed(4) + " OKB";
  };

  const truncateAddr = (addr: string) => {
    if (!addr) return "";
    return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4);
  };

  return (
    <>
      <div className="gridBackground"></div>
      <div className="appContainer">
        
        {/* Header section */}
        <header className="header">
          <div className="logoArea">
            <div className="logoText">CONSTELLATION</div>
            <div className="badge">
              <span className="pulseDot"></span>
              DEMO HARNESS
            </div>
          </div>
          
          <nav className="tabsContainer">
            <button 
              className={`tabButton ${activeTab === "treasury" ? "tabActive" : ""}`}
              onClick={() => setActiveTab("treasury")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Treasury Copilot
            </button>
            <button 
              className={`tabButton ${activeTab === "kya" ? "tabActive" : ""}`}
              onClick={() => setActiveTab("kya")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              KYA Trust Score
            </button>
            <button 
              className={`tabButton ${activeTab === "firm" ? "tabActive" : ""}`}
              onClick={() => setActiveTab("firm")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              The Firm Orchestrator
            </button>
          </nav>
        </header>

        {/* Tab 1: Treasury Copilot */}
        {activeTab === "treasury" && (
          <div className="dashboardGrid">
            
            {/* Main Interactive Screen */}
            <div className="card">
              <div className="cardHeader">
                <div>
                  <h2 className="cardTitle">
                    <span className="textPurple">●</span>
                    Treasury Bookkeeper Interface
                  </h2>
                  <p className="cardSubtitle">Stateless MCP Challenge &amp; Bookkeeping Visualizer</p>
                </div>
              </div>

              {treasuryStep === "initial" && (
                <div style={{ padding: "2rem 0", textAlign: "center" }}>
                  <h3 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Authentication Required (EIP-191)</h3>
                  <p className="textMuted" style={{ maxWidth: "450px", margin: "0 auto 1.5rem" }}>
                    To access private financial ledgers, the agent must register the wallet via cryptographic signature.
                  </p>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "1rem", borderRadius: "0.5rem", width: "100%", maxWidth: "450px", margin: "0 auto 1.5rem", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                    Wallet Address: <span className="textBlue">{walletWithHistory.address}</span>
                  </div>
                  <button className="btn btnPrimary" style={{ margin: "0 auto" }} onClick={handleRequestChallenge}>
                    Request Challenge Nonce
                  </button>
                </div>
              )}

              {treasuryStep === "challenge" && (
                <div style={{ padding: "2.5rem 0" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "550px", margin: "0 auto" }}>
                    <h3 style={{ fontSize: "1.1rem" }}>Challenge Nonce Issued</h3>
                    <div className="terminal">
                      <div className="terminalHeader">
                        <span>Challenge Payload</span>
                      </div>
                      <span className="textMuted">challenge_nonce: </span>
                      <span className="textGreen">{nonce}</span>
                      <br />
                      <span className="textMuted">message: </span>
                      <span>{"Prove ownership of Constellation wallet: " + walletWithHistory.address + " (nonce: " + nonce + ")"}</span>
                    </div>
                    <button className="btn btnPrimary" onClick={handleSignChallenge}>
                      Sign Message (EIP-191)
                    </button>
                  </div>
                </div>
              )}

              {treasuryStep === "signed" && (
                <div style={{ padding: "2.5rem 0" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "550px", margin: "0 auto" }}>
                    <h3 style={{ fontSize: "1.1rem" }}>Signed Response Ready</h3>
                    <div className="terminal">
                      <div className="terminalHeader">
                        <span>register_wallet payload</span>
                      </div>
                      <span className="textMuted">{"{"}</span>
                      <br />
                      <span>  &quot;address&quot;: &quot;</span><span className="textBlue">{walletWithHistory.address}</span><span>&quot;,</span>
                      <br />
                      <span>  &quot;nonce&quot;: &quot;</span><span className="textGreen">{nonce}</span><span>&quot;,</span>
                      <br />
                      <span>  &quot;signature&quot;: &quot;</span><span className="textPurple">{truncateAddr(signature)}</span><span>&quot;</span>
                      <br />
                      <span className="textMuted">{"}"}</span>
                    </div>
                    <button className="btn btnPrimary" onClick={handleRegister}>
                      Submit wallet registration (verify_sig)
                    </button>
                  </div>
                </div>
              )}

              {treasuryStep === "active" && (
                <div>
                  <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                    <button 
                      className={`btn ${treasuryActiveReport === "runway" ? "btnActive" : "btnSecondary"}`}
                      onClick={() => setTreasuryActiveReport("runway")}
                    >
                      Runway Metrics (Free)
                    </button>
                    <button 
                      className={`btn ${treasuryActiveReport === "revenue" ? "btnActive" : "btnSecondary"}`}
                      onClick={() => setTreasuryActiveReport("revenue")}
                    >
                      Revenue Report (0.10 USDT)
                    </button>
                    <button 
                      className={`btn ${treasuryActiveReport === "expense" ? "btnActive" : "btnSecondary"}`}
                      onClick={() => setTreasuryActiveReport("expense")}
                    >
                      Expense Report (0.10 USDT)
                    </button>
                    <button 
                      className={`btn ${treasuryActiveReport === "statement" ? "btnActive" : "btnSecondary"}`}
                      onClick={() => setTreasuryActiveReport("statement")}
                    >
                      Statement Export (0.20 USDT)
                    </button>
                  </div>

                  {treasuryActiveReport === "runway" && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 style={{ fontSize: "1.1rem" }}>Wallet Runway Estimate</h3>
                        <span style={{ fontSize: "0.75rem" }} className="textMuted">As of: 2026-07-15T12:00:00Z</span>
                      </div>
                      
                      <div className="statGrid">
                        <div className="statItem">
                          <div className="statValue textGreen">{formatOKB(walletWithHistory.okb_balance.amount)}</div>
                          <div className="statLabel">Native OKB Balance</div>
                        </div>
                        <div className="statItem">
                          <div className="statValue textPurple">{formatOKB(walletWithHistory.avg_daily_gas_7d.amount)}</div>
                          <div className="statLabel">Avg Daily Gas (7d)</div>
                        </div>
                      </div>

                      <div className="statItem" style={{ marginTop: "1rem", background: "rgba(139, 92, 246, 0.05)", borderColor: "rgba(139, 92, 246, 0.2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span className="statLabel" style={{ fontSize: "0.85rem" }}>Estimated Runway</span>
                          <span className="statValue textPurple" style={{ fontSize: "1.75rem" }}>{walletWithHistory.runway_days} Days</span>
                        </div>
                        <div className="componentBarContainer" style={{ height: "8px", background: "rgba(255,255,255,0.05)" }}>
                          <div className="componentBar bgPurple" style={{ width: "65%" }}></div>
                        </div>
                        <p style={{ fontSize: "0.75rem", marginTop: "0.5rem" }} className="textMuted">
                          Runway calculation matches viem chain queries. Runway = OKB Balance / Avg Daily Gas.
                        </p>
                      </div>
                    </div>
                  )}

                  {treasuryActiveReport === "revenue" && (
                    <div>
                      {receipts.find(r => r.tool === "get_revenue_report")?.status === "due" ? (
                        <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "0.5rem" }}>
                          <h4 style={{ marginBottom: "0.5rem" }}>USDT Revenue Report Locked</h4>
                          <p className="textMuted" style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>This report is a paid A2MCP endpoint. Cost: 0.10 USDT.</p>
                          <button className="btn btnPrimary" style={{ margin: "0 auto" }} onClick={() => payAndFetch("get_revenue_report")}>
                            Authorize &amp; Pay 0.10 USDT (X Layer x402)
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <h3 style={{ fontSize: "1.1rem" }}>Inflow Summary (USDT)</h3>
                            <span className="textGreen" style={{ fontWeight: 700 }}>Total: 18.40 USDT</span>
                          </div>
                          
                          <div className="tableContainer">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Counterparty</th>
                                  <th>Transactions</th>
                                  <th>Total USDT</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="mono">{truncateAddr("0x00000000000000000000000000000000000003e9")} <span className="textMuted">({walletLabels["0x00000000000000000000000000000000000003e9"]})</span></td>
                                  <td>2 txs</td>
                                  <td className="textGreen" style={{ fontWeight: 600 }}>+6.10</td>
                                </tr>
                                <tr>
                                  <td className="mono">{truncateAddr("0x00000000000000000000000000000000000003ea")} <span className="textMuted">({walletLabels["0x00000000000000000000000000000000000003ea"]})</span></td>
                                  <td>2 txs</td>
                                  <td className="textGreen" style={{ fontWeight: 600 }}>+4.30</td>
                                </tr>
                                <tr>
                                  <td className="mono">{truncateAddr("0x00000000000000000000000000000000000003eb")} <span className="textMuted">({walletLabels["0x00000000000000000000000000000000000003eb"]})</span></td>
                                  <td>1 tx</td>
                                  <td className="textGreen" style={{ fontWeight: 600 }}>+2.50</td>
                                </tr>
                                <tr>
                                  <td className="mono">{truncateAddr("0x00000000000000000000000000000000000003ec")} <span className="textMuted">({walletLabels["0x00000000000000000000000000000000000003ec"]})</span></td>
                                  <td>1 tx</td>
                                  <td className="textGreen" style={{ fontWeight: 600 }}>+2.00</td>
                                </tr>
                                <tr>
                                  <td className="mono">{truncateAddr("0x00000000000000000000000000000000000003ed")} <span className="textMuted">({walletLabels["0x00000000000000000000000000000000000003ed"]})</span></td>
                                  <td>1 tx</td>
                                  <td className="textGreen" style={{ fontWeight: 600 }}>+1.80</td>
                                </tr>
                                <tr>
                                  <td className="mono">{truncateAddr("0x00000000000000000000000000000000000003ee")} <span className="textMuted">({walletLabels["0x00000000000000000000000000000000000003ee"]})</span></td>
                                  <td>1 tx</td>
                                  <td className="textGreen" style={{ fontWeight: 600 }}>+1.70</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {treasuryActiveReport === "expense" && (
                    <div>
                      {receipts.find(r => r.tool === "get_expense_report")?.status === "due" ? (
                        <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "0.5rem" }}>
                          <h4 style={{ marginBottom: "0.5rem" }}>USDT Expense &amp; Gas Report Locked</h4>
                          <p className="textMuted" style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>This report is a paid A2MCP endpoint. Cost: 0.10 USDT.</p>
                          <button className="btn btnPrimary" style={{ margin: "0 auto" }} onClick={() => payAndFetch("get_expense_report")}>
                            Authorize &amp; Pay 0.10 USDT (X Layer x402)
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <h3 style={{ fontSize: "1.1rem" }}>Outflow Summary (USDT &amp; OKB Gas)</h3>
                            <span className="textRed" style={{ fontWeight: 700 }}>Total Outflow: 5.10 USDT</span>
                          </div>

                          <div className="statGrid" style={{ marginBottom: "1rem" }}>
                            <div className="statItem">
                              <div className="statValue textRed">-5.10 USDT</div>
                              <div className="statLabel">Total Token Transfers (3 txs)</div>
                            </div>
                            <div className="statItem">
                              <div className="statValue textOrange">0.2170 OKB</div>
                              <div className="statLabel">Gas Spent (7 txs)</div>
                            </div>
                          </div>
                          
                          <div className="tableContainer">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Counterparty</th>
                                  <th>Transactions</th>
                                  <th>Total USDT</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="mono">{truncateAddr("0x000000000000000000000000000000000000044d")} <span className="textMuted">({walletLabels["0x000000000000000000000000000000000000044d"]})</span></td>
                                  <td>1 tx</td>
                                  <td className="textRed" style={{ fontWeight: 600 }}>-2.20</td>
                                </tr>
                                <tr>
                                  <td className="mono">{truncateAddr("0x000000000000000000000000000000000000044e")} <span className="textMuted">({walletLabels["0x000000000000000000000000000000000000044e"]})</span></td>
                                  <td>1 tx</td>
                                  <td className="textRed" style={{ fontWeight: 600 }}>-1.50</td>
                                </tr>
                                <tr>
                                  <td className="mono">{truncateAddr("0x000000000000000000000000000000000000044f")} <span className="textMuted">({walletLabels["0x000000000000000000000000000000000000044f"]})</span></td>
                                  <td>1 tx</td>
                                  <td className="textRed" style={{ fontWeight: 600 }}>-1.40</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {treasuryActiveReport === "statement" && (
                    <div>
                      {receipts.find(r => r.tool === "export_statement")?.status === "due" ? (
                        <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "0.5rem" }}>
                          <h4 style={{ marginBottom: "0.5rem" }}>Full Bookkeeping Statement Locked</h4>
                          <p className="textMuted" style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>Requires payment to download raw CSV transaction records. Cost: 0.20 USDT.</p>
                          <button className="btn btnPrimary" style={{ margin: "0 auto" }} onClick={() => payAndFetch("export_statement")}>
                            Authorize &amp; Pay 0.20 USDT (X Layer x402)
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h3 style={{ fontSize: "1.1rem" }}>Raw Statement (CSV Ledger Export)</h3>
                            <button className="btn btnSecondary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }} onClick={() => alert("Statement data copied to clipboard!")}>
                              Copy Raw CSV
                            </button>
                          </div>
                          
                          <div className="tableContainer">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Tx Hash</th>
                                  <th>Date</th>
                                  <th>Direction</th>
                                  <th>From/To (Label)</th>
                                  <th>Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {walletTransfers.map((tx) => (
                                  <tr key={tx.txHash}>
                                    <td className="mono textPurple">{tx.txHash}</td>
                                    <td style={{ fontSize: "0.8rem" }}>{tx.blockTime.substring(0, 10)}</td>
                                    <td>
                                      <span className={`flagBadge ${tx.direction === "in" ? "textGreen" : "textRed"}`} style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
                                        {tx.direction === "in" ? "INFLOW" : "OUTFLOW"}
                                      </span>
                                    </td>
                                    <td className="mono">
                                      {truncateAddr(tx.direction === "in" ? tx.from : tx.to)}{" "}
                                      <span className="textMuted">({tx.label})</span>
                                    </td>
                                    <td style={{ fontWeight: 600 }} className={tx.direction === "in" ? "textGreen" : "textRed"}>
                                      {tx.direction === "in" ? "+" : "-"}{(parseInt(tx.amount) / 1e6).toFixed(2)} USDT
                                    </td>
                                  </tr>
                                ))}
                                {walletGas.map((gasTx) => (
                                  <tr key={gasTx.txHash}>
                                    <td className="mono textPurple">{gasTx.txHash}</td>
                                    <td style={{ fontSize: "0.8rem" }}>{gasTx.blockTime.substring(0, 10)}</td>
                                    <td>
                                      <span className="flagBadge textOrange" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
                                        GAS SPEND
                                      </span>
                                    </td>
                                    <td className="textMuted">OKX X Layer fee</td>
                                    <td style={{ fontWeight: 600 }} className="textOrange">
                                      -{(parseInt(gasTx.gasCost) / 1e18).toFixed(4)} OKB
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Side panel for Payment Logs & Receipts */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <h3 className="cardTitle">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "0.25rem" }}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  Payment Audit Trail
                </h3>
                <p className="cardSubtitle">Track paid x402 A2MCP calls in current workspace session</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {receipts.map((rcpt) => (
                  <div key={rcpt.id} className={`receiptCard ${rcpt.status === "paid" ? "receiptCardPaid" : ""}`}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="mono" style={{ fontWeight: 700, fontSize: "0.85rem" }}>{rcpt.tool}</span>
                      <span className={`flagBadge ${rcpt.status === "paid" ? "flagGreen" : "flagOrange"}`} style={{ color: rcpt.status === "paid" ? "var(--color-green)" : "var(--color-orange)" }}>
                        {rcpt.status === "paid" ? "SETTLED" : "UNPAID (x402)"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }} className="textMuted">
                      <span>Endpoint Rate: {rcpt.price}</span>
                      <span>ID: {rcpt.id}</span>
                    </div>
                    {rcpt.status === "paid" && (
                      <a href={`https://xlayer-explorer.okx.com/tx/${rcpt.tx}`} target="_blank" rel="noopener noreferrer" className="receiptTxLink">
                        View Payment Tx on X Layer Explorer
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: KYA Know Your Agent */}
        {activeTab === "kya" && (
          <div className="dashboardGrid">
            
            {/* Left Card: Score Breakdown & Evidence */}
            <div className="card">
              <div className="cardHeader">
                <div>
                  <h2 className="cardTitle">
                    <span className="textPurple">●</span>
                    KYA Report: {activeAgent === "agent_good" ? "Agent Good" : activeAgent === "agent_transferred_identity" ? "Transferred Identity" : "Sybil Burst Agent"}
                  </h2>
                  <p className="cardSubtitle">Explainable trust verification metrics card</p>
                </div>
                
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className={`btn ${activeAgent === "agent_good" ? "btnActive" : "btnSecondary"}`} onClick={() => { setActiveAgent("agent_good"); setShowZkDetails(false); }}>
                    Agent Good
                  </button>
                  <button className={`btn ${activeAgent === "agent_transferred_identity" ? "btnActive" : "btnSecondary"}`} onClick={() => { setActiveAgent("agent_transferred_identity"); setShowZkDetails(false); }}>
                    Transferred Identity
                  </button>
                  <button className={`btn ${activeAgent === "agent_sybil_burst" ? "btnActive" : "btnSecondary"}`} onClick={() => { setActiveAgent("agent_sybil_burst"); setShowZkDetails(false); }}>
                    Sybil Burst
                  </button>
                </div>
              </div>

              {/* Badges / Flags row */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                <span className="flagBadge" style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
                  Chain: {agentReport.registrations[0]?.chain}
                </span>
                <span className="flagBadge" style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
                  Agent ID: {agentReport.registrations[0]?.agent_id}
                </span>
                
                {agentReport.flags.length === 0 ? (
                  <span className="flagBadge flagGreen" style={{ color: "var(--color-green)" }}>NO SYSTEM FLAGS</span>
                ) : (
                  agentReport.flags.map(f => (
                    <span key={f} className="flagBadge flagRed">{f}</span>
                  ))
                )}
              </div>

              {/* Component breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                
                <div>
                  <div className="componentRow">
                    <span style={{ fontWeight: 600 }}>Identity Continuity (35% weight)</span>
                    <span className="mono" style={{ fontWeight: 700 }}>{agentReport.components.identity_continuity.score}/100</span>
                  </div>
                  <div className="componentBarContainer">
                    <div className={`componentBar ${agentReport.components.identity_continuity.score >= 80 ? "bgGreen" : agentReport.components.identity_continuity.score >= 50 ? "bgOrange" : "bgRed"}`} style={{ width: `${agentReport.components.identity_continuity.score}%` }}></div>
                  </div>
                  <div style={{ fontSize: "0.75rem", marginTop: "0.25rem" }} className="textMuted">
                    {activeAgent === "agent_transferred_identity" ? (
                      <span>Identity token transferred in last 12 days. Inflows received before transfer: 31 feedback reviews. (FLAGGED)</span>
                    ) : (
                      <span>No ERC-721 identity transfer history. Wallet reputation is continuous.</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="componentRow">
                    <span style={{ fontWeight: 600 }}>Feedback Graph Forensic (30% weight)</span>
                    <span className="mono" style={{ fontWeight: 700 }}>{agentReport.components.feedback_graph.score}/100</span>
                  </div>
                  <div className="componentBarContainer">
                    <div className={`componentBar ${agentReport.components.feedback_graph.score >= 80 ? "bgGreen" : agentReport.components.feedback_graph.score >= 50 ? "bgOrange" : "bgRed"}`} style={{ width: `${agentReport.components.feedback_graph.score}%` }}></div>
                  </div>
                  <div style={{ fontSize: "0.75rem", marginTop: "0.25rem" }} className="textMuted">
                    <span>
                      Reviews: {agentReport.components.feedback_graph.evidence.feedback_count} | Distinct reviewers: {agentReport.components.feedback_graph.evidence.distinct_reviewers} | Top 3 Share: {(agentReport.components.feedback_graph.evidence.top3_reviewer_share * 100).toFixed(0)}% | 72h max share: {(agentReport.components.feedback_graph.evidence.max_share_72h_window * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div>
                  <div className="componentRow">
                    <span style={{ fontWeight: 600 }}>Registration Hygiene (20% weight)</span>
                    <span className="mono" style={{ fontWeight: 700 }}>{agentReport.components.registration_hygiene.score}/100</span>
                  </div>
                  <div className="componentBarContainer">
                    <div className={`componentBar ${agentReport.components.registration_hygiene.score >= 80 ? "bgGreen" : agentReport.components.registration_hygiene.score >= 50 ? "bgOrange" : "bgRed"}`} style={{ width: `${agentReport.components.registration_hygiene.score}%` }}></div>
                  </div>
                  <div style={{ fontSize: "0.75rem", marginTop: "0.25rem" }} className="textMuted">
                    <span>
                      Agent URI Resolves: {agentReport.components.registration_hygiene.evidence.agent_uri_resolves ? "TRUE" : "FALSE"} | Enpoints Reachable: {agentReport.components.registration_hygiene.evidence.endpoints_reachable ? "TRUE" : "FALSE"} | Domain verification: {agentReport.components.registration_hygiene.evidence.domain_verification ? "TRUE" : "FALSE"}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="componentRow">
                    <span style={{ fontWeight: 600 }}>Longevity &amp; Activity (15% weight)</span>
                    <span className="mono" style={{ fontWeight: 700 }}>{agentReport.components.longevity_activity.score}/100</span>
                  </div>
                  <div className="componentBarContainer">
                    <div className={`componentBar ${agentReport.components.longevity_activity.score >= 80 ? "bgGreen" : agentReport.components.longevity_activity.score >= 50 ? "bgOrange" : "bgRed"}`} style={{ width: `${agentReport.components.longevity_activity.score}%` }}></div>
                  </div>
                  <div style={{ fontSize: "0.75rem", marginTop: "0.25rem" }} className="textMuted">
                    <span>
                      Registered: {agentReport.components.longevity_activity.evidence.registered_days} days ago | Active days in last 30d: {agentReport.components.longevity_activity.evidence.active_days_30d} days.
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Card: Score Circle and ZKML Proof */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              
              <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <h3 className="cardTitle" style={{ alignSelf: "flex-start", marginBottom: "1rem" }}>Weighted KYA Score</h3>
                
                <div className="scoreCircle" style={{
                  background: `radial-gradient(var(--bg-surface-solid) 60%, transparent 62%), conic-gradient(${agentReport.score >= 80 ? "var(--color-green)" : agentReport.score >= 50 ? "var(--color-orange)" : "var(--color-red)"} ${agentReport.score}%, rgba(255,255,255,0.03) ${agentReport.score}%)`,
                  borderRadius: "50%",
                  boxShadow: `0 0 30px ${agentReport.score >= 80 ? "var(--glow-green)" : agentReport.score >= 50 ? "var(--glow-orange)" : "var(--glow-red)"}`
                }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span className="scoreValue">{agentReport.score}</span>
                    <span className="scoreLabel">TRUST INDEX</span>
                  </div>
                </div>

                <div style={{ marginTop: "1.5rem" }} className="textMuted">
                  {agentReport.score >= 80 ? (
                    <span className="textGreen" style={{ fontWeight: 600 }}>Low Risk: Fully approved for execution.</span>
                  ) : agentReport.score >= 50 ? (
                    <span className="textOrange" style={{ fontWeight: 600 }}>Medium Risk: Policy threshold warnings apply.</span>
                  ) : (
                    <span className="textRed" style={{ fontWeight: 600 }}>High Risk: Hard block protocol triggered.</span>
                  )}
                </div>
              </div>

              {/* ZKML Proof status */}
              <div className="card">
                <div className="cardHeader">
                  <div>
                    <h3 className="cardTitle">ZKML Cryptographic Attestation</h3>
                    <p className="cardSubtitle">Zero Knowledge Machine Learning Score Verification</p>
                  </div>
                </div>

                {agentReport.zk?.available ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <span className="flagBadge flagGreen" style={{ color: "var(--color-green)" }}>PROOF VERIFIED</span>
                      <button className="btn btnSecondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }} onClick={() => setShowZkDetails(!showZkDetails)}>
                        {showZkDetails ? "Hide Proof Payload" : "View Proof Payload"}
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="textMuted">Verifier Contract:</span>
                        <span className="mono">{truncateAddr(agentReport.zk.verifier?.address || "")} (X Layer)</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="textMuted">Model Commitment Hash:</span>
                        <span className="mono">{truncateAddr(agentReport.zk.model_commitment || "")}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="textMuted">Proof Scheme:</span>
                        <span>{agentReport.zk.scheme}</span>
                      </div>
                    </div>

                    {showZkDetails && (
                      <div className="terminal" style={{ marginTop: "1rem", maxHeight: "150px" }}>
                        <div className="terminalHeader">
                          <span>Groth16 Proof (ezkl-gen)</span>
                        </div>
                        <span className="textMuted">proof: </span>
                        <span>{agentReport.zk.proof}</span>
                        <br />
                        <span className="textMuted">inputs: </span>
                        <span>{JSON.stringify(agentReport.zk.public_inputs)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="flagBadge flagOrange" style={{ color: "var(--color-orange)" }}>ZK DEGRADATION</span>
                      <span style={{ fontSize: "0.75rem" }} className="textMuted">Reason: {agentReport.zk?.reason}</span>
                    </div>
                    <p style={{ fontSize: "0.8rem", lineHeight: "1.4" }} className="textMuted">
                      Attestation endpoint degraded gracefully. ZK Proof generation is bypassed (roadmap item). Full heuristic score data is returned at base check_agent price.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* Tab 3: The Firm Orchestrator */}
        {activeTab === "firm" && (
          <div className="dashboardGrid">
            
            {/* Left Card: Timeline Nodes & Progress */}
            <div className="card">
              <div className="cardHeader">
                <div>
                  <h2 className="cardTitle">
                    <span className="textPurple">●</span>
                    The Firm Orchestrator Simulation
                  </h2>
                  <p className="cardSubtitle">Node-by-node execution timeline of automated hire loop</p>
                </div>
                
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <select 
                    value={activeScenarioId} 
                    onChange={(e) => setActiveScenarioId(e.target.value)}
                    style={{ background: "var(--bg-surface-solid)", color: "var(--text-primary)", border: "1px solid var(--border-color)", padding: "0.5rem", borderRadius: "0.5rem", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                  >
                    <option value="happy_path">Normal Success Run (agent_good)</option>
                    <option value="diligence_halt">Diligence Reject (transferred)</option>
                    <option value="budget_breach">Budget Cap Breach</option>
                  </select>
                </div>
              </div>

              {/* Node Timeline Visual */}
              <div className="timelineWrapper">
                
                {/* Visual Connector Line */}
                <div className="timelineConnector"></div>
                <div 
                  className="timelineConnectorProgress" 
                  style={{ height: `${(currentStepIndex / (scenario.steps.length - 1)) * 95}%` }}
                ></div>

                {scenario.steps.map((step, idx) => {
                  const isActive = idx === currentStepIndex;
                  const isCompleted = idx < currentStepIndex;
                  const isFailed = idx === currentStepIndex && step.nodeId === "halt_and_report";
                  
                  let dotClass = "nodeDot";
                  if (isActive) dotClass += " nodeDotActive";
                  if (isCompleted) dotClass += " nodeDotCompleted";
                  if (isFailed) dotClass += " nodeDotFailed";

                  return (
                    <div key={step.nodeId} className="timelineNode">
                      <div className={dotClass}>
                        {step.nodeId === "plan" && "PLAN"}
                        {step.nodeId === "source" && "SRC"}
                        {step.nodeId === "diligence" && "DILG"}
                        {step.nodeId === "procure" && "PROC"}
                        {step.nodeId === "qa" && "QA"}
                        {step.nodeId === "assemble" && "ASMB"}
                        {step.nodeId === "no_qualified_vendor" && "WARN"}
                        {step.nodeId === "budget_breach" && "BREA"}
                        {step.nodeId === "halt_and_report" && "HALT"}
                      </div>
                      
                      <div className={`nodeContent ${isActive ? "nodeContentActive" : ""}`}>
                        <div className="nodeTitle">
                          <span>{step.title}</span>
                          <span 
                            className="nodeStatusLabel" 
                            style={{ 
                              color: isCompleted ? "var(--color-green)" : isActive ? "var(--color-purple)" : isFailed ? "var(--color-red)" : "var(--text-muted)"
                            }}
                          >
                            {isCompleted ? "Completed" : isActive ? "Active" : isFailed ? "Failed" : "Pending"}
                          </span>
                        </div>
                        <p className="nodeDesc">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Simulation Controls */}
              <div className="controlsRow" style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
                <button className="btn btnSecondary" onClick={stepBack} disabled={currentStepIndex === 0 || playState === "playing"}>
                  Back
                </button>
                {playState === "playing" ? (
                  <button className="btn btnSecondary" onClick={() => setPlayState("paused")}>
                    Pause
                  </button>
                ) : (
                  <button className="btn btnPrimary" onClick={() => setPlayState("playing")} disabled={currentStepIndex === scenario.steps.length - 1}>
                    Play Run
                  </button>
                )}
                <button className="btn btnSecondary" onClick={stepNext} disabled={currentStepIndex === scenario.steps.length - 1 || playState === "playing"}>
                  Next
                </button>
                <button className="btn btnSecondary" onClick={resetTimeline}>
                  Reset
                </button>
              </div>

            </div>

            {/* Right Card: Terminal Log & Outputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              
              {/* Terminal Log */}
              <div className="card">
                <div className="cardHeader">
                  <div>
                    <h3 className="cardTitle">The Firm Execution Log</h3>
                    <p className="cardSubtitle">Consuming real-time JSON events from Onchain OS stream</p>
                  </div>
                </div>
                
                <div className="terminal">
                  <div className="terminalHeader">
                    <span>firm_orchestrator.log</span>
                  </div>
                  {scenario.steps.slice(0, currentStepIndex + 1).map((step, idx) => (
                    <div key={idx} style={{ marginBottom: "0.5rem" }}>
                      <div className="textMuted"># Event node: {step.nodeId.toUpperCase()}</div>
                      <span style={{ whiteSpace: "pre-line" }}>{step.log}</span>
                    </div>
                  ))}
                  {playState === "playing" && <span className="textPurple">▋</span>}
                </div>
              </div>

              {/* Provenance Appendix Card (Renders only at completion) */}
              <div className="card">
                <div className="cardHeader">
                  <div>
                    <h3 className="cardTitle">Provenance Appendix</h3>
                    <p className="cardSubtitle">Verify audit logs, receipts, and KYA ratings</p>
                  </div>
                </div>

                {currentStepIndex === scenario.steps.length - 1 && scenario.appendix ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "0.75rem 1rem", borderRadius: "0.5rem", color: "var(--color-green)", fontSize: "0.85rem", fontWeight: 600 }}>
                      ✓ Task Provenance successfully compiled!
                    </div>

                    <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="textMuted">Task Spec ID:</span>
                        <span className="mono">st_01</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="textMuted">Vendor Hired:</span>
                        <span>{scenario.appendix.hires[0].vendor.name} (ID: {scenario.appendix.hires[0].vendor.agent_ref.agent_id})</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="textMuted">KYA Diligence Score:</span>
                        <span className="textGreen" style={{ fontWeight: 700 }}>{scenario.appendix.hires[0].kya_summary.score}/100</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="textMuted">Total Spent:</span>
                        <span className="textGreen" style={{ fontWeight: 700 }}>{formatUSDT(scenario.appendix.totals.spent.amount)}</span>
                      </div>
                    </div>

                    <div className="terminal" style={{ fontSize: "0.75rem", maxHeight: "150px", background: "rgba(255,255,255,0.01)" }}>
                      <div className="terminalHeader">
                        <span>Rendered Treasury Statement</span>
                      </div>
                      <span style={{ whiteSpace: "pre-line", color: "var(--text-secondary)" }}>{scenario.appendix.treasury_statement}</span>
                    </div>
                  </div>
                ) : currentStepIndex === scenario.steps.length - 1 && !scenario.appendix ? (
                  <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "0.75rem 1rem", borderRadius: "0.5rem", color: "var(--color-red)", fontSize: "0.85rem", fontWeight: 600 }}>
                    ⚠ Run aborted. No Provenance Appendix generated. Check the error log above.
                  </div>
                ) : (
                  <div style={{ padding: "1rem", textAlign: "center" }} className="textMuted">
                    Waiting for timeline run to complete...
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </>
  );
}
