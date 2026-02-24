import { useEffect, useState } from 'react';
import { loadBriefing } from '@/services/briefing.service';
import type { BriefingReference, BriefingState } from '@/types/briefing.types';

/**
 * Loads markdown content for the currently selected briefing.
 */
export function useBriefing(briefing: BriefingReference | null): BriefingState {
  const [state, setState] = useState<BriefingState>({
    content: '',
    error: null,
    isLoading: false
  });

  useEffect(() => {
    if (!briefing) {
      setState({
        content: '',
        error: null,
        isLoading: false
      });
      return undefined;
    }

    let isCurrent = true;

    setState({
      content: '',
      error: null,
      isLoading: true
    });

    void loadBriefing(briefing.path)
      .then((content) => {
        if (!isCurrent) {
          return;
        }

        setState({
          content,
          error: null,
          isLoading: false
        });
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return;
        }

        setState({
          content: '',
          error: error instanceof Error ? error.message : 'Briefing non disponibile.',
          isLoading: false
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [briefing]);

  return state;
}
