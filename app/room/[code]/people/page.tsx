'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import { Member } from '@/types';
import { getInitials, getAvatarColor, getMemberId } from '@/lib/utils';
import { BottomNav } from '@/components/ui/BottomNav';

export default function PeoplePage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [roomName, setRoomName] = useState('');
  const [search, setSearch] = useState('');
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;

    const memberId = getMemberId(code);
    if (!memberId) {
      router.replace(`/join/${code}`);
      return;
    }
    setMyMemberId(memberId);

    const supabase = getSupabaseClient();
    let isMounted = true;
    let channelRef: ReturnType<typeof supabase.channel> | null = null;

    async function load() {
      const { data: room } = await supabase
        .from('rooms')
        .select('id, name')
        .eq('code', code.toUpperCase())
        .single();

      if (!isMounted || !room) {
        if (!room) router.replace('/');
        return;
      }

      setRoomName(room.name);

      const { data: memberList } = await supabase
        .from('members')
        .select('*')
        .eq('room_id', room.id)
        .order('joined_at', { ascending: true });

      if (!isMounted) return;
      setMembers(memberList ?? []);
      setLoading(false);

      // Subscribe to new members
      const channel = supabase
        .channel(`people-${room.id}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'members',
            filter: `room_id=eq.${room.id}`,
          },
          (payload) => {
            if (!isMounted) return;
            setMembers((prev) => {
              if (prev.some((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new as Member];
            });
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

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const others = filtered.filter((m) => m.id !== myMemberId);
  const me = members.find((m) => m.id === myMemberId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-24 page-enter">
      {/* Header */}
      <div className="sticky top-0 bg-[#FAFAFA]/95 backdrop-blur-xl z-10 px-6 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {code}
            </p>
            <h1 className="text-xl font-bold text-[#1C1C1E]">{roomName}</h1>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-green-700">{members.length}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-3">Who do you want to tell something?</p>

        {/* Search */}
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
          >
            <circle cx="11" cy="11" r="8" stroke="currentColor" />
            <path d="m21 21-4.35-4.35" stroke="currentColor" />
          </svg>
          <input
            id="people-search"
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* People list */}
      <div className="px-6 pt-4">
        {others.length === 0 && !search && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="w-8 h-8 text-pink-300">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Waiting for others to join</p>
            <p className="text-xs text-gray-400 mt-1">Share the room code with your class</p>
          </div>
        )}

        {others.length === 0 && search && (
          <div className="text-center py-16">
            <p className="text-gray-500">No one found matching &ldquo;{search}&rdquo;</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {others.map((member, index) => {
            const colors = getAvatarColor(member.name);
            const initials = getInitials(member.name);
            return (
              <button
                key={member.id}
                id={`person-${member.id}`}
                onClick={() =>
                  router.push(`/room/${code}/send?to=${member.id}`)
                }
                className="person-row w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-pink-200 hover:bg-pink-50/30 active:scale-[0.98] transition-all duration-150 text-left"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1C1C1E] text-sm">{member.name}</p>
                  <p className="text-xs text-gray-400">Tap to send a thought</p>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-gray-300 flex-shrink-0"
                >
                  <path d="M9 18l6-6-6-6" stroke="currentColor" />
                </svg>
              </button>
            );
          })}
        </div>

        {/* Me — view my thoughts */}
        {me && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              You
            </p>
            <Link
              href={`/room/${code}/thoughts`}
              className="person-row w-full flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-sky-50 rounded-xl border border-pink-100 hover:border-pink-200 active:scale-[0.98] transition-all duration-150"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                style={{ backgroundColor: getAvatarColor(me.name).bg, color: getAvatarColor(me.name).text }}
              >
                {getInitials(me.name)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#1C1C1E] text-sm">{me.name} (You)</p>
                <p className="text-xs text-pink-400 font-medium">View your thoughts →</p>
              </div>
            </Link>
          </div>
        )}
      </div>

      <BottomNav roomCode={code} />
    </main>
  );
}
