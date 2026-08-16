import React from 'react';
import {
  BookOpen,
  ExternalLink,
  Landmark,
  University,
  FlaskConical,
  Mail,
  MapPin,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  /*
   * Replace this with the actual Hinton Research Lab website URL.
   * Kept as a constant so it is easy to update later.
   */
  const HINTON_RL_URL = 'https://hintonresearchlab.github.io/';

  const GAUHATI_UNIVERSITY_URL = 'https://gauhati.ac.in';

  const KKHLIB_URL = "https://gauhati.ac.in/library/"

  const CS_DEPT_URL = "https://gauhati.ac.in/departments/computer-science/"

  return (
    <footer className="bg-[#241b12] text-[#e8ded0] border-t border-[#3d2f21] mt-16">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* =====================================================
              PROJECT IDENTITY
          ===================================================== */}
          <div className="space-y-4 lg:col-span-1">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-amber-800 text-amber-100 flex items-center justify-center border border-amber-700">
                <BookOpen className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-serif font-bold text-base text-amber-100 leading-tight">
                  Gajala Satra
                </h3>

                <p className="font-serif font-bold text-sm text-amber-300">
                  Manuscript Archive
                </p>
              </div>

            </div>

            <p className="text-xs text-amber-200/65 leading-relaxed">
              A digital archive supporting the conservation,
              documentation and preservation of the historic manuscript
              collection of Medhijan Shri Shri Gajala Satra,
              Sivasagar, Assam.
            </p>

            <div className="flex items-start gap-2 text-[11px] text-amber-200/55">

              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />

              <span>
                Medhijan Shri Shri Gajala Satra
                <br />
                Sivasagar, Assam, India
              </span>

            </div>

          </div>


          {/* =====================================================
              NAVIGATION
          ===================================================== */}
          <div className="space-y-4">

            <h4 className="font-serif font-bold text-sm text-amber-200">
              Explore
            </h4>

            <ul className="space-y-2.5 text-xs text-amber-200/70">

              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-100 transition-colors"
                >
                  Home
                </button>
              </li>

              <li>
                <button
                  onClick={() => onNavigate('catalogue')}
                  className="hover:text-amber-100 transition-colors"
                >
                  Manuscript Collection
                </button>
              </li>

              <li>
                <button
                  onClick={() => onNavigate('conservation')}
                  className="hover:text-amber-100 transition-colors"
                >
                  Conservation Project
                </button>
              </li>

              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-amber-100 transition-colors"
                >
                  Conservation Gallery
                </button>
              </li>

              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-amber-100 transition-colors"
                >
                  About the Initiative
                </button>
              </li>

            </ul>

          </div>


          {/* =====================================================
              PARTNER INSTITUTIONS
          ===================================================== */}
          <div className="space-y-4">

            <h4 className="font-serif font-bold text-sm text-amber-200">
              Project Partners
            </h4>

            <div className="space-y-4">

              {/* Gauhati University */}
              <a
                href={GAUHATI_UNIVERSITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3"
              >

                <div className="w-8 h-8 rounded-lg bg-amber-900/70 border border-amber-800 flex items-center justify-center shrink-0">
                  <University className="w-4 h-4 text-amber-300" />
                </div>

                <div>

                  <div className="flex items-center gap-1">

                    <p className="text-xs font-semibold text-amber-100 group-hover:text-amber-300 transition-colors">
                      Gauhati University
                    </p>

                    <ExternalLink className="w-3 h-3 text-amber-500" />

                  </div>

                  <p className="text-[10px] text-amber-200/50 mt-0.5">
                    Guwahati, Assam
                  </p>

                </div>

              </a>


              {/* Computer Science */}
              <a
                href={CS_DEPT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3"
              >

                <div className="w-8 h-8 rounded-lg bg-amber-900/70 border border-amber-800 flex items-center justify-center shrink-0">
                  <University className="w-4 h-4 text-amber-300" />
                </div>

                <div>

                  <div className="flex items-center gap-1">

                    <p className="text-xs font-semibold text-amber-100 group-hover:text-amber-300 transition-colors">
                      Department of Computer Science
                    </p>

                    <ExternalLink className="w-3 h-3 text-amber-500" />

                  </div>

                  <p className="text-[10px] text-amber-200/50 mt-0.5">
                    Gauhati University
                  </p>

                </div>

              </a>


              {/* Hinton Research Lab */}
              <a
                href={HINTON_RL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3"
              >

                <div className="w-8 h-8 rounded-lg bg-amber-900/70 border border-amber-800 flex items-center justify-center shrink-0">
                  <FlaskConical className="w-4 h-4 text-amber-300" />
                </div>

                <div>

                  <div className="flex items-center gap-1">

                    <p className="text-xs font-semibold text-amber-100 group-hover:text-amber-300 transition-colors">
                      Hinton Research Lab
                    </p>

                    <ExternalLink className="w-3 h-3 text-amber-500" />

                  </div>

                  <p className="text-[10px] text-amber-200/50 mt-0.5">
                    Digital archival development
                  </p>

                </div>

              </a>

               {/* KKH LIB */}
              <a
                href={KKHLIB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3"
              >

                <div className="w-8 h-8 rounded-lg bg-amber-900/70 border border-amber-800 flex items-center justify-center shrink-0">
                  <University className="w-4 h-4 text-amber-300" />
                </div>

                <div>

                  <div className="flex items-center gap-1">

                    <p className="text-xs font-semibold text-amber-100 group-hover:text-amber-300 transition-colors">
                      Krishna Kanta Handiqui Library
                    </p>

                    <ExternalLink className="w-3 h-3 text-amber-500" />

                  </div>

                  <p className="text-[10px] text-amber-200/50 mt-0.5">
                    Gauhati University
                  </p>

                </div>

              </a>

            </div>

          </div>


          {/* =====================================================
              ABOUT THE INITIATIVE
          ===================================================== */}
          <div className="space-y-4">

            <h4 className="font-serif font-bold text-sm text-amber-200">
              Preservation Initiative
            </h4>

            <p className="text-xs text-amber-200/65 leading-relaxed">
              The project brings together the custodians of the Satra,
              manuscript conservation expertise and digital technologies
              to protect fragile manuscripts and create a structured
              archival record for future generations.
            </p>

            <button
              onClick={() => onNavigate('about')}
              className="text-xs font-semibold text-amber-300 hover:text-amber-100 transition-colors"
            >
              Learn more about the project →
            </button>

            <div className="pt-2">

              <a
                href="mailto:cs@gauhati.ac.in"
                className="inline-flex items-center gap-2 text-[11px] text-amber-200/60 hover:text-amber-100 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Contact the project team
              </a>

            </div>

          </div>

        </div>


        {/* =====================================================
            BOTTOM BAR
        ===================================================== */}
        <div className="mt-12 pt-6 border-t border-amber-900/50">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <div>

              <p className="text-[11px] text-amber-200/50">
                © {new Date().getFullYear()} Medhijan Shri Shri Gajala
                Satra Manuscript Preservation Initiative.
              </p>

              <p className="text-[10px] text-amber-200/35 mt-1">
                Digital archive developed with support from the Department
                of Computer Science and Hinton Research Lab,
                Gauhati University.
              </p>

            </div>


            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-amber-200/50">

              <a
                href={GAUHATI_UNIVERSITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-100 transition-colors flex items-center gap-1"
              >
                Gauhati University
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={HINTON_RL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-100 transition-colors flex items-center gap-1"
              >
                Hinton Research Lab
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => onNavigate('admin-login')}
                className="hover:text-amber-100 transition-colors"
              >
                Administrator
              </button>

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
};