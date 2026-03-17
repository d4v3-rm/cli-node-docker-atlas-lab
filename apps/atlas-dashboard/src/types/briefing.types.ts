/**
 * Identifies a markdown briefing exposed by the gateway static site.
 */
export interface BriefingReference {
  path: string;
  title: string;
}

/**
 * Loading state for the briefing modal content.
 */
export interface BriefingState {
  content: string;
  error: string | null;
  isLoading: boolean;
}
