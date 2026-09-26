import React from 'react';

export const BentoCalmerCard: React.FC = () => {
  return (
    <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-[0_4px_30px_-6px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden flex flex-col sm:flex-row items-stretch transition-all group">
      {/* Left Photo */}
      <div className="sm:w-1/2 relative min-h-[180px] sm:min-h-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <img
          src="https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80"
          alt="Clean aesthetic workspace desk with laptop and plant"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent via-transparent to-white/20 dark:to-neutral-900/40 pointer-events-none" />
      </div>

      {/* Right Content */}
      <div className="sm:w-1/2 p-6 sm:p-7 flex flex-col justify-center">
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-950 dark:text-white leading-snug">
          A calmer way <br />
          to create.
        </h3>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mt-3">
          Whether it&apos;s school, work or personal projects — MD Writer helps you write, organize and share your ideas beautifully.
        </p>
      </div>
    </div>
  );
};
