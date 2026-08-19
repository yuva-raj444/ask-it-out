'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getSupabaseClient } from '@/lib/supabase';
import { generateRoomCode } from '@/lib/utils';

export default function CreateRoomPage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = roomName.trim();
    if (!name) {
      setError('Please enter a room name.');
      return;
    }

    setLoading(true);
    setError('');

    const supabase = getSupabaseClient();
    let code = generateRoomCode();

    // Retry if code collision (extremely rare)
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error: insertError } = await supabase.from('rooms').insert({
        code,
        name,
      });

      if (!insertError) {
        router.push(`/room/${code}`);
        return;
      }

      if (insertError.code === '23505') {
        // unique violation — try a new code
        code = generateRoomCode();
      } else {
        setError('Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
    }

    setError('Could not create room. Please try again.');
    setLoading(false);
  }

  return (
    <main className="min-h-screen page-enter">
      {/* Back nav */}
      <div className="px-6 pt-14 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" />
          </svg>
          Back
        </Link>
      </div>

      {/* Content */}
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1C1C1E] mb-2">
            Create a Room
          </h1>
          <p className="text-gray-500">
            Give your room a name and share the code with your class.
          </p>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-6">
          {/* Room name input */}
          <div>
            <Input
              id="room-name-input"
              label="Room Name"
              placeholder="e.g. CSE A — 2027"
              value={roomName}
              onChange={(e) => {
                setRoomName(e.target.value);
                setError('');
              }}
              maxLength={60}
              autoFocus
              autoComplete="off"
              error={error}
            />
            <p className="mt-2 text-xs text-gray-400">
              Examples: &ldquo;CSE B — 2026&rdquo;, &ldquo;Mech 3rd Year&rdquo;, &ldquo;Design Studio&rdquo;
            </p>
          </div>

          {/* Info card */}
          <div className="card p-4 bg-sky-50 border-sky-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-sky-600">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" />
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-sky-900 mb-0.5">How it works</p>
                <p className="text-xs text-sky-700 leading-relaxed">
                  You&apos;ll get a unique room code + QR code. Share it with your class and everyone can join and send anonymous thoughts.
                </p>
              </div>
            </div>
          </div>

          <Button
            id="create-room-submit"
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </Button>
        </form>
      </div>
    </main>
  );
}
