import { useEffect } from 'react';
import { supabase } from '../supabase';

type PostgresEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface RealtimeConfig {
  channelName: string;
  event: PostgresEvent;
  schema: string;
  table: string;
  filter?: string;
  callback: (payload: unknown) => void;
}

export function useRealtime({
  channelName,
  event,
  schema,
  table,
  filter,
  callback,
}: RealtimeConfig) {
  useEffect(() => {
    // Supabase JS types don't expose postgres_changes on channel in this setup; cast to any.
    const channel = supabase.channel(channelName);
    (channel as any)
      .on('postgres_changes', { event, schema, table, filter }, callback)
      .subscribe();

    return () => {
      supabase.removeChannel(channel as any);
    };
  }, [channelName, event, schema, table, filter, callback]);
}
