'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
  roomCode: string;
}

export function BottomNav({ roomCode }: BottomNavProps) {
  const pathname = usePathname();

  const items = [
    {
      href: `/room/${roomCode}`,
      label: 'Room',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" />
          <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" />
        </svg>
      ),
    },
    {
      href: `/room/${roomCode}/people`,
      label: 'People',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" />
          <circle cx="9" cy="7" r="4" stroke="currentColor" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" />
        </svg>
      ),
    },
    {
      href: `/room/${roomCode}/thoughts`,
      label: 'Thoughts',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      <div className="bg-white/90 backdrop-blur-xl border-t border-gray-100 px-2 pb-safe">
        <div className="flex items-center justify-around">
          {items.map((item) => {
            const isActive = pathname === item.href ||
              (item.href.includes('/people') && pathname.includes('/people')) ||
              (item.href.includes('/thoughts') && pathname.includes('/thoughts'));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-3 px-4 rounded-xl transition-all duration-200 min-w-[64px]
                  ${isActive
                    ? 'text-pink-400'
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-xs font-medium ${isActive ? 'text-pink-400' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-1 h-1 rounded-full bg-pink-400" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
