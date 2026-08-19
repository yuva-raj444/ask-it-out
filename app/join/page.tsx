'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getSupabaseClient } from '@/lib/supabase';
import { getSessionId, saveMemberId } from '@/lib/utils';
import { Gender } from '@/types';

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [nameError, setNameError] = useState('');
  const [genderError, setGenderError] = useState('');

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    let valid = true;

    if (!code.trim()) {
      setCodeError('Please enter the room code.');
      valid = false;
    }
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
    const upperCode = code.trim().toUpperCase();

    const { data: room } = await supabase
      .from('rooms')
      .select('id, name')
      .eq('code', upperCode)
      .single();

    if (!room) {
      setCodeError('Room not found. Check the code and try again.');
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
          saveMemberId(upperCode, existing.id);
          router.push(`/room/${upperCode}/people`);
          return;
        }
      }
      setNameError('Could not join. Please try again.');
      setLoading(false);
      return;
    }

    if (member) {
      saveMemberId(upperCode, member.id);
      router.push(`/room/${upperCode}/people`);
    }
  }

  return (
    <main className="min-h-screen page-enter px-6">
      <div className="pt-14 pb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" />
          </svg>
          Back
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1C1C1E] mb-2">Join a Room</h1>
        <p className="text-gray-500">Enter the room code shared with you.</p>
      </div>

      <form onSubmit={handleJoin} className="flex flex-col gap-6">
        <Input
          id="join-code-input"
          label="Room Code"
          placeholder="e.g. K7XM2P"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setCodeError('');
          }}
          maxLength={6}
          autoFocus
          autoComplete="off"
          className="font-mono tracking-widest text-center text-xl uppercase"
          error={codeError}
        />

        <Input
          id="join-name-input"
          label="Your Name"
          placeholder="e.g. Rahul"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError('');
          }}
          maxLength={40}
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
          {genderError && <p className="text-xs text-red-500 mt-1.5">{genderError}</p>}
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
          id="join-submit-btn"
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
