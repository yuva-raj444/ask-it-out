export type Gender = 'male' | 'female' | 'prefer_not_to_say';

export interface Room {
  id: string;
  code: string;
  name: string;
  created_at: string;
  expires_at: string;
}

export interface Member {
  id: string;
  room_id: string;
  session_id: string;
  name: string;
  gender: Gender;
  joined_at: string;
}

export interface Opinion {
  id: string;
  room_id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  created_at: string;
  // Joined fields
  sender?: Pick<Member, 'gender'>;
}

export interface MemberWithOpinion extends Member {
  opinion_count?: number;
}
