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
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event, schema, table, filter }, callback)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, event, schema, table, filter, callback]);
}
