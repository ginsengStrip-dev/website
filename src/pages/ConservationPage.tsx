import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Camera,
  CheckCircle2,
  Droplets,
  FileSearch,
  HeartHandshake,
  History,
  Library,
  Microscope,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Wind,
  Archive,
  Leaf,
  AlertTriangle,
} from 'lucide-react';

interface ConservationPageProps {
  onNavigate: (tab: string) => void;
}

export const ConservationPage: React.FC<ConservationPageProps> = ({
  onNavigate,
}) => {
  const conservationSteps = [
    {
      number: '01',
      icon: FileSearch,
      title: 'Condition Assessment',
      description:
        'Each manuscript and individual folio is examined to identify water damage, surface deposits, fungal activity, adhesion, structural weakness and other signs of deterioration.',
    },
    {
      number: '02',
      icon: Droplets,
      title: 'Recovery & Separation',
      description:
        'Affected folios are carefully separated and handled individually to reduce further tearing, adhesion and damage to already fragile manuscript surfaces.',
    },
    {
      number: '03',
      icon: Wind,
      title: 'Controlled Drying',
      description:
        'Moisture retained after flood exposure must be reduced carefully so that biological deterioration and further weakening of the manuscript material can be controlled.',
    },
    {
      number: '04',
      icon: Microscope,
      title: 'Cleaning & Treatment',
      description:
        'Conservation specialists clean and stabilise affected folios using appropriate conservation procedures while retaining as much of the original manuscript material as possible.',
    },
    {
      number: '05',
      icon: ScanLine,
      title: 'Digital Documentation',
      description:
        'Once sufficiently stabilised, manuscripts can be photographed or scanned to create high-quality digital representations of their surviving content.',
    },
    {
      number: '06',
      icon: Archive,
      title: 'Archival Preservation',
      description:
        'The resulting digital documents and descriptive metadata are organised within the manuscript archive for long-term management, study and controlled access.',
    },
  ];

  const risks = [
    {
      icon: Droplets,
      title: 'Water & Moisture',
      description:
        'Floodwater and prolonged humidity can weaken manuscript material, cause deformation and accelerate biological deterioration.',
    },
    {
      icon: AlertTriangle,
      title: 'Fungal Growth',
      description:
        'Persistently damp conditions provide a favourable environment for fungal growth that can stain, weaken and permanently damage manuscript folios.',
    },
    {
      icon: Leaf,
      title: 'Material Ageing',
      description:
        'Centuries-old manuscript materials naturally become more fragile with time and require increasingly careful handling and storage.',
    },
    {
      icon: BookOpen,
      title: 'Repeated Handling',
      description:
        'Frequent physical consultation can place additional stress on brittle folios, edges, bindings and manuscript surfaces.',
    },
  ];

  return (
    <div className="pb-20">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#2b2016] via-[#241a11] to-[#1a120b] text-amber-50">

        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:18px_18px]" />

        <div className="absolute -top-48 right-0 w-[600px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 relative z-10">

          <div className="max-w-4xl">

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-900/60 border border-amber-600/30 text-amber-200 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Conservation Initiative
            </div>

            <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl text-amber-50 leading-tight mt-6">
              Recovering the Past.
              <span className="block text-amber-300">
                Preserving It for the Future.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-amber-200/75 max-w-3xl leading-relaxed mt-6">
              The manuscript conservation initiative at Medhijan Shri Shri
              Gajala Satra seeks to safeguard centuries-old written heritage
              affected by age, environmental exposure and flood damage.
              Conservation specialists are working directly with fragile
              manuscript folios to stabilise surviving materials before they
              are systematically documented and digitally preserved.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">

              <button
                onClick={() => onNavigate('gallery')}
                className="px-5 py-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Camera className="w-4 h-4" />
                View Conservation Gallery
              </button>

              <button
                onClick={() => onNavigate('catalogue')}
                className="px-5 py-3 rounded-xl border border-amber-600/40 bg-white/[0.03] hover:bg-white/[0.07] text-amber-100 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Explore Manuscripts
              </button>

            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          WHY CONSERVATION BECAME NECESSARY
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <div className="relative">

            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-[#e7dccb] border border-[#d8c7b3] shadow-xl">
              <img
                src="/images/conservation/flood-damage-main.jpg"
                alt="Flood affected manuscripts at the Satra"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute bottom-5 left-5 right-5 bg-[#241a11]/95 backdrop-blur-md rounded-2xl p-4 border border-amber-700/30 text-amber-100">
              <p className="text-[10px] uppercase tracking-[0.18em] text-amber-400 font-bold">
                Conservation Record
              </p>

              <p className="text-xs text-amber-200/75 mt-1 leading-relaxed">
                Photographic documentation of manuscript condition forms an
                important part of the conservation process.
              </p>
            </div>

          </div>


          <div className="space-y-5">

            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-800">
              Why Intervention Was Necessary
            </span>

            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-amber-950 leading-tight">
              When Centuries of Heritage
              <span className="block">
                Became Vulnerable
              </span>
            </h2>

            <p className="text-sm text-amber-900/75 leading-relaxed">
              Manuscripts survive only when the material carrying their
              writing survives. For historic collections, moisture, insects,
              microorganisms, repeated handling and changes in the surrounding
              environment can gradually weaken materials that have already
              endured for generations.
            </p>

            <p className="text-sm text-amber-900/75 leading-relaxed">
              Flood exposure created an especially urgent conservation
              challenge for parts of the Satra&apos;s collection. Wet or damp
              folios can adhere to one another, deform, become structurally
              weak and develop biological deterioration if not treated
              appropriately.
            </p>

            <p className="text-sm text-amber-900/75 leading-relaxed">
              The immediate objective of conservation is therefore not to make
              an old manuscript appear new, but to stabilise the surviving
              original material, minimise further deterioration and preserve
              the manuscript&apos;s historical authenticity.
            </p>

          </div>

        </div>
      </section>


      {/* =========================================================
          RISKS TO MANUSCRIPTS
      ========================================================= */}
      <section className="bg-[#f3ebdf] border-y border-[#e2d3c1]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          <div className="max-w-2xl mx-auto text-center mb-10">

            <span className="text-[10px] uppercase tracking-[0.22em] text-amber-800 font-bold">
              Understanding Deterioration
            </span>

            <h2 className="font-serif text-3xl font-bold text-amber-950 mt-2">
              Threats to Historic Manuscripts
            </h2>

            <p className="text-xs sm:text-sm text-amber-900/65 mt-3 leading-relaxed">
              Manuscript preservation requires controlling several interacting
              sources of physical and environmental deterioration.
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {risks.map((risk) => {
              const Icon = risk.icon;

              return (
                <div
                  key={risk.title}
                  className="bg-[#fbf8f1] border border-[#e3d6c6] rounded-2xl p-6"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-900/10 flex items-center justify-center text-amber-800">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-serif font-bold text-base text-amber-950 mt-4">
                    {risk.title}
                  </h3>

                  <p className="text-xs text-amber-900/65 leading-relaxed mt-2">
                    {risk.description}
                  </p>
                </div>
              );
            })}

          </div>

        </div>
      </section>


      {/* =========================================================
          SANCHIPAT
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 items-center">

          <div className="bg-[#241a11] rounded-3xl p-8 sm:p-10 text-amber-100">

            <Leaf className="w-8 h-8 text-amber-400" />

            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold mt-5">
              Manuscript Material
            </p>

            <h2 className="font-serif text-3xl font-bold text-amber-50 mt-2">
              The Sanchipat Tradition
            </h2>

            <p className="text-sm text-amber-200/70 leading-relaxed mt-5">
              A significant part of Assam&apos;s manuscript heritage survives
              in the Sanchipat tradition. Such manuscripts represent not only
              written texts but also historical knowledge of material
              preparation, handwriting, illustration, transmission and
              preservation.
            </p>

            <p className="text-sm text-amber-200/70 leading-relaxed mt-4">
              Because every surviving folio is itself a historical object,
              conservation decisions must protect both the information written
              on the manuscript and the original material carrying it.
            </p>

          </div>


          <div className="grid grid-cols-2 gap-4">

            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#e8ddce] border border-[#dbcbb7]">
              <img
                src="/images/conservation/sanchipat-detail-01.jpg"
                alt="Detail of historic Sanchipat manuscript"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#e8ddce] border border-[#dbcbb7] mt-8">
              <img
                src="/images/conservation/sanchipat-detail-02.jpg"
                alt="Sanchipat manuscript folio"
                className="w-full h-full object-cover"
              />
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          CONSERVATION WORKFLOW
      ========================================================= */}
      <section className="bg-[#241a11] text-amber-100">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

          <div className="max-w-3xl mb-12">

            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Conservation Workflow
            </span>

            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-amber-50 mt-3">
              From Damaged Folio to Preserved Record
            </h2>

            <p className="text-sm text-amber-200/70 leading-relaxed mt-4">
              Conservation is a sequence of careful interventions. Each stage
              prepares the manuscript for the next while attempting to minimise
              unnecessary handling and preserve the integrity of the original.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {conservationSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="relative border border-amber-800/40 bg-white/[0.035] rounded-2xl p-6"
                >

                  <div className="flex items-center justify-between">

                    <div className="w-10 h-10 rounded-xl bg-amber-900/70 border border-amber-700/50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-amber-300" />
                    </div>

                    <span className="font-serif text-3xl text-amber-800/80">
                      {step.number}
                    </span>

                  </div>

                  <h3 className="font-serif text-lg font-bold text-amber-50 mt-5">
                    {step.title}
                  </h3>

                  <p className="text-xs text-amber-200/65 leading-relaxed mt-2">
                    {step.description}
                  </p>

                </div>
              );
            })}

          </div>

        </div>
      </section>


      {/* =========================================================
          PHOTO STORY
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">

          <div>
            <span className="text-[10px] uppercase tracking-[0.22em] text-amber-800 font-bold">
              Field Documentation
            </span>

            <h2 className="font-serif font-bold text-3xl text-amber-950 mt-2">
              Conservation in Progress
            </h2>
          </div>

          <button
            onClick={() => onNavigate('gallery')}
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 hover:text-amber-700"
          >
            View Full Gallery
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

          <div className="md:col-span-7 aspect-[16/10] rounded-3xl overflow-hidden bg-[#e5d8c7]">
            <img
              src="/images/conservation/conservation-work-01.jpg"
              alt="Manuscript conservation work in progress"
              className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
            />
          </div>

          <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-1 gap-4">

            <div className="rounded-3xl overflow-hidden bg-[#e5d8c7] min-h-[190px]">
              <img
                src="/images/conservation/conservation-work-02.jpg"
                alt="Manuscript folio being examined"
                className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
              />
            </div>

            <div className="rounded-3xl overflow-hidden bg-[#e5d8c7] min-h-[190px]">
              <img
                src="/images/conservation/conservation-work-03.jpg"
                alt="Conservation specialists working with manuscripts"
                className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
              />
            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          PHYSICAL VS DIGITAL
      ========================================================= */}
      <section className="bg-[#f3ebdf] border-y border-[#e1d3c3]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

          <div className="text-center max-w-3xl mx-auto mb-10">

            <span className="text-[10px] uppercase tracking-[0.22em] text-amber-800 font-bold">
              One Preservation Mission
            </span>

            <h2 className="font-serif font-bold text-3xl text-amber-950 mt-2">
              Physical Conservation + Digital Preservation
            </h2>

            <p className="text-sm text-amber-900/65 leading-relaxed mt-4">
              Digital preservation cannot replace the original manuscript, and
              physical conservation alone cannot provide unlimited access.
              Together, the two approaches provide a stronger preservation
              strategy.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-[#fbf8f1] border border-[#e3d6c5] rounded-3xl p-8">

              <HeartHandshake className="w-7 h-7 text-amber-800" />

              <h3 className="font-serif text-xl font-bold text-amber-950 mt-4">
                Preserve the Original
              </h3>

              <p className="text-xs text-amber-900/65 leading-relaxed mt-3">
                Physical conservation aims to stabilise the historic object
                itself and reduce the rate of further deterioration.
              </p>

              <div className="space-y-2 mt-5">

                {[
                  'Stabilisation of damaged material',
                  'Reduced physical handling',
                  'Condition documentation',
                  'Appropriate conservation treatment',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs text-amber-900/75"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                    {item}
                  </div>
                ))}

              </div>

            </div>


            <div className="bg-[#fbf8f1] border border-[#e3d6c5] rounded-3xl p-8">

              <ShieldCheck className="w-7 h-7 text-amber-800" />

              <h3 className="font-serif text-xl font-bold text-amber-950 mt-4">
                Preserve the Knowledge
              </h3>

              <p className="text-xs text-amber-900/65 leading-relaxed mt-3">
                Digitisation creates an additional documentary record while
                reducing the need to repeatedly handle fragile originals.
              </p>

              <div className="space-y-2 mt-5">

                {[
                  'High-quality digital documentation',
                  'Searchable manuscript metadata',
                  'Structured archival management',
                  'Scholarly and educational access',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs text-amber-900/75"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                    {item}
                  </div>
                ))}

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          COLLABORATION
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-10">

          <div>

            <div className="flex items-center gap-2 text-amber-800">
              <Library className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-[0.22em] font-bold">
                Collaborative Effort
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-amber-950 mt-3">
              Heritage Stewardship,
              <span className="block">
                Conservation and Technology
              </span>
            </h2>

            <p className="text-sm text-amber-900/70 leading-relaxed mt-5">
              The initiative brings together the custodians of Medhijan Shri
              Shri Gajala Satra with conservation expertise associated with
              Gauhati University and digital archival development by the
              Department of Computer Science and Hinton Research Lab,
              Gauhati University.
            </p>

            <p className="text-sm text-amber-900/70 leading-relaxed mt-4">
              This interdisciplinary approach allows manuscript conservation
              specialists, librarians, researchers and computing professionals
              to contribute to different stages of the same preservation
              mission.
            </p>

            <button
              onClick={() => onNavigate('about')}
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 hover:text-amber-700 mt-6"
            >
              Learn More About the Project
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>


          <div className="bg-[#241a11] rounded-3xl p-8 text-amber-100">

            <History className="w-7 h-7 text-amber-400" />

            <h3 className="font-serif text-xl font-bold text-amber-50 mt-4">
              Preservation Is a Continuing Process
            </h3>

            <p className="text-xs text-amber-200/70 leading-relaxed mt-3">
              Conservation does not end when an individual folio has been
              treated. Long-term preservation requires appropriate handling,
              storage, environmental care, documentation, periodic assessment
              and responsible digital management.
            </p>

            <p className="text-xs text-amber-200/70 leading-relaxed mt-4">
              The archive therefore documents not only manuscripts, but also
              the continuing effort required to ensure that they remain part
              of the cultural memory of future generations.
            </p>

          </div>

        </div>

      </section>


      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-gradient-to-r from-[#2b2016] to-[#1d150e] rounded-3xl p-8 sm:p-12 text-center text-amber-100 shadow-xl">

          <BookOpen className="w-8 h-8 text-amber-400 mx-auto" />

          <h2 className="font-serif font-bold text-3xl text-amber-50 mt-4">
            Explore the Heritage Being Preserved
          </h2>

          <p className="text-sm text-amber-200/70 max-w-2xl mx-auto leading-relaxed mt-4">
            Discover manuscripts from the Satra collection or follow their
            conservation journey through photographs documenting preservation
            work in progress.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-7">

            <button
              onClick={() => onNavigate('catalogue')}
              className="px-5 py-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Browse Manuscripts
            </button>

            <button
              onClick={() => onNavigate('gallery')}
              className="px-5 py-3 rounded-xl border border-amber-600/40 hover:bg-white/[0.05] text-amber-100 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Conservation Gallery
            </button>

          </div>

        </div>

      </section>

    </div>
  );
};