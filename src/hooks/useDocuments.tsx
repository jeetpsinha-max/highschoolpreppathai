import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Document {
  id: string;
  user_id: string;
  school_id: string | null;
  name: string;
  type: string;
  file_path: string;
  file_size: number | null;
  uploaded_at: string;
}

export function useDocuments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["documents", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!user,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      file, 
      name, 
      type, 
      schoolId 
    }: { 
      file: File; 
      name: string; 
      type: string; 
      schoolId?: string;
    }) => {
      if (!user) throw new Error("Must be logged in to upload documents");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          school_id: schoolId || null,
          name,
          type,
          file_path: fileName,
          file_size: file.size,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document uploaded successfully!");
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (document: Document) => {
      if (!user) throw new Error("Must be logged in");

      // Delete from storage
      await supabase.storage
        .from("documents")
        .remove([document.file_path]);

      // Delete from database
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", document.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted");
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    },
  });
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: async (filePath: string) => {
      const { data, error } = await supabase.storage
        .from("documents")
        .download(filePath);

      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error("Download error:", error);
      toast.error("Failed to download document");
    },
  });
}
