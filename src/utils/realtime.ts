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
    const channel = supabase.channel(channelName);
    channel.on(
      'postgres_changes',
      { event, schema, table, filter },
      callback as (payload: unknown) => void
    );
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, event, schema, table, filter, callback]);
}
