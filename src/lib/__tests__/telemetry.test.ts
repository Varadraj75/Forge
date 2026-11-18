import { describe, it, expect, beforeEach } from "vitest";
import { getPlatformTelemetry } from "../telemetry";
import {
  addLead,
  leadCount,
  setStorageAdapter,
  _resetLeadsForTesting,
} from "../leads-store";
import { MemoryLeadsAdapter } from "../storage-adapter";

describe("telemetry: getPlatformTelemetry", () => {
  beforeEach(async () => {
    setStorageAdapter(new MemoryLeadsAdapter());
    await _resetLeadsForTesting();
  });

  it("streams dynamic platform telemetry metrics accurately", async () => {
    const baselineLeads = await leadCount();
    const telemetry = await getPlatformTelemetry();

    expect(telemetry).toHaveProperty("benchmarkP95LatencyMs");
    expect(telemetry.benchmarkP95LatencyMs).toBe(64);
    expect(telemetry.challengeTracks).toBe(4);
    expect(telemetry.simulatedTestCases).toBe(412);
    expect(telemetry.isPrototype).toBe(true);
    expect(telemetry.waitlistRegistrations).toBe(baselineLeads);
    expect(new Date(telemetry.timestamp).getTime()).not.toBeNaN();
  });

  it("updates platform telemetry when new leads register", async () => {
    const beforeTelemetry = await getPlatformTelemetry();
    const uniqueEmail = `telemetry_test_${Date.now()}@example.com`;

    await addLead({
      name: "Barbara Liskov",
      email: uniqueEmail,
      organization: "MIT",
      intent: "builder",
    });

    const updatedTelemetry = await getPlatformTelemetry();
    expect(updatedTelemetry.waitlistRegistrations).toBe(beforeTelemetry.waitlistRegistrations + 1);
  });
});
