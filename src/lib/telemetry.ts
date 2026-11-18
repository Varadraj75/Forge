import { leadCount } from "./leads-store";

export interface PlatformTelemetry {
  waitlistRegistrations: number;
  benchmarkP95LatencyMs: number;
  challengeTracks: number;
  simulatedTestCases: number;
  isPrototype: boolean;
  timestamp: string;
}

/**
 * Retrieves platform telemetry and prototype benchmark indicators.
 * Dynamic metrics reflect real submissions via the active storage adapter.
 */
export async function getPlatformTelemetry(): Promise<PlatformTelemetry> {
  const count = await leadCount();

  return {
    waitlistRegistrations: count,
    benchmarkP95LatencyMs: 64,
    challengeTracks: 4,
    simulatedTestCases: 412,
    isPrototype: true,
    timestamp: new Date().toISOString(),
  };
}
