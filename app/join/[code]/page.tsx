'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getSupabaseClient } from '@/lib/supabase';
import { getSessionId, saveMemberId, getMemberId } from '@/lib/utils';
import { Gender } from '@/types';

export default function JoinRoomPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const router = useRouter();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [genderError, setGenderError] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomNotFound, setRoomNotFound] = useState(false);

  useEffect(() => {
    if (!code) return;

    // Check if already a member
    const existingMemberId = getMemberId(code);
    if (existingMemberId) {
      router.replace(`/room/${code}/people`);
      return;
    }

    async function checkRoom() {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('rooms')
        .select('name')
        .eq('code', code.toUpperCase())
        .single();

      if (!data) {
        setRoomNotFound(true);
      } else {
        setRoomName(data.name);
      }
    }
    checkRoom();
  }, [code, router]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    let valid = true;

    if (!name.trim()) {
      setNameError('Please enter your name.');
      valid = false;
    }
    if (!gender) {
      setGenderError('Please select a gender.');
      valid = false;
    }
    if (!valid) return;

    setLoading(true);
    const supabase = getSupabaseClient();
    const sessionId = getSessionId();

    const { data: room } = await supabase
      .from('rooms')
      .select('id')
      .eq('code', code.toUpperCase())
      .single();

    if (!room) {
      setNameError('Room not found.');
      setLoading(false);
      return;
    }

    const { data: member, error } = await supabase
      .from('members')
      .insert({
        room_id: room.id,
        session_id: sessionId,
        name: name.trim(),
        gender,
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('members')
          .select('id')
          .eq('room_id', room.id)
          .eq('session_id', sessionId)
          .single();
        if (existing) {
          saveMemberId(code, existing.id);
          router.push(`/room/${code}/people`);
          return;
        }
      }
      setNameError('Could not join room. Try again.');
      setLoading(false);
      return;
    }

    if (member) {
      saveMemberId(code, member.id);
      router.push(`/room/${code}/people`);
    }
  }

  if (roomNotFound) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 page-enter">
        <div className="text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="w-8 h-8 text-pink-400">
              <circle cx="12" cy="12" r="10" stroke="currentColor" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1C1C1E] mb-2">Room not found</h1>
          <p className="text-gray-500 mb-6">This room code doesn&apos;t exist or has expired.</p>
          <Link href="/join" className="text-pink-400 font-semibold hover:underline">
            Try a different code
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen page-enter px-6">
      <div className="pt-14 pb-6">
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

      <div className="mb-8">
        {roomName && (
          <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-pink-300" />
            <span className="text-xs font-semibold text-pink-700">{roomName}</span>
          </div>
        )}
        <h1 className="text-3xl font-bold text-[#1C1C1E] mb-2">Join Room</h1>
        <p className="text-gray-500">Enter your details to join and start sharing thoughts.</p>
      </div>

      <form onSubmit={handleJoin} className="flex flex-col gap-6">
        <Input
          id="join-name-input"
          label="Your Name"
          placeholder="e.g. Priya"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError('');
          }}
          maxLength={40}
          autoFocus
          autoComplete="given-name"
          error={nameError}
        />

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Gender</p>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'prefer_not_to_say', label: 'Prefer not to say' },
            ] as { value: Gender; label: string }[]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                id={`gender-${opt.value}`}
                onClick={() => {
                  setGender(opt.value);
                  setGenderError('');
                }}
                className={`gender-btn text-xs leading-tight ${gender === opt.value ? 'selected' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {genderError && (
            <p className="text-xs text-red-500 mt-1.5">{genderError}</p>
          )}
        </div>

        <div className="flex items-start gap-3 py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" />
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" />
          </svg>
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-700">Your name is never shown with your thoughts.</span>{' '}
            Recipients only see &ldquo;Anonymous · Gender&rdquo;.
          </p>
        </div>

        <Button
          id="join-room-submit"
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          {loading ? 'Joining...' : 'Join Room'}
        </Button>
      </form>
    </main>
  );
}
