'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { getSupabaseClient } from '@/lib/supabase';
import { Room } from '@/types';
import { getMemberId } from '@/lib/utils';

export default function RoomReadyPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/join/${code}`
      : `https://askitout.app/join/${code}`;

  useEffect(() => {
    if (!code) return;

    const supabase = getSupabaseClient();
    let isMounted = true;
    let channelRef: ReturnType<typeof supabase.channel> | null = null;

    async function loadRoom() {
      const { data } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (!isMounted || !data) {
        if (!data) router.replace('/');
        return;
      }

      setRoom(data);

      const { count } = await supabase
        .from('members')
        .select('id', { count: 'exact', head: true })
        .eq('room_id', data.id);

      if (!isMounted) return;
      setMemberCount(count ?? 0);
      setLoading(false);

      const channel = supabase
        .channel(`room-members-${data.id}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'members',
            filter: `room_id=eq.${data.id}`,
          },
          () => {
            if (isMounted) setMemberCount((c) => c + 1);
          }
        )
        .subscribe();

      if (isMounted) {
        channelRef = channel;
      } else {
        supabase.removeChannel(channel);
      }
    }

    loadRoom();

    return () => {
      isMounted = false;
      if (channelRef) supabase.removeChannel(channelRef);
    };
  }, [code, router]);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function shareRoom() {
    if (navigator.share) {
      await navigator.share({
        title: `Join ${room?.name} on Ask It Out`,
        text: `Join the room and share anonymous thoughts! Code: ${code}`,
        url: joinUrl,
      });
    } else {
      copyCode();
    }
  }

  function goToRoom() {
    const memberId = getMemberId(code);
    if (memberId) {
      router.push(`/room/${code}/people`);
    } else {
      router.push(`/join/${code}`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen page-enter px-6">
      {/* Header */}
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

      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-1.5 mb-4">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-green-700">Room is Live</span>
        </div>
        <h1 className="text-3xl font-bold text-[#1C1C1E] mb-1">
          Your room is ready
        </h1>
        <p className="text-gray-500">
          Share the QR code or room code with your class.
        </p>
      </div>

      {/* QR Code Card */}
      <div className="card p-8 mb-6 flex flex-col items-center qr-entrance">
        <div className="w-full mb-6 text-center">
          <p className="font-bold text-[#1C1C1E] text-lg">{room?.name}</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="font-mono text-2xl font-bold tracking-[0.2em] text-pink-400">
              {code}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm mb-4">
          <QRCodeSVG
            value={joinUrl}
            size={200}
            bgColor="#FFFFFF"
            fgColor="#1C1C1E"
            level="M"
            includeMargin={false}
          />
        </div>

        <p className="text-xs text-gray-400 text-center">Scan to join this room</p>
      </div>

      {/* Participant Count */}
      <div className="card p-4 mb-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-sky-500">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" />
            <circle cx="9" cy="7" r="4" stroke="currentColor" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-gray-500">Participants joined</p>
          <p className="text-2xl font-bold text-[#1C1C1E]">{memberCount}</p>
        </div>
        <div className="ml-auto">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 pb-16">
        <div className="grid grid-cols-2 gap-3">
          <button
            id="share-room-btn"
            onClick={shareRoom}
            className="py-3 px-4 bg-pink-300 hover:bg-pink-400 text-white font-semibold text-sm rounded-xl transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" />
            </svg>
            Share
          </button>
          <button
            id="copy-code-btn"
            onClick={copyCode}
            className="py-3 px-4 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm rounded-xl transition-all duration-200 active:scale-[0.97] border border-gray-200 flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-500">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" />
                </svg>
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" />
                </svg>
                Copy Code
              </>
            )}
          </button>
        </div>

        <button
          id="enter-room-btn"
          onClick={goToRoom}
          className="w-full py-4 px-6 bg-[#1C1C1E] hover:bg-gray-800 text-white font-semibold text-base rounded-xl transition-all duration-200 active:scale-[0.97]"
        >
          Enter Room
        </button>
      </div>
    </main>
  );
}
