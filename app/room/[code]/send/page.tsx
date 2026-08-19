'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getSupabaseClient } from '@/lib/supabase';
import { getMemberId, getInitials, getAvatarColor } from '@/lib/utils';
import { Member } from '@/types';
import { BottomNav } from '@/components/ui/BottomNav';

function SendThoughtContent({ code }: { code: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipientId = searchParams.get('to');

  const [recipient, setRecipient] = useState<Member | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const memberId = getMemberId(code);
    if (!memberId) {
      router.replace(`/join/${code}`);
      return;
    }

    if (!recipientId) {
      router.replace(`/room/${code}/people`);
      return;
    }

    async function loadRecipient() {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('members')
        .select('*')
        .eq('id', recipientId)
        .single();

      if (!data) {
        router.replace(`/room/${code}/people`);
        return;
      }

      setRecipient(data);
    }

    loadRecipient();
  }, [code, recipientId, router]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setError('Please write something before sending.');
      return;
    }

    setLoading(true);
    setError('');

    const supabase = getSupabaseClient();
    const myMemberId = getMemberId(code)!;

    const { error: sendError } = await supabase.from('opinions').insert({
      room_id: recipient?.room_id,
      sender_id: myMemberId,
      recipient_id: recipientId,
      message: trimmed,
    });

    if (sendError) {
      setError('Failed to send. Please try again.');
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  const colors = recipient ? getAvatarColor(recipient.name) : { bg: '#FCE7F3', text: '#9D174D' };

  if (sent) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 page-enter">
        <div className="text-center max-w-xs">
          <div className="success-check w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-pink-400">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2">Sent.</h2>
          <p className="text-gray-500 leading-relaxed mb-2">
            Your thought is now waiting for{' '}
            <span className="font-semibold text-[#1C1C1E]">{recipient?.name}</span>.
          </p>
          <p className="text-sm text-gray-400 mb-10">
            They&apos;ll see &ldquo;Anonymous&rdquo; — your name stays hidden.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              id="send-another-btn"
              onClick={() => {
                setMessage('');
                setSent(false);
              }}
              className="w-full py-3 px-6 bg-pink-300 hover:bg-pink-400 text-white font-semibold rounded-xl transition-all active:scale-[0.97]"
            >
              Send Another
            </button>
            <Link
              href={`/room/${code}/people`}
              className="w-full py-3 px-6 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl text-center transition-all hover:border-pink-300 active:scale-[0.97]"
            >
              Back to People
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 page-enter">
      <div className="px-6 pt-12 pb-6">
        <Link
          href={`/room/${code}/people`}
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium mb-6"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" />
          </svg>
          People
        </Link>

        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-pink-300" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Anonymous Thought
          </span>
        </div>
        <h1 className="text-3xl font-bold text-[#1C1C1E]">
          Tell {recipient?.name ?? '...'}
        </h1>
      </div>

      {recipient && (
        <div className="mx-6 mb-6 card p-4 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-base font-bold"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {getInitials(recipient.name)}
          </div>
          <div>
            <p className="font-bold text-[#1C1C1E]">{recipient.name}</p>
            <p className="text-xs text-gray-400">Your message will be sent anonymously</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="px-6 flex flex-col gap-5">
        <Textarea
          id="thought-textarea"
          label="Your thought"
          placeholder={`Write something honest for ${recipient?.name ?? 'them'}...`}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setError('');
          }}
          maxLength={300}
          currentLength={message.length}
          rows={6}
          error={error}
          autoFocus
        />

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
            <circle cx="12" cy="12" r="10" stroke="currentColor" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" />
          </svg>
          <span>Only your gender will be shown. Your name stays anonymous.</span>
        </div>

        <Button
          id="send-thought-btn"
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
          disabled={!message.trim()}
        >
          {loading ? 'Sending...' : 'Send Anonymously'}
        </Button>
      </form>

      <BottomNav roomCode={code} />
    </main>
  );
}

export default function SendThoughtPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SendThoughtContent code={code} />
    </Suspense>
  );
}
