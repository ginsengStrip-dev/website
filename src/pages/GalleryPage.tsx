import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Camera, LoaderCircle, RefreshCw } from 'lucide-react';
import { EditorialGallery } from '../components/EditorialGallery';
import { GalleryLightbox, GalleryLightboxItem } from '../components/GalleryLightbox';
import { GalleryYearNavigation } from '../components/GalleryYearNavigation';
import { fetchGalleryByYear, fetchGalleryYears } from '../lib/api';
import { GalleryEvent, GalleryImage, GalleryYearResponse } from '../types';
import '../components/gallery.css';

const PAGE_SIZE = 24;

function activeImageCount(events: GalleryEvent[]): number {
  return events.reduce(
    (total, event) => total + (event.images ?? []).filter(image => image.isActive !== false).length,
    0,
  );
}

function mergeGalleryEvents(existingEvents: GalleryEvent[], incomingEvents: GalleryEvent[]): GalleryEvent[] {
  const eventMap = new Map(existingEvents.map(event => [event.id, { ...event, images: [...(event.images ?? [])] }]));

  incomingEvents.forEach(incomingEvent => {
    const existing = eventMap.get(incomingEvent.id);
    if (!existing) {
      eventMap.set(incomingEvent.id, { ...incomingEvent, images: [...(incomingEvent.images ?? [])] });
      return;
    }

    const imageMap = new Map((existing.images ?? []).map(image => [image.id, image]));
    (incomingEvent.images ?? []).forEach(image => imageMap.set(image.id, image));
    eventMap.set(incomingEvent.id, {
      ...existing,
      ...incomingEvent,
      images: Array.from(imageMap.values()).sort((first, second) => first.displayOrder - second.displayOrder),
    });
  });

  return Array.from(eventMap.values()).sort((first, second) =>
    second.eventDate.localeCompare(first.eventDate),
  );
}

function flattenGalleryItems(events: GalleryEvent[]): GalleryLightboxItem[] {
  return events.flatMap(event =>
    [...(event.images ?? [])]
      .filter(image => image.isActive !== false)
      .sort((first, second) => first.displayOrder - second.displayOrder)
      .map(image => ({ event, image })),
  );
}

export const GalleryPage: React.FC = () => {
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [gallery, setGallery] = useState<GalleryYearResponse | null>(null);
  const [loadingYears, setLoadingYears] = useState<boolean>(true);
  const [loadingGallery, setLoadingGallery] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [yearsError, setYearsError] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [retryYearsKey, setRetryYearsKey] = useState<number>(0);
  const [retryGalleryKey, setRetryGalleryKey] = useState<number>(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const galleryRequestRef = useRef<number>(0);
  const loadMoreRequestRef = useRef<number>(0);

  useEffect(() => {
    let active = true;
    setLoadingYears(true);
    setYearsError(null);

    fetchGalleryYears()
      .then(result => {
        if (!active) return;
        const currentYear = new Date().getFullYear();
        const availableYears = Array.from(new Set(result))
          .filter(year => Number.isInteger(year) && year <= currentYear)
          .sort((first, second) => second - first);
        setYears(availableYears);
        setSelectedYear(previous => {
          if (previous !== null && availableYears.includes(previous)) return previous;
          return availableYears.includes(currentYear) ? currentYear : availableYears[0] ?? null;
        });
      })
      .catch(() => {
        if (!active) return;
        setYearsError('The gallery years could not be loaded. Please try again.');
      })
      .finally(() => {
        if (active) setLoadingYears(false);
      });

    return () => {
      active = false;
    };
  }, [retryYearsKey]);

  useEffect(() => {
    if (selectedYear === null) {
      setGallery(null);
      return;
    }

    const requestId = ++galleryRequestRef.current;
    loadMoreRequestRef.current += 1;
    setLoadingGallery(true);
    setGalleryError(null);
    setLoadMoreError(null);
    setLightboxIndex(null);

    fetchGalleryByYear(selectedYear, 0, PAGE_SIZE)
      .then(result => {
        if (requestId !== galleryRequestRef.current) return;
        setGallery(result);
      })
      .catch(() => {
        if (requestId !== galleryRequestRef.current) return;
        setGallery(null);
        setGalleryError(`The ${selectedYear} gallery could not be loaded. Please try again.`);
      })
      .finally(() => {
        if (requestId === galleryRequestRef.current) setLoadingGallery(false);
      });
  }, [retryGalleryKey, selectedYear]);

  const lightboxItems = useMemo(() => flattenGalleryItems(gallery?.events ?? []), [gallery]);
  const loadedImageCount = gallery ? activeImageCount(gallery.events) : 0;

  const handleSelectImage = useCallback(
    (event: GalleryEvent, image: GalleryImage) => {
      const index = lightboxItems.findIndex(
        item => item.event.id === event.id && item.image.id === image.id,
      );
      if (index >= 0) setLightboxIndex(index);
    },
    [lightboxItems],
  );

  const handleLoadMore = async () => {
    if (!gallery || selectedYear === null || loadingMore || !gallery.hasMore) return;

    const requestId = ++loadMoreRequestRef.current;
    const requestedYear = selectedYear;
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const nextPage = await fetchGalleryByYear(requestedYear, loadedImageCount, PAGE_SIZE);
      if (requestId !== loadMoreRequestRef.current || requestedYear !== selectedYear) return;
      setGallery(previous => {
        if (!previous || previous.year !== requestedYear) return previous;
        return {
          ...nextPage,
          year: previous.year,
          events: mergeGalleryEvents(previous.events, nextPage.events),
          totalImages: nextPage.totalImages,
          hasMore: nextPage.hasMore,
        };
      });
    } catch {
      if (requestId === loadMoreRequestRef.current) {
        setLoadMoreError('More photographs could not be loaded. Please try again.');
      }
    } finally {
      if (requestId === loadMoreRequestRef.current) setLoadingMore(false);
    }
  };

  return (
    <div className="gallery-page">
      <header className="gallery-page-hero">
        <div className="gallery-page-hero-inner">
          <span className="gallery-page-eyebrow">
            <Camera aria-hidden="true" />
            Archive in pictures
          </span>
          <h1>Event Gallery</h1>
          <p>
            Explore exhibitions, preservation workshops, community programmes, and the people helping
            safeguard manuscript heritage.
          </p>
        </div>
      </header>

      <main className="gallery-page-content">
        {loadingYears ? (
          <div className="gallery-year-skeleton" aria-label="Loading gallery years" aria-busy="true">
            {[0, 1, 2, 3, 4].map(item => <span key={item} />)}
          </div>
        ) : yearsError ? (
          <div className="gallery-state gallery-state--error" role="alert">
            <AlertCircle aria-hidden="true" />
            <p>{yearsError}</p>
            <button type="button" onClick={() => setRetryYearsKey(value => value + 1)}>
              <RefreshCw aria-hidden="true" /> Retry
            </button>
          </div>
        ) : years.length === 0 || selectedYear === null ? (
          <div className="gallery-state">
            <Camera aria-hidden="true" />
            <h2>No gallery photographs are available yet.</h2>
            <p>Please return later as new archival events are documented.</p>
          </div>
        ) : (
          <>
            <GalleryYearNavigation
              years={years}
              selectedYear={selectedYear}
              onSelectYear={setSelectedYear}
            />

            <section
              id={`gallery-year-panel-${selectedYear}`}
              role="tabpanel"
              aria-labelledby={`gallery-year-tab-${selectedYear}`}
              className="gallery-year-panel"
              aria-busy={loadingGallery}
            >
              {loadingGallery ? (
                <div className="gallery-grid-skeleton" aria-label={`Loading ${selectedYear} gallery`}>
                  {[0, 1, 2, 3, 4, 5].map(item => <span key={item} />)}
                </div>
              ) : galleryError ? (
                <div className="gallery-state gallery-state--error" role="alert">
                  <AlertCircle aria-hidden="true" />
                  <p>{galleryError}</p>
                  <button type="button" onClick={() => setRetryGalleryKey(value => value + 1)}>
                    <RefreshCw aria-hidden="true" /> Retry
                  </button>
                </div>
              ) : !gallery || loadedImageCount === 0 ? (
                <div className="gallery-state">
                  <Camera aria-hidden="true" />
                  <h2>No gallery images are available for {selectedYear}.</h2>
                </div>
              ) : (
                <>
                  <div className="gallery-year-summary">
                    <p>{selectedYear} collection</p>
                    <span>
                      Showing {loadedImageCount} of {gallery.totalImages} photographs
                    </span>
                  </div>
                  <EditorialGallery events={gallery.events} onSelectImage={handleSelectImage} />

                  {gallery.hasMore && (
                    <div className="gallery-load-more">
                      {loadMoreError && <p role="alert">{loadMoreError}</p>}
                      <button type="button" onClick={handleLoadMore} disabled={loadingMore}>
                        {loadingMore ? <LoaderCircle className="gallery-spin" aria-hidden="true" /> : null}
                        {loadingMore ? 'Loading photographs…' : 'Load more photographs'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </main>

      {lightboxIndex !== null && (
        <GalleryLightbox
          items={lightboxItems}
          activeIndex={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};
