export type Role = 'admin' | 'user' | null;

export interface UserRow {
  id: string;
  username: string | null;
  email: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface ContestRow {
  id: string;
  name: string;
  current_round: number;
  finished: boolean;
  lobby_open: boolean;
  submission_open: boolean;
  start_time: string;
  price: number | null;
  created_at: string;
}

export interface ParticipantRow {
  id: string;
  contest_id: string;
  user_id: string;
  active: boolean;
  elimination_round: number | null;
}

export interface QuestionRow {
  id: string;
  contest_id: string;
  round: number;
  question: string;
  options: Record<string, string>;
  correct_option: string | null;
}

export interface AnswerRow {
  id: string;
  participant_id: string;
  contest_id: string;
  question_id: string;
  round: number;
  answer: string;
  timestamp: string;
}
