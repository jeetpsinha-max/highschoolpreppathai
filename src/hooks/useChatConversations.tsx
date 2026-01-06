import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  essay_draft: string | null;
  school_name: string | null;
  created_at: string;
  updated_at: string;
}

export function useChatConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["chat_conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      // Parse messages from JSON
      return (data || []).map(conv => ({
        ...conv,
        messages: (conv.messages as unknown as ChatMessage[]) || []
      })) as ChatConversation[];
    },
    enabled: !!user,
  });
}

export function useSaveConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      id,
      title,
      messages,
      essayDraft,
      schoolName
    }: { 
      id?: string;
      title: string;
      messages: ChatMessage[];
      essayDraft?: string;
      schoolName?: string;
    }) => {
      if (!user) throw new Error("Must be logged in to save conversations");

      const messagesJson = messages as unknown as Json;

      if (id) {
        // Update existing
        const { data, error } = await supabase
          .from("chat_conversations")
          .update({
            title,
            messages: messagesJson,
            essay_draft: essayDraft || null,
            school_name: schoolName || null,
          })
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("chat_conversations")
          .insert({
            user_id: user.id,
            title,
            messages: messagesJson,
            essay_draft: essayDraft || null,
            school_name: schoolName || null,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
      toast.success("Conversation saved!");
    },
    onError: (error) => {
      console.error("Save error:", error);
      toast.error("Failed to save conversation");
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("chat_conversations")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
      toast.success("Conversation deleted");
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error("Failed to delete conversation");
    },
  });
}
