import { useEffect } from 'react';
import type { RealtimePostgresChangesPayload, RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase';

type PostgresEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface RealtimeConfig {
  channelName: string;
  event: PostgresEvent;
  schema: string;
  table: string;
  filter?: string;
  callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
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
    const typedChannel = channel as unknown as {
      on: (
        event: 'postgres_changes',
        opts: { event: PostgresEvent; schema: string; table: string; filter?: string },
        cb: RealtimeConfig['callback']
      ) => RealtimeChannel;
      subscribe: () => void;
    };

    typedChannel.on('postgres_changes', { event, schema, table, filter }, callback).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, event, schema, table, filter, callback]);
}
