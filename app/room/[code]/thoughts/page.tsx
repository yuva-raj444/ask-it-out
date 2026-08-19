'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import { getMemberId, formatGender, formatTime } from '@/lib/utils';
import { Opinion, Gender } from '@/types';
import { BottomNav } from '@/components/ui/BottomNav';

interface ThoughtWithSender extends Opinion {
  sender_gender: Gender;
}

function GenderBadge({ gender }: { gender: Gender }) {
  const label = formatGender(gender);
  const styles: Record<Gender, string> = {
    male: 'bg-sky-100 text-sky-700',
    female: 'bg-pink-100 text-pink-700',
    prefer_not_to_say: 'bg-gray-100 text-gray-600',
  };

  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[gender]}`}>
      {label}
    </span>
  );
}

export default function MyThoughtsPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const router = useRouter();
  const [thoughts, setThoughts] = useState<ThoughtWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [reported, setReported] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!code) return;

    const memberId = getMemberId(code);
    if (!memberId) {
      router.replace(`/join/${code}`);
      return;
    }

    const supabase = getSupabaseClient();
    let isMounted = true;
    let channelRef: ReturnType<typeof supabase.channel> | null = null;

    async function load() {
      const { data: opinions } = await supabase
        .from('opinions')
        .select(`*, sender:sender_id (gender)`)
        .eq('recipient_id', memberId)
        .order('created_at', { ascending: false });

      if (!isMounted) return;

      if (opinions) {
        setThoughts(
          opinions.map((o) => ({
            ...o,
            sender_gender: (o.sender as unknown as { gender: Gender })?.gender ?? 'prefer_not_to_say',
          }))
        );
      }

      setLoading(false);

      const channel = supabase
        .channel(`thoughts-${memberId}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'opinions',
            filter: `recipient_id=eq.${memberId}`,
          },
          async (payload) => {
            if (!isMounted) return;
            const { data: sender } = await supabase
              .from('members')
              .select('gender')
              .eq('id', payload.new.sender_id)
              .single();

            const newThought: ThoughtWithSender = {
              ...(payload.new as Opinion),
              sender_gender: (sender?.gender as Gender) ?? 'prefer_not_to_say',
            };

            if (isMounted) setThoughts((prev) => [newThought, ...prev]);
          }
        )
        .subscribe();

      if (isMounted) {
        channelRef = channel;
      } else {
        supabase.removeChannel(channel);
      }
    }

    load();

    return () => {
      isMounted = false;
      if (channelRef) supabase.removeChannel(channelRef);
    };
  }, [code, router]);

  function handleReport(id: string) {
    setReported((prev) => new Set([...prev, id]));
  }

  return (
    <main className="min-h-screen pb-28 page-enter">
      {/* Header */}
      <div className="sticky top-0 bg-[#FAFAFA]/95 backdrop-blur-xl z-10 px-6 pt-12 pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">What they think of you</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {thoughts.length} {thoughts.length === 1 ? 'thought' : 'thoughts'} received
        </p>
      </div>

      <div className="px-6 pt-6">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && thoughts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-50 to-sky-50 rounded-full flex items-center justify-center mb-5 border border-pink-100">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-pink-300">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#1C1C1E] mb-2">Nothing yet</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Maybe someone is still gathering the courage.
            </p>
          </div>
        )}

        {!loading && thoughts.length > 0 && (
          <div className="flex flex-col gap-4">
            {thoughts.map((thought, index) => (
              <div
                key={thought.id}
                className="thought-card card p-5"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="w-3.5 h-3.5 text-gray-500">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">Anonymous</span>
                    <span className="text-gray-300">·</span>
                    <GenderBadge gender={thought.sender_gender} />
                  </div>
                  <span className="text-xs text-gray-400">{formatTime(thought.created_at)}</span>
                </div>

                <div className="h-px bg-gray-100 mb-3" />

                <p className="text-[#1C1C1E] text-sm leading-relaxed font-medium">
                  &ldquo;{thought.message}&rdquo;
                </p>

                {!reported.has(thought.id) ? (
                  <button
                    id={`report-${thought.id}`}
                    onClick={() => handleReport(thought.id)}
                    className="mt-4 text-xs text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    Report
                  </button>
                ) : (
                  <p className="mt-4 text-xs text-green-500">Reported — thank you</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav roomCode={code} />
    </main>
  );
}
