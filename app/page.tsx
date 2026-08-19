'use client';

import Link from 'next/link';

const PREVIEW_THOUGHTS = [
  { text: "You're actually really fun to talk to.", gender: 'Female', delay: '0s' },
  { text: "You always know how to lighten the mood.", gender: 'Male', delay: '1.5s' },
  { text: "Your presentations are always the best.", gender: 'Female', delay: '0.75s' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 pt-14 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl font-bold tracking-tight text-[#1C1C1E]">
            Ask It Out
          </span>
          <span className="w-2 h-2 rounded-full bg-pink-300 mt-0.5" />
        </div>
        <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">
          For College Students
        </p>
      </header>

      {/* Hero Section */}
      <section className="px-6 flex-1">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#1C1C1E] leading-[1.15] mb-4">
            What do they{' '}
            <span className="gradient-text">really</span>{' '}
            think about you?
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Say something you wouldn&apos;t normally say out loud. Completely anonymous.
          </p>
        </div>

        {/* Preview Cards */}
        <div className="relative mb-12 h-52">
          {PREVIEW_THOUGHTS.map((thought, i) => (
            <div
              key={i}
              className="float-card absolute card p-4 w-[85%]"
              style={{
                top: `${i * 30}px`,
                left: i % 2 === 0 ? '0' : '15%',
                zIndex: 3 - i,
                animationDelay: thought.delay,
                opacity: 1 - i * 0.12,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-pink-300" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Anonymous · {thought.gender}
                </span>
              </div>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                &ldquo;{thought.text}&rdquo;
              </p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 pb-16">
          <Link
            href="/create"
            id="create-room-btn"
            className="w-full py-4 px-6 bg-pink-300 hover:bg-pink-400 text-white font-semibold text-base rounded-xl text-center transition-all duration-200 active:scale-[0.97] shadow-sm"
          >
            Create a Room
          </Link>
          <Link
            href="/join"
            id="join-room-btn"
            className="w-full py-4 px-6 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-base rounded-xl text-center transition-all duration-200 active:scale-[0.97] border border-gray-200 hover:border-pink-300"
          >
            Join a Room
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 pb-8">
          Names are never revealed with thoughts 🔒
        </p>
      </section>
    </main>
  );
}
