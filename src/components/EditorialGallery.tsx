import React from 'react';
import { CalendarDays, Images } from 'lucide-react';
import { GalleryEvent, GalleryImage } from '../types';

interface EditorialGalleryProps {
  events: GalleryEvent[];
  onSelectImage: (event: GalleryEvent, image: GalleryImage) => void;
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

function visibleImages(event: GalleryEvent): GalleryImage[] {
  return [...(event.images ?? [])]
    .filter(image => image.isActive !== false)
    .sort((first, second) => first.displayOrder - second.displayOrder);
}

function editorialSpans(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [8];
  if (count === 2) return [5, 7];

  const spans: number[] = [];
  let remaining = count;
  if (remaining % 3 === 1) {
    spans.push(7, 5, 5, 7);
    remaining -= 4;
  }

  let alternate = false;
  while (remaining >= 3) {
    spans.push(...(alternate ? [5, 4, 3] : [3, 5, 4]));
    alternate = !alternate;
    remaining -= 3;
  }
  if (remaining === 2) spans.push(7, 5);
  return spans;
}

const spanClasses: Record<number, string> = {
  3: 'gallery-editorial-span-3',
  4: 'gallery-editorial-span-4',
  5: 'gallery-editorial-span-5',
  7: 'gallery-editorial-span-7',
  8: 'gallery-editorial-span-8',
};

export const EditorialGallery: React.FC<EditorialGalleryProps> = ({ events, onSelectImage }) => {
  const publishedEvents = events.filter(event => visibleImages(event).length > 0);

  return (
    <div className="gallery-event-list">
      {publishedEvents.map(event => {
        const images = visibleImages(event);
        const spans = editorialSpans(images.length);

        return (
          <section className="gallery-event" key={event.id} aria-labelledby={`gallery-event-title-${event.id}`}>
            <header className="gallery-event-header">
              <div className="gallery-event-heading">
                <p className="gallery-event-date">
                  <CalendarDays aria-hidden="true" />
                  <time dateTime={event.eventDate}>{formatEventDate(event.eventDate)}</time>
                </p>
                <h2 id={`gallery-event-title-${event.id}`}>{event.title}</h2>
                {event.description && <p className="gallery-event-description">{event.description}</p>}
              </div>
              <p className="gallery-event-count" aria-label={`${images.length} photographs`}>
                <Images aria-hidden="true" />
                <span>{images.length}</span>
              </p>
            </header>

            <div className="gallery-editorial-grid">
              {images.map((image, index) => {
                const caption = image.caption?.trim() || event.title;
                const spanClass = spanClasses[spans[index]] || 'gallery-editorial-span-12';
                const singleClass = images.length === 1 ? ' gallery-editorial-item--single' : '';
                const tabletWideClass = images.length % 2 === 1 && index === images.length - 1
                  ? ' gallery-editorial-item--tablet-wide'
                  : '';
                return (
                  <button
                    key={image.id}
                    type="button"
                    className={`gallery-editorial-item ${spanClass}${singleClass}${tabletWideClass}`}
                    aria-label={`Open ${image.altText || caption}`}
                    onClick={() => onSelectImage(event, image)}
                  >
                    <img
                      src={image.thumbnailUrl || image.imageUrl}
                      alt={image.altText || caption}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                    <span className="gallery-editorial-caption">
                      <span>{caption}</span>
                    </span>
                    {image.isFeatured && <span className="gallery-editorial-featured">Featured</span>}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
