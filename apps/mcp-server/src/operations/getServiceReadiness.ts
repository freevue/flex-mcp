export type ServiceReadinessInput = { configured: boolean; paused: boolean; browserOnline: boolean };
export type ServiceReadiness = { acceptsRequests: boolean; browserOnline: boolean };

export function getServiceReadiness(settings: ServiceReadinessInput): ServiceReadiness {
  return { acceptsRequests: settings.configured && !settings.paused, browserOnline: settings.browserOnline };
}
