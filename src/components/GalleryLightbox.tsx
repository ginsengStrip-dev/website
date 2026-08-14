import React, { useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GalleryEvent, GalleryImage } from '../types';

export interface GalleryLightboxItem {
  event: GalleryEvent;
  image: GalleryImage;
}

interface GalleryLightboxProps {
  items: GalleryLightboxItem[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

function formatEventDate(value: string): string {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  items,
  activeIndex,
  onIndexChange,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasMultipleImages = items.length > 1;

  const showPrevious = useCallback(() => {
    if (!hasMultipleImages) return;
    onIndexChange((activeIndex - 1 + items.length) % items.length);
  }, [activeIndex, hasMultipleImages, items.length, onIndexChange]);

  const showNext = useCallback(() => {
    if (!hasMultipleImages) return;
    onIndexChange((activeIndex + 1) % items.length);
  }, [activeIndex, hasMultipleImages, items.length, onIndexChange]);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showPrevious();
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showNext();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusableNodes = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      const focusable = focusableNodes
        ? (Array.prototype.slice.call(focusableNodes) as HTMLElement[]).filter(
            element => !element.hasAttribute('disabled'),
          )
        : [];
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showNext, showPrevious]);

  useEffect(() => {
    if (!hasMultipleImages) return;
    const adjacentIndexes = [
      (activeIndex - 1 + items.length) % items.length,
      (activeIndex + 1) % items.length,
    ];
    adjacentIndexes.forEach(index => {
      const preload = new Image();
      preload.src = items[index].image.imageUrl;
    });
  }, [activeIndex, hasMultipleImages, items]);

  if (items.length === 0) return null;

  const boundedIndex = Math.min(Math.max(activeIndex, 0), items.length - 1);
  const current = items[boundedIndex];
  const caption = current.image.caption?.trim();
  const accessibleAlt = current.image.altText || caption || current.event.title;

  return (
    <div
      className="gallery-lightbox-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="gallery-lightbox"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-lightbox-title"
        aria-describedby={caption ? 'gallery-lightbox-caption' : undefined}
      >
        <div className="gallery-lightbox-toolbar">
          <p className="gallery-lightbox-position" aria-live="polite">
            {boundedIndex + 1} / {items.length}
          </p>
          <button
            ref={closeButtonRef}
            type="button"
            className="gallery-lightbox-close"
            onClick={onClose}
            aria-label="Close image viewer"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div
          className="gallery-lightbox-stage"
          onTouchStart={event => {
            const touch = event.changedTouches[0];
            touchStartRef.current = { x: touch.clientX, y: touch.clientY };
          }}
          onTouchEnd={event => {
            const start = touchStartRef.current;
            touchStartRef.current = null;
            if (!start || !hasMultipleImages) return;
            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - start.x;
            const deltaY = touch.clientY - start.y;
            if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
            if (deltaX > 0) showPrevious();
            else showNext();
          }}
        >
          {hasMultipleImages && (
            <button
              type="button"
              className="gallery-lightbox-nav gallery-lightbox-nav--previous"
              onClick={showPrevious}
              aria-label="View previous image"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
          )}

          <figure className="gallery-lightbox-figure">
            <img src={current.image.imageUrl} alt={accessibleAlt} draggable={false} />
            <figcaption className="gallery-lightbox-details">
              <div>
                <p className="gallery-lightbox-date">
                  <time dateTime={current.event.eventDate}>{formatEventDate(current.event.eventDate)}</time>
                </p>
                <h2 id="gallery-lightbox-title">{current.event.title}</h2>
              </div>
              {caption && <p id="gallery-lightbox-caption">{caption}</p>}
            </figcaption>
          </figure>

          {hasMultipleImages && (
            <button
              type="button"
              className="gallery-lightbox-nav gallery-lightbox-nav--next"
              onClick={showNext}
              aria-label="View next image"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
