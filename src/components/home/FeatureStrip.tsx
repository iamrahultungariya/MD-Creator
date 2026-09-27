import React from 'react';
import { Eye, FileText, Cloud, Moon, Laptop } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: Eye,
    title: 'Real-time Preview',
    description: 'See your changes instantly.'
  },
  {
    icon: FileText,
    title: 'Beautiful Templates',
    description: 'Start quickly with ready-to-use templates.'
  },
  {
    icon: Cloud,
    title: 'Export Anywhere',
    description: 'PDF, HTML, Markdown and more.'
  },
  {
    icon: Moon,
    title: 'Distraction Free',
    description: 'Focus on what matters — your words.'
  },
  {
    icon: Laptop,
    title: 'Works Everywhere',
    description: 'Use it on any device, anytime.'
  }
];

export const FeatureStrip: React.FC = () => {
  return (
    <section className="py-12 border-y border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 text-center">
          {HIGHLIGHTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className={`flex flex-col items-center group cursor-default ${
                  idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                {/* Rounded Icon Badge */}
                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 mb-3.5 group-hover:scale-110 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-all shadow-2xs">
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>
                {/* Title */}
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1 tracking-tight">
                  {item.title}
                </h3>
                {/* Description */}
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-[180px]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
