import React, { useState } from 'react';
import {
  Camera,
  X,
  Expand,
  ArrowLeft,
  ArrowRight,
  Images,
  Landmark,
  ScrollText,
  HeartHandshake,
  ScanLine,
  Newspaper,
  ExternalLink,
} from 'lucide-react';

interface GalleryPageProps {
  onNavigate: (tab: string) => void;
}

type GalleryCategory =
  | 'Satra'
  | 'Manuscripts'
  | 'Damage'
  | 'Conservation'
  | 'Digitisation';

interface GalleryImage {
  id: number;
  src: string;
  title: string;
  description: string;
  category: GalleryCategory;
  date?: string;
  location?: string;
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: '/images/gallery/satra/satra-01.jpg',
    title: 'Medhijan Shri Shri Gajala Satra',
    description:
      'A view of Medhijan Shri Shri Gajala Satra in Sivasagar, custodian of the historic manuscript collection.',
    category: 'Satra',
    location: 'Sivasagar, Assam',
  },
  {
    id: 2,
    src: '/images/gallery/satra/satra-02.jpg',
    title: 'The Satra and Its Heritage',
    description:
      'The historic Satra provides the cultural and institutional setting in which the manuscript collection has been preserved over generations.',
    category: 'Satra',
    location: 'Sivasagar, Assam',
  },
  {
    id: 3,
    src: '/images/gallery/manuscripts/manuscript-01.jpg',
    title: 'Historic Manuscript Folios',
    description:
      'Surviving manuscript folios representing the Satra’s literary, religious and cultural heritage.',
    category: 'Manuscripts',
  },
  {
    id: 4,
    src: '/images/gallery/manuscripts/manuscript-02.jpg',
    title: 'Sanchipat Manuscript',
    description:
      'A closer view of manuscript material from the Satra collection, showing the writing surface and age-related characteristics.',
    category: 'Manuscripts',
  },
  {
    id: 5,
    src: '/images/gallery/damage/damage-01.jpg',
    title: 'Flood-Affected Manuscripts',
    description:
      'Manuscript folios affected by water and prolonged moisture, requiring careful conservation intervention.',
    category: 'Damage',
  },
  {
    id: 6,
    src: '/images/gallery/damage/damage-02.jpg',
    title: 'Material Deterioration',
    description:
      'Visible deterioration in fragile manuscript material following environmental exposure and moisture damage.',
    category: 'Damage',
  },
  {
    id: 7,
    src: '/images/gallery/conservation/conservation-01.jpg',
    title: 'Condition Assessment',
    description:
      'Conservation specialists examining individual manuscript folios to assess their condition before treatment.',
    category: 'Conservation',
  },
  {
    id: 8,
    src: '/images/gallery/conservation/conservation-02.jpg',
    title: 'Careful Folio Separation',
    description:
      'Fragile manuscript leaves being carefully separated to prevent further mechanical damage.',
    category: 'Conservation',
  },
  {
    id: 9,
    src: '/images/gallery/conservation/conservation-03.jpg',
    title: 'Cleaning and Stabilisation',
    description:
      'Conservation work in progress as affected folios are cleaned, handled and stabilised.',
    category: 'Conservation',
  },
  {
    id: 10,
    src: '/images/gallery/conservation/conservation-04.jpg',
    title: 'Conservation in Progress',
    description:
      'The preservation team working directly with damaged manuscript material during the restoration process.',
    category: 'Conservation',
  },
  {
    id: 11,
    src: '/images/gallery/digitisation/digitisation-01.jpg',
    title: 'Digital Documentation',
    description:
      'A stabilised manuscript being photographed or scanned to create a high-quality digital record.',
    category: 'Digitisation',
  },
  {
    id: 12,
    src: '/images/gallery/digitisation/digitisation-02.jpg',
    title: 'Building the Digital Archive',
    description:
      'Digital records and manuscript metadata being prepared for structured archival preservation and future access.',
    category: 'Digitisation',
  },
];
const newsItems = [
  {
    id: 1,
    source: 'ThePrint',
    title:
      'Gauhati University working to preserve centuries-old manuscripts damaged in flood',
    description:
      'Coverage of the conservation effort for flood-affected manuscripts at the Satra and the role of Gauhati University in preserving the collection.',
    date: 'August 2026',
    url: 'https://theprint.in/india/gauhati-university-working-to-preserve-centuries-old-manuscripts-damaged-in-flood/3005500/',
  },
  {
    id: 2,
    source: 'India Today NE',
    title:
      'Gauhati University launches mission to restore flood-damaged manuscripts at Sivasagar Satra',
    description:
      'A report on the manuscript restoration mission, conservation work and the significance of the historic collection at Medhijan Shri Shri Gajala Satra.',
    date: 'August 4, 2026',
    url: 'https://www.indiatodayne.in/assam/story/gauhati-university-launches-mission-to-restore-flood-damaged-manuscripts-at-sivasagar-satra-1433611-2026-08-04',
  },
];

export const GalleryPage: React.FC<GalleryPageProps> = ({
  onNavigate,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    'All' | GalleryCategory
  >('All');

  const [selectedImage, setSelectedImage] =
    useState<GalleryImage | null>(null);

  const categories: Array<{
    name: 'All' | GalleryCategory;
    label: string;
  }> = [
    { name: 'All', label: 'All Photographs' },
    { name: 'Satra', label: 'The Satra' },
    { name: 'Manuscripts', label: 'Manuscripts' },
    { name: 'Damage', label: 'Damage' },
    { name: 'Conservation', label: 'Conservation' },
    { name: 'Digitisation', label: 'Digitisation' },
  ];

  const filteredImages =
    activeCategory === 'All'
      ? galleryImages
      : galleryImages.filter(
          image => image.category === activeCategory
        );

  const getCategoryIcon = (category: GalleryCategory) => {
    switch (category) {
      case 'Satra':
        return Landmark;
      case 'Manuscripts':
        return ScrollText;
      case 'Damage':
        return Images;
      case 'Conservation':
        return HeartHandshake;
      case 'Digitisation':
        return ScanLine;
      default:
        return Camera;
    }
  };

  const handlePrevious = () => {
    if (!selectedImage) return;

    const currentIndex = filteredImages.findIndex(
      image => image.id === selectedImage.id
    );

    const previousIndex =
      currentIndex <= 0
        ? filteredImages.length - 1
        : currentIndex - 1;

    setSelectedImage(filteredImages[previousIndex]);
  };

  const handleNext = () => {
    if (!selectedImage) return;

    const currentIndex = filteredImages.findIndex(
      image => image.id === selectedImage.id
    );

    const nextIndex =
      currentIndex >= filteredImages.length - 1
        ? 0
        : currentIndex + 1;

    setSelectedImage(filteredImages[nextIndex]);
  };

  return (
    <div className="pb-20">

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#2b2016] via-[#241a11] to-[#1b130c] text-amber-50">

        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:18px_18px]" />

        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-amber-500/10 blur-[140px] rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 text-center">

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-900/60 border border-amber-600/30 text-amber-200 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            Visual Documentation
          </div>

          <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl text-amber-50 mt-6">
            Conservation Gallery
          </h1>

          <p className="text-sm sm:text-base text-amber-200/70 max-w-3xl mx-auto leading-relaxed mt-5">
            A photographic record of Medhijan Shri Shri Gajala Satra,
            its manuscript collection, the damage affecting fragile
            folios, and the continuing work of conservation,
            documentation and digital preservation.
          </p>

        </div>
      </section>


      {/* =====================================================
          INTRODUCTION
      ===================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">

        <div className="max-w-3xl mx-auto text-center">

          <span className="text-[10px] uppercase tracking-[0.22em] text-amber-800 font-bold">
            Recording the Preservation Journey
          </span>

          <h2 className="font-serif font-bold text-3xl text-amber-950 mt-3">
            More Than a Collection of Images
          </h2>

          <p className="text-sm text-amber-900/65 leading-relaxed mt-4">
            Photographic documentation provides a visual history of the
            manuscripts and their conservation. These photographs record
            their physical condition, treatment, handling, preservation
            environment and eventual transition into the digital archive.
          </p>

        </div>
      </section>


      {/* =====================================================
          FILTERS
      ===================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        <div className="flex flex-wrap justify-center gap-2">

          {categories.map(category => {
            const selected = activeCategory === category.name;

            return (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all ${
                  selected
                    ? 'bg-amber-900 text-amber-50 shadow-md'
                    : 'bg-amber-100/70 border border-amber-200 text-amber-900 hover:bg-amber-200'
                }`}
              >
                {category.label}
              </button>
            );
          })}

        </div>

      </section>


      {/* =====================================================
          IMAGE GRID
      ===================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {filteredImages.map(image => {
              const CategoryIcon = getCategoryIcon(image.category);

              return (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className="group relative text-left rounded-2xl overflow-hidden bg-[#e9dece] border border-[#ded0bf] shadow-sm hover:shadow-xl transition-all"
                >

                  <div className="aspect-[4/3] overflow-hidden">

                    <img
                      src={image.src}
                      alt={image.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />

                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />

                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">

                    <Expand className="w-4 h-4 text-white" />

                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5">

                    <div className="flex items-center gap-1.5 text-amber-300">

                      <CategoryIcon className="w-3.5 h-3.5" />

                      <span className="text-[9px] uppercase tracking-[0.18em] font-bold">
                        {image.category}
                      </span>

                    </div>

                    <h3 className="font-serif font-bold text-lg text-white mt-2">
                      {image.title}
                    </h3>

                    <p className="text-[11px] text-white/70 leading-relaxed mt-1 line-clamp-2">
                      {image.description}
                    </p>

                  </div>

                </button>
              );
            })}

          </div>
        ) : (
          <div className="border border-[#e2d4c4] rounded-3xl p-12 text-center bg-[#fbf8f1]">

            <Camera className="w-9 h-9 text-amber-700 mx-auto" />

            <h3 className="font-serif font-bold text-lg text-amber-950 mt-3">
              No photographs available
            </h3>

            <p className="text-xs text-amber-900/60 mt-2">
              Photographic documentation for this category will be added
              as the conservation project progresses.
            </p>

          </div>
        )}

      </section>

{/* =====================================================
    IN THE NEWS
===================================================== */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">

  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">

    <div>

      <div className="flex items-center gap-2 text-amber-800">

        <Newspaper className="w-4 h-4" />

        <span className="text-[10px] uppercase tracking-[0.22em] font-bold">
          Media Coverage
        </span>

      </div>

      <h2 className="font-serif font-bold text-3xl text-amber-950 mt-2">
        In the News
      </h2>

      <p className="text-xs sm:text-sm text-amber-900/60 mt-3 max-w-2xl leading-relaxed">
        News reports and media coverage documenting the manuscript
        conservation initiative and the effort to safeguard the historic
        collection of Medhijan Shri Shri Gajala Satra.
      </p>

    </div>

  </div>


  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

    {newsItems.map(item => (

      <a
        key={item.id}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group bg-[#fbf8f1] border border-[#e3d5c4] rounded-2xl p-6 hover:border-amber-700/50 hover:shadow-lg transition-all"
      >

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-center gap-2">

            <div className="w-9 h-9 rounded-xl bg-amber-900/10 flex items-center justify-center text-amber-800">
              <Newspaper className="w-4 h-4" />
            </div>

            <div>

              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-800">
                {item.source}
              </p>

              <p className="text-[10px] text-amber-900/45 mt-0.5">
                {item.date}
              </p>

            </div>

          </div>


          <ExternalLink className="w-4 h-4 text-amber-700/50 group-hover:text-amber-800 transition-colors shrink-0" />

        </div>


        <h3 className="font-serif font-bold text-lg sm:text-xl text-amber-950 mt-5 group-hover:text-amber-800 transition-colors leading-snug">
          {item.title}
        </h3>


        <p className="text-xs text-amber-900/65 leading-relaxed mt-3">
          {item.description}
        </p>


        <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-amber-900">

          Read Coverage

          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />

        </div>

      </a>

    ))}

  </div>

</section>

      {/* =====================================================
          CONSERVATION LINK
      ===================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">

        <div className="bg-[#241a11] text-amber-100 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div className="max-w-2xl">

            <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold">
              Understand the Process
            </span>

            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-amber-50 mt-2">
              How Are the Manuscripts Being Conserved?
            </h2>

            <p className="text-xs sm:text-sm text-amber-200/70 leading-relaxed mt-3">
              Follow the complete journey from condition assessment and
              recovery through cleaning, stabilisation, digitisation and
              long-term archival preservation.
            </p>

          </div>

          <button
            onClick={() => onNavigate('conservation')}
            className="px-5 py-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 shrink-0"
          >
            Conservation Project
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </section>


      {/* =====================================================
          LIGHTBOX
      ===================================================== */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedImage(null)}
        >

          {/* Close */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
            aria-label="Close image"
          >
            <X className="w-5 h-5 text-white" />
          </button>


          {/* Previous */}
          {filteredImages.length > 1 && (
            <button
              onClick={e => {
                e.stopPropagation();
                handlePrevious();
              }}
              className="absolute left-3 sm:left-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 flex items-center justify-center transition-colors"
              aria-label="Previous image"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}


          {/* Next */}
          {filteredImages.length > 1 && (
            <button
              onClick={e => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 sm:right-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 flex items-center justify-center transition-colors"
              aria-label="Next image"
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          )}


          {/* Main image */}
          <div
            className="max-w-6xl w-full"
            onClick={e => e.stopPropagation()}
          >

            <div className="flex justify-center">

              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl"
              />

            </div>

            <div className="max-w-3xl mx-auto text-center pt-5">

              <span className="text-[9px] uppercase tracking-[0.2em] text-amber-400 font-bold">
                {selectedImage.category}
              </span>

              <h3 className="font-serif font-bold text-xl sm:text-2xl text-white mt-2">
                {selectedImage.title}
              </h3>

              <p className="text-xs sm:text-sm text-white/60 leading-relaxed mt-2">
                {selectedImage.description}
              </p>

              {(selectedImage.date || selectedImage.location) && (
                <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-[10px] text-white/40">

                  {selectedImage.date && (
                    <span>{selectedImage.date}</span>
                  )}

                  {selectedImage.location && (
                    <span>{selectedImage.location}</span>
                  )}

                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
};