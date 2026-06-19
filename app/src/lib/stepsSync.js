import { supabase } from './supabase';

const today = () => new Date().toISOString().split('T')[0];

export const syncSteps = async (steps) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { error } = await supabase
    .from('steps_log')
    .upsert({
      user_id: session.user.id,
      date: today(),
      steps,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,date',
    });

  if (error) console.log('sync error:', error.message);
};

  export const backfillSteps = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setDate(now.getDate() - i);
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setDate(now.getDate() - i);
    end.setHours(23, 59, 59, 999);

    const capped = end > now ? now : end;

    try {
      const { Pedometer } = await import('expo-sensors');
      const result = await Pedometer.getStepCountAsync(start, capped);

      const dateStr = start.toISOString().split('T')[0];

      await supabase
        .from('steps_log')
        .upsert({
          user_id: session.user.id,
          date: dateStr,
          steps: result.steps,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,date',
        });
    } catch (e) {
      console.log('backfill error for day', i, e.message);
    }
  }
};