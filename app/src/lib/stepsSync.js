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