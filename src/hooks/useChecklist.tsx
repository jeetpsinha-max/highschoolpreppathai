import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface ChecklistItem {
  id: string;
  user_id: string;
  school_id: string | null;
  school_name: string;
  task_name: string;
  due_date: string | null;
  completed: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useChecklist(targetUserId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = targetUserId || user?.id;

  useEffect(() => {
    if (userId) {
      fetchChecklist();
    }
  }, [userId]);

  const fetchChecklist = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('application_checklists')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (
    schoolName: string,
    taskName: string,
    dueDate?: string,
    schoolId?: string,
    notes?: string
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('application_checklists')
        .insert({
          user_id: user.id,
          school_name: schoolName,
          task_name: taskName,
          due_date: dueDate || null,
          school_id: schoolId || null,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      setItems(prev => [...prev, data].sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }));
      toast({ title: "Task added to checklist" });
      return { data, error: null };
    } catch (error) {
      toast({ title: "Error adding task", variant: "destructive" });
      return { error };
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('application_checklists')
        .update({ completed })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setItems(prev => prev.map(i => i.id === id ? { ...i, completed } : i));
      return { error: null };
    } catch (error) {
      toast({ title: "Error updating task", variant: "destructive" });
      return { error };
    }
  };

  const updateItem = async (id: string, updates: Partial<ChecklistItem>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('application_checklists')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
      toast({ title: "Task updated" });
      return { error: null };
    } catch (error) {
      toast({ title: "Error updating task", variant: "destructive" });
      return { error };
    }
  };

  const deleteItem = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('application_checklists')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== id));
      toast({ title: "Task removed" });
      return { error: null };
    } catch (error) {
      toast({ title: "Error removing task", variant: "destructive" });
      return { error };
    }
  };

  const getUpcomingDeadlines = (days: number = 7) => {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return items.filter(i => {
      if (!i.due_date || i.completed) return false;
      const dueDate = new Date(i.due_date);
      return dueDate >= now && dueDate <= future;
    });
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return items.filter(i => {
      if (!i.due_date || i.completed) return false;
      return new Date(i.due_date) < now;
    });
  };

  return {
    items,
    loading,
    addItem,
    toggleComplete,
    updateItem,
    deleteItem,
    getUpcomingDeadlines,
    getOverdueTasks,
    refetch: fetchChecklist,
  };
}
