import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Camera, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { fetchCurrentYearGallery } from '../lib/api';
import { GalleryEvent, GalleryImage } from '../types';
import './gallery.css';

interface HomeGalleryCarouselProps {
  onViewGallery?: () => void;
}

interface CarouselItem {
  event: GalleryEvent;
  image: GalleryImage;
}

type CarouselPosition = 'previous' | 'active' | 'next';

interface VisibleCarouselItem extends CarouselItem {
  position: CarouselPosition;
}

const AUTOPLAY_INTERVAL = 1000;

function formatEventDate(value: string): string {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function extractCurrentYearItems(events: GalleryEvent[], currentYear: number): CarouselItem[] {
  const items = events
    .filter(event => event.eventYear === currentYear)
    .flatMap(event =>
      [...(event.images ?? [])]
        .filter(image => image.isActive !== false)
        .sort((first, second) => first.displayOrder - second.displayOrder)
        .map(image => ({ event, image })),
    );

  return items.sort((first, second) => {
    const featureDifference = Number(second.image.isFeatured) - Number(first.image.isFeatured);
    if (featureDifference !== 0) return featureDifference;
    const dateDifference = second.event.eventDate.localeCompare(first.event.eventDate);
    if (dateDifference !== 0) return dateDifference;
    return first.image.displayOrder - second.image.displayOrder;
  });
}

export const HomeGalleryCarousel: React.FC<HomeGalleryCarouselProps> = ({ onViewGallery }) => {
  const currentYear = new Date().getFullYear();
  const prefersReducedMotion = useReducedMotion();
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState<number>(0);
  const [hovered, setHovered] = useState<boolean>(false);
  const [focused, setFocused] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);
  const [pageHidden, setPageHidden] = useState<boolean>(document.hidden);
  const pointerStartRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchCurrentYearGallery()
      .then(response => {
        if (!active) return;
        const currentItems = response.year === currentYear
          ? extractCurrentYearItems(response.events, currentYear)
          : [];
        setItems(currentItems);
        setActiveIndex(0);
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
        setError('The current-year gallery could not be loaded.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentYear, retryKey]);

  useEffect(() => {
    const handleVisibilityChange = () => setPageHidden(document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const showPrevious = useCallback(() => {
    setActiveIndex(current => (current - 1 + items.length) % items.length);
  }, [items.length]);

  const showNext = useCallback(() => {
    setActiveIndex(current => (current + 1) % items.length);
  }, [items.length]);

  const autoplayPaused = hovered || focused || dragging || pageHidden;

  useEffect(() => {
    if (items.length < 2 || autoplayPaused || prefersReducedMotion) return;
    const interval = window.setInterval(showNext, AUTOPLAY_INTERVAL);
    return () => window.clearInterval(interval);
  }, [autoplayPaused, items.length, prefersReducedMotion, showNext]);

  const visibleItems = useMemo<VisibleCarouselItem[]>(() => {
    if (items.length === 0) return [];
    if (items.length === 1) return [{ ...items[0], position: 'active' }];
    if (items.length === 2) {
      return [
        { ...items[activeIndex], position: 'active' },
        { ...items[(activeIndex + 1) % items.length], position: 'next' },
      ];
    }
    return [
      { ...items[(activeIndex - 1 + items.length) % items.length], position: 'previous' },
      { ...items[activeIndex], position: 'active' },
      { ...items[(activeIndex + 1) % items.length], position: 'next' },
    ];
  }, [activeIndex, items]);

  return (
    <section className="gallery-home" aria-labelledby="home-gallery-title">
      <div className="gallery-home-header">
        <div>
          <span className="gallery-home-eyebrow">
            <Camera aria-hidden="true" /> {currentYear} in pictures
          </span>
          <h2 id="home-gallery-title">Current-Year Gallery</h2>
          <p>Recent moments from our preservation, research, and community programmes.</p>
        </div>
        {onViewGallery && (
          <button type="button" className="gallery-home-view-all" onClick={onViewGallery}>
            View full gallery <ArrowRight aria-hidden="true" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="gallery-carousel-skeleton" aria-label="Loading current-year gallery" aria-busy="true">
          <span />
          <span />
          <span />
        </div>
      ) : error ? (
        <div className="gallery-home-empty" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setRetryKey(value => value + 1)}>
            <RefreshCw aria-hidden="true" /> Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="gallery-home-empty">
          <Camera aria-hidden="true" />
          <p>No gallery images are available for {currentYear} yet.</p>
        </div>
      ) : (
        <div
          className={`gallery-carousel gallery-carousel--count-${Math.min(items.length, 3)}`}
          aria-roledescription="carousel"
          aria-label={`${currentYear} event photographs`}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={event => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
          }}
          onPointerDown={event => {
            if (items.length < 2 || event.button !== 0) return;
            if ((event.target as HTMLElement).closest('button, a, input, select, textarea')) return;
            pointerStartRef.current = event.clientX;
            setDragging(true);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={event => {
            const start = pointerStartRef.current;
            pointerStartRef.current = null;
            setDragging(false);
            if (start === null || items.length < 2) return;
            const distance = event.clientX - start;
            if (Math.abs(distance) < 45) return;
            if (distance > 0) showPrevious();
            else showNext();
          }}
          onPointerCancel={() => {
            pointerStartRef.current = null;
            setDragging(false);
          }}
        >
          <div
            className="gallery-carousel-track"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <AnimatePresence initial={false} mode="popLayout">
            {visibleItems.map(item => {
              const caption = item.image.caption?.trim() || item.event.title;
              const active = item.position === 'active';
              return (
                <motion.figure
                  layout
                  key={item.image.id}
                  initial={{ opacity: 0, scale: 0.84 }}
                  animate={{ opacity: active ? 1 : 0.58, scale: active ? 1 : 0.9 }}
                  exit={{ opacity: 0, scale: 0.84 }}
                  transition={{
                    layout: { duration: prefersReducedMotion ? 0 : 0.82, ease: [0.22, 0.72, 0.24, 1] },
                    opacity: { duration: prefersReducedMotion ? 0 : 0.5, ease: 'easeOut' },
                    scale: { duration: prefersReducedMotion ? 0 : 0.72, ease: [0.22, 0.72, 0.24, 1] },
                  }}
                  className={`gallery-carousel-card gallery-carousel-card--${item.position}`}
                  aria-hidden={!active}
                >
                  <img
                    src={item.image.thumbnailUrl || item.image.imageUrl}
                    alt={active ? item.image.altText || caption : ''}
                    draggable={false}
                    loading={active ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  {active && (
                    <motion.figcaption
                      className="gallery-carousel-caption"
                      aria-live="polite"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: prefersReducedMotion ? 0 : 0.5,
                        delay: prefersReducedMotion ? 0 : 0.16,
                        ease: 'easeOut',
                      }}
                    >
                      <span>{caption}</span>
                      <small>
                        {item.event.title} ·{' '}
                        <time dateTime={item.event.eventDate}>{formatEventDate(item.event.eventDate)}</time>
                      </small>
                    </motion.figcaption>
                  )}
                </motion.figure>
              );
            })}
            </AnimatePresence>
          </div>

          {items.length > 1 && (
            <div className="gallery-carousel-controls">
              <button
                type="button"
                onClick={() => {
                  showPrevious();
                  setFocused(false);
                }}
                aria-label="View previous gallery image"
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => {
                  showNext();
                  setFocused(false);
                }}
                aria-label="View next gallery image"
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
