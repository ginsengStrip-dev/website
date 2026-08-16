import React from 'react';
import {
  ArrowRight,
  Archive,
  BookOpen,
  Camera,
  Database,
  HeartHandshake,
  Landmark,
  Library,
  ScanLine,
  ShieldCheck,
  Sparkles,
  University,
  Users,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate,
}) => {
  return (
    <div className="pb-20">

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#2b2016] via-[#241a11] to-[#1b130c] text-amber-50">

        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:18px_18px]" />

        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-amber-500/10 blur-[140px] rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 relative z-10 text-center">

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-900/60 border border-amber-600/30 text-amber-200 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            About the Initiative
          </div>

          <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl text-amber-50 leading-tight mt-6">
            Preserving the Manuscript Heritage of
            <span className="block text-amber-300 mt-2">
              Medhijan Shri Shri Gajala Satra
            </span>
          </h1>

          <p className="text-sm sm:text-base text-amber-200/75 max-w-3xl mx-auto leading-relaxed mt-6">
            A collaborative initiative bringing together heritage stewardship,
            manuscript conservation and digital technology to safeguard the
            centuries-old manuscript collection of Medhijan Shri Shri Gajala
            Satra, Sivasagar, Assam.
          </p>

        </div>
      </section>


      {/* =====================================================
          ABOUT THE SATRA
      ===================================================== */}
      {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <div className="space-y-5">

            <div className="flex items-center gap-2 text-amber-800">
              <Landmark className="w-4 h-4" />

              <span className="text-[10px] uppercase tracking-[0.22em] font-bold">
                The Heritage Institution
              </span>
            </div>

            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-amber-950 leading-tight">
              Medhijan Shri Shri
              <span className="block">
                Gajala Satra
              </span>
            </h2>

            <p className="text-sm text-amber-900/75 leading-relaxed">
              Medhijan Shri Shri Gajala Satra in Sivasagar is the custodian
              of a historic manuscript collection representing generations
              of Assam&apos;s literary, religious, cultural and intellectual
              traditions.
            </p>

            <p className="text-sm text-amber-900/75 leading-relaxed">
              These manuscripts are not merely carriers of written text.
              Their materials, scripts, handwriting, physical construction
              and history of transmission are themselves part of the
              cultural heritage represented by the collection.
            </p>

            <p className="text-sm text-amber-900/75 leading-relaxed">
              Preserving the collection therefore requires both protection
              of the surviving physical manuscripts and careful documentation
              of the knowledge that they contain.
            </p>

          </div>


          <div className="relative">

            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-[#e7dccb] border border-[#d8c7b4] shadow-xl">

              <img
                src="/images/satra/satra-main.jpg"
                alt="Medhijan Shri Shri Gajala Satra"
                className="w-full h-full object-cover"
              />

            </div>

            <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:w-[70%] bg-[#241a11]/95 backdrop-blur-md text-amber-100 rounded-2xl p-5 border border-amber-700/30 shadow-xl">

              <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold">
                Heritage Collection
              </p>

              <p className="font-serif font-bold text-sm text-amber-50 mt-1">
                Medhijan Shri Shri Gajala Satra
              </p>

              <p className="text-[11px] text-amber-200/65 mt-1">
                Sivasagar, Assam
              </p>

            </div>

          </div>

        </div>
      </section> */}


      {/* =====================================================
          WHY THE PROJECT EXISTS
      ===================================================== */}
      <section className="bg-[#f3ebdf] border-y border-[#e1d3c3]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          <div className="max-w-3xl mx-auto text-center">

            <span className="text-[10px] uppercase tracking-[0.22em] text-amber-800 font-bold">
              Why This Project Exists
            </span>

            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-amber-950 mt-3">
              Protecting Fragile Knowledge
            </h2>

            <p className="text-sm text-amber-900/65 leading-relaxed mt-5">
              Centuries-old manuscripts face continuous risks from ageing,
              moisture, biological deterioration, repeated handling and
              environmental change. Recent flood exposure increased the
              vulnerability of parts of the Satra&apos;s collection, making
              conservation intervention especially important.
            </p>

            <p className="text-sm text-amber-900/65 leading-relaxed mt-4">
              The preservation initiative addresses this challenge through
              two complementary approaches: conserving the physical originals
              and creating structured digital records that can support future
              study, documentation and access.
            </p>

          </div>

        </div>
      </section>


      {/* =====================================================
          CORE OBJECTIVES
      ===================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="text-center max-w-3xl mx-auto mb-10">

          <span className="text-[10px] uppercase tracking-[0.22em] text-amber-800 font-bold">
            Preservation Objectives
          </span>

          <h2 className="font-serif font-bold text-3xl text-amber-950 mt-2">
            What the Initiative Seeks to Achieve
          </h2>

        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          <div className="bg-[#fbf8f1] border border-[#e4d7c7] rounded-2xl p-6">

            <HeartHandshake className="w-7 h-7 text-amber-800" />

            <h3 className="font-serif font-bold text-lg text-amber-950 mt-4">
              Conserve the Originals
            </h3>

            <p className="text-xs text-amber-900/65 leading-relaxed mt-2">
              Support the stabilisation and responsible handling of damaged
              and fragile manuscript materials.
            </p>

          </div>


          <div className="bg-[#fbf8f1] border border-[#e4d7c7] rounded-2xl p-6">

            <ScanLine className="w-7 h-7 text-amber-800" />

            <h3 className="font-serif font-bold text-lg text-amber-950 mt-4">
              Digitise the Collection
            </h3>

            <p className="text-xs text-amber-900/65 leading-relaxed mt-2">
              Create high-quality digital representations that document
              surviving manuscript content and physical characteristics.
            </p>

          </div>


          <div className="bg-[#fbf8f1] border border-[#e4d7c7] rounded-2xl p-6">

            <Archive className="w-7 h-7 text-amber-800" />

            <h3 className="font-serif font-bold text-lg text-amber-950 mt-4">
              Build a Digital Archive
            </h3>

            <p className="text-xs text-amber-900/65 leading-relaxed mt-2">
              Organise manuscripts, metadata and digital documents within
              a structured archival environment.
            </p>

          </div>


          <div className="bg-[#fbf8f1] border border-[#e4d7c7] rounded-2xl p-6">

            <BookOpen className="w-7 h-7 text-amber-800" />

            <h3 className="font-serif font-bold text-lg text-amber-950 mt-4">
              Improve Access
            </h3>

            <p className="text-xs text-amber-900/65 leading-relaxed mt-2">
              Allow available manuscripts to be consulted digitally while
              reducing unnecessary handling of fragile originals.
            </p>

          </div>


          <div className="bg-[#fbf8f1] border border-[#e4d7c7] rounded-2xl p-6">

            <Library className="w-7 h-7 text-amber-800" />

            <h3 className="font-serif font-bold text-lg text-amber-950 mt-4">
              Support Scholarship
            </h3>

            <p className="text-xs text-amber-900/65 leading-relaxed mt-2">
              Provide a foundation for research in manuscript studies,
              history, language, literature and the digital humanities.
            </p>

          </div>


          <div className="bg-[#fbf8f1] border border-[#e4d7c7] rounded-2xl p-6">

            <ShieldCheck className="w-7 h-7 text-amber-800" />

            <h3 className="font-serif font-bold text-lg text-amber-950 mt-4">
              Preserve for the Future
            </h3>

            <p className="text-xs text-amber-900/65 leading-relaxed mt-2">
              Establish a sustainable documentary record that can continue
              to evolve as conservation and digitisation progress.
            </p>

          </div>

        </div>
      </section>


      {/* =====================================================
          COLLABORATION
      ===================================================== */}
      <section className="bg-[#241a11] text-amber-100">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

          <div className="max-w-3xl mb-10">

            <span className="text-[10px] uppercase tracking-[0.22em] text-amber-400 font-bold">
              Institutional Collaboration
            </span>

            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-amber-50 mt-3">
              Bringing Heritage, Conservation
              <span className="block">
                and Computing Together
              </span>
            </h2>

            <p className="text-sm text-amber-200/70 leading-relaxed mt-4">
              The project is built around collaboration between the
              custodians of the Satra&apos;s manuscript heritage and academic,
              conservation and technological expertise associated with
              Gauhati University.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* SATRA */}
            <div className="border border-amber-800/40 bg-white/[0.035] rounded-2xl p-6">

              <Landmark className="w-7 h-7 text-amber-400" />

              <h3 className="font-serif font-bold text-lg text-amber-50 mt-4">
                Medhijan Shri Shri Gajala Satra
              </h3>

              <p className="text-xs text-amber-200/65 leading-relaxed mt-2">
                Custodian of the manuscript collection and the cultural
                institution at the centre of the preservation initiative.
              </p>

            </div>


            {/* CONSERVATION */}
            <div className="border border-amber-800/40 bg-white/[0.035] rounded-2xl p-6">

              <Library className="w-7 h-7 text-amber-400" />

              <h3 className="font-serif font-bold text-lg text-amber-50 mt-4">
                Manuscript Conservation Expertise
              </h3>

              <p className="text-xs text-amber-200/65 leading-relaxed mt-2">
                Conservation and manuscript specialists associated with
                Gauhati University contribute expertise in the assessment,
                treatment and preservation of fragile manuscript materials.
              </p>

            </div>


            {/* COMPUTER SCIENCE */}
            <div className="border border-amber-800/40 bg-white/[0.035] rounded-2xl p-6">

              <University className="w-7 h-7 text-amber-400" />

              <h3 className="font-serif font-bold text-lg text-amber-50 mt-4">
                Digital Archival Development
              </h3>

              <p className="text-xs text-amber-200/65 leading-relaxed mt-2">
                The Department of Computer Science and Hinton Research Lab,
                Gauhati University support the design and development of
                the digital manuscript archive and related technological
                infrastructure.
              </p>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          ROLE OF HINTON RL & CS
      ===================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          <div>

            <div className="flex items-center gap-2 text-amber-800">
              <University className="w-4 h-4" />

              <span className="text-[10px] uppercase tracking-[0.22em] font-bold">
                Digital Technology Partner
              </span>
            </div>

            <h2 className="font-serif font-bold text-3xl text-amber-950 mt-3">
              Department of Computer Science
              <span className="block">
                & Hinton Research Lab
              </span>
            </h2>

            <p className="text-sm text-amber-900/70 leading-relaxed mt-5">
              The digital component of the project is being developed to
              provide a structured platform for documenting, cataloguing
              and accessing digitised manuscript material.
            </p>

            <p className="text-sm text-amber-900/70 leading-relaxed mt-4">
              Beyond its immediate archival purpose, the platform can also
              provide a foundation for future computational research on
              historical documents, including document image analysis,
              manuscript restoration, script recognition, optical character
              recognition, metadata extraction and intelligent search.
            </p>

          </div>


          <div className="bg-[#f3ebdf] rounded-3xl p-7 border border-[#e0d1bf]">

            <h3 className="font-serif font-bold text-lg text-amber-950">
              Digital Archive Functions
            </h3>

            <div className="space-y-4 mt-5">

              <div className="flex items-start gap-3">

                <Database className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />

                <div>
                  <p className="text-xs font-bold text-amber-950">
                    Structured Storage
                  </p>

                  <p className="text-[11px] text-amber-900/60 leading-relaxed mt-1">
                    Manuscript records, descriptive metadata and digital
                    documents are managed within a structured database system.
                  </p>
                </div>

              </div>


              <div className="flex items-start gap-3">

                <BookOpen className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />

                <div>
                  <p className="text-xs font-bold text-amber-950">
                    Browser-Based Reading
                  </p>

                  <p className="text-[11px] text-amber-900/60 leading-relaxed mt-1">
                    Available digitised manuscripts can be inspected directly
                    through the web interface without requiring specialised
                    local software.
                  </p>
                </div>

              </div>


              <div className="flex items-start gap-3">

                <ShieldCheck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />

                <div>
                  <p className="text-xs font-bold text-amber-950">
                    Controlled Management
                  </p>

                  <p className="text-[11px] text-amber-900/60 leading-relaxed mt-1">
                    Administrative tools support the controlled creation,
                    updating and publication of manuscript records.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          DIGITAL HUMANITIES
      ===================================================== */}
      <section className="bg-[#f3ebdf] border-y border-[#e2d4c3]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          <div className="max-w-4xl mx-auto text-center">

            <Users className="w-8 h-8 text-amber-800 mx-auto" />

            <span className="text-[10px] uppercase tracking-[0.22em] text-amber-800 font-bold block mt-4">
              Looking Ahead
            </span>

            <h2 className="font-serif font-bold text-3xl text-amber-950 mt-2">
              A Foundation for Digital Humanities Research
            </h2>

            <p className="text-sm text-amber-900/65 leading-relaxed mt-5">
              As the collection grows, the digital archive can support new
              forms of interdisciplinary scholarship involving historians,
              linguists, manuscript specialists, librarians, computer
              scientists and researchers in the digital humanities.
            </p>

            <p className="text-sm text-amber-900/65 leading-relaxed mt-4">
              Future extensions may include enhanced manuscript search,
              handwritten text recognition, script identification,
              computational restoration, metadata assistance and other
              technologies that make historic collections easier to study
              without compromising the preservation of the originals.
            </p>

          </div>

        </div>
      </section>


      {/* =====================================================
          ACCESS PHILOSOPHY
      ===================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="bg-[#241a11] text-amber-100 rounded-3xl p-8 sm:p-12 shadow-xl">

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">

            <div className="max-w-3xl">

              <span className="text-[10px] uppercase tracking-[0.22em] text-amber-400 font-bold">
                Access & Preservation
              </span>

              <h2 className="font-serif font-bold text-3xl text-amber-50 mt-2">
                Making Heritage Accessible Responsibly
              </h2>

              <p className="text-sm text-amber-200/70 leading-relaxed mt-4">
                Digital access can reduce unnecessary handling of fragile
                originals while allowing scholars, students and interested
                readers to explore available manuscript records. Access to
                individual materials can be provided in accordance with the
                permissions and preservation requirements established for
                the collection.
              </p>

            </div>

            <button
              onClick={() => onNavigate('catalogue')}
              className="px-6 py-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 shrink-0"
            >
              Explore Manuscripts
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>
      </section>


      {/* =====================================================
          PROJECT PATHWAYS
      ===================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <button
            onClick={() => onNavigate('conservation')}
            className="group text-left bg-[#fbf8f1] border border-[#e3d5c4] rounded-3xl p-7 hover:border-amber-700/50 hover:shadow-lg transition-all"
          >

            <HeartHandshake className="w-7 h-7 text-amber-800" />

            <h3 className="font-serif font-bold text-xl text-amber-950 mt-4">
              The Conservation Project
            </h3>

            <p className="text-xs text-amber-900/65 leading-relaxed mt-2">
              Learn how damaged manuscripts are assessed, cleaned,
              stabilised, documented and prepared for long-term preservation.
            </p>

            <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 mt-5">
              Learn More
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>

          </button>


          <button
            onClick={() => onNavigate('gallery')}
            className="group text-left bg-[#fbf8f1] border border-[#e3d5c4] rounded-3xl p-7 hover:border-amber-700/50 hover:shadow-lg transition-all"
          >

            <Camera className="w-7 h-7 text-amber-800" />

            <h3 className="font-serif font-bold text-xl text-amber-950 mt-4">
              Conservation Gallery
            </h3>

            <p className="text-xs text-amber-900/65 leading-relaxed mt-2">
              View photographs documenting the Satra, its manuscripts,
              conservation work and the continuing preservation journey.
            </p>

            <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 mt-5">
              View Gallery
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>

          </button>

        </div>

      </section>


      {/* =====================================================
          ATTRIBUTION
      ===================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">

        <div className="border-t border-amber-200/80 pt-8 text-center">

          <p className="text-[11px] sm:text-xs text-amber-900/55 max-w-3xl mx-auto leading-relaxed">
            A manuscript preservation and digital archival initiative centred
            on the collection of Medhijan Shri Shri Gajala Satra, with
            conservation expertise associated with Gauhati University and
            digital archive development by the Department of Computer Science
            and Hinton Research Lab, Gauhati University.
          </p>

        </div>

      </section>

    </div>
  );
};