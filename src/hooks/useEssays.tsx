import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface Essay {
  id: string;
  user_id: string;
  school_id: string | null;
  title: string;
  prompt: string | null;
  content: string | null;
  status: string | null;
  ai_feedback: any;
  created_at: string;
  updated_at: string;
}

export function useEssays(targetUserId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = targetUserId || user?.id;

  useEffect(() => {
    if (userId) {
      fetchEssays();
    }
  }, [userId]);

  const fetchEssays = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('essays')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setEssays(data || []);
    } catch (error) {
      console.error('Error fetching essays:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEssay = async (title: string, prompt?: string, schoolId?: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('essays')
        .insert({
          user_id: user.id,
          title,
          prompt: prompt || null,
          school_id: schoolId || null,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      setEssays(prev => [data, ...prev]);
      toast({ title: "Essay draft created" });
      return { data, error: null };
    } catch (error) {
      toast({ title: "Error creating essay", variant: "destructive" });
      return { error };
    }
  };

  const updateEssay = async (id: string, updates: Partial<Essay>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('essays')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setEssays(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
      toast({ title: "Essay updated" });
      return { error: null };
    } catch (error) {
      toast({ title: "Error updating essay", variant: "destructive" });
      return { error };
    }
  };

  const deleteEssay = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('essays')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setEssays(prev => prev.filter(e => e.id !== id));
      toast({ title: "Essay deleted" });
      return { error: null };
    } catch (error) {
      toast({ title: "Error deleting essay", variant: "destructive" });
      return { error };
    }
  };

  return {
    essays,
    loading,
    createEssay,
    updateEssay,
    deleteEssay,
    refetch: fetchEssays,
  };
}
