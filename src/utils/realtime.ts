import { useEffect } from 'react';
import { supabase } from '../supabase';

type PostgresEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface RealtimeConfig {
  channelName: string;
  event: PostgresEvent;
  schema: string;
  table: string;
  filter?: string;
  callback: (payload: any) => void;
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
    // TODO: Replace any-casts with concrete payload/filter types once Supabase typings are aligned.
    const channel = (supabase.channel(channelName) as any).on(
      'postgres_changes',
      { event, schema, table, filter },
      callback
    );
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, event, schema, table, filter, callback]);
}
