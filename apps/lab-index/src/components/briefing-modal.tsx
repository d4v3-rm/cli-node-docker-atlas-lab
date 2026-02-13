import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaXmark } from 'react-icons/fa6';
import { useBriefing } from '@/hooks/use-briefing';
import type { BriefingModalProps } from '@/types/dashboard.types';

/**
 * Displays runtime markdown briefings rendered from the gateway content templates.
 */
export function BriefingModal({ briefing, onClose }: BriefingModalProps) {
  const { content, error, isLoading } = useBriefing(briefing);

  useEffect(() => {
    if (!briefing) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.classList.add('has-modal-open');
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.classList.remove('has-modal-open');
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [briefing, onClose]);

  return (
    <div
      aria-hidden={briefing ? 'false' : 'true'}
      className={`modal-shell${briefing ? ' active' : ''}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal" role="dialog" aria-labelledby="briefing-title" aria-modal="true">
        <div className="modal-header">
          <h3 id="briefing-title">{briefing?.title ?? 'Briefing'}</h3>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Chiudi">
            <FaXmark />
          </button>
        </div>

        <div className="modal-body">
          {!briefing ? null : isLoading ? (
            <p>Caricamento briefing locale...</p>
          ) : error ? (
            <>
              <p>Impossibile caricare il briefing locale.</p>
              <pre>
                <code>{error}</code>
              </pre>
            </>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
