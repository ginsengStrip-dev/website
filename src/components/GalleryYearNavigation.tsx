import React, { useRef } from 'react';

interface GalleryYearNavigationProps {
  years: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
  disabled?: boolean;
}

export const GalleryYearNavigation: React.FC<GalleryYearNavigationProps> = ({
  years,
  selectedYear,
  onSelectYear,
  disabled = false,
}) => {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveFocus = (currentIndex: number, direction: 'next' | 'previous' | 'first' | 'last') => {
    if (years.length === 0) return;

    let nextIndex = currentIndex;
    if (direction === 'next') nextIndex = (currentIndex + 1) % years.length;
    if (direction === 'previous') nextIndex = (currentIndex - 1 + years.length) % years.length;
    if (direction === 'first') nextIndex = 0;
    if (direction === 'last') nextIndex = years.length - 1;

    tabRefs.current[nextIndex]?.focus();
    onSelectYear(years[nextIndex]);
  };

  return (
    <div className="gallery-year-nav-wrap" aria-label="Gallery years">
      <div className="gallery-year-nav" role="tablist" aria-orientation="horizontal">
        {years.map((year, index) => {
          const selected = year === selectedYear;
          return (
            <button
              key={year}
              ref={element => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`gallery-year-tab-${year}`}
              aria-controls={`gallery-year-panel-${year}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              disabled={disabled}
              className={`gallery-year-tab${selected ? ' gallery-year-tab--active' : ''}`}
              onClick={() => onSelectYear(year)}
              onKeyDown={event => {
                if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  moveFocus(index, 'next');
                } else if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  moveFocus(index, 'previous');
                } else if (event.key === 'Home') {
                  event.preventDefault();
                  moveFocus(index, 'first');
                } else if (event.key === 'End') {
                  event.preventDefault();
                  moveFocus(index, 'last');
                }
              }}
            >
              {year}
            </button>
          );
        })}
      </div>
    </div>
  );
};
