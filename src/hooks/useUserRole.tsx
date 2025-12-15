import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type AppRole = "student" | "parent" | "admin";

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  linked_student_id: string | null;
  created_at: string;
}

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkedStudentId, setLinkedStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRoles();
    } else {
      setRoles([]);
      setLoading(false);
    }
  }, [user]);

  const fetchUserRoles = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setRoles(data as UserRole[]);
        const parentRole = data.find(r => r.role === 'parent');
        if (parentRole) {
          setLinkedStudentId(parentRole.linked_student_id);
        }
      } else {
        // Create default role based on user metadata
        const metaRole = user.user_metadata?.role || 'student';
        await createUserRole(metaRole as AppRole);
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUserRole = async (role: AppRole, linkedStudentId?: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role,
          linked_student_id: linkedStudentId || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      setRoles(prev => [...prev, data as UserRole]);
      return { error: null };
    } catch (error) {
      console.error('Error creating user role:', error);
      return { error };
    }
  };

  const linkStudent = async (studentEmail: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Find student by email in profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', studentEmail)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) return { error: new Error('Student not found with that email') };

      // Update parent's role with linked student
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ linked_student_id: profileData.user_id })
        .eq('user_id', user.id)
        .eq('role', 'parent');

      if (updateError) throw updateError;

      setLinkedStudentId(profileData.user_id);
      return { error: null, studentId: profileData.user_id };
    } catch (error) {
      console.error('Error linking student:', error);
      return { error };
    }
  };

  const hasRole = (role: AppRole) => roles.some(r => r.role === role);
  const isParent = () => hasRole('parent');
  const isStudent = () => hasRole('student');

  return {
    roles,
    loading,
    hasRole,
    isParent,
    isStudent,
    linkedStudentId,
    linkStudent,
    createUserRole,
  };
}
