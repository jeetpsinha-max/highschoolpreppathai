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
        // SECURITY: Never trust user_metadata.role for initial assignment.
        // Only allow 'student' or 'parent'; default to 'student'. Admin must be granted server-side.
        const metaRole = user.user_metadata?.role;
        const safeRole: AppRole =
          metaRole === 'parent' ? 'parent' : 'student';
        await createUserRole(safeRole);
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
      // SECURITY: linked_student_id can no longer be self-assigned via direct UPDATE.
      // Use the SECURITY DEFINER RPC which verifies the caller is a parent.
      const { data: studentId, error } = await supabase.rpc(
        'link_parent_to_student' as any,
        { _student_email: studentEmail }
      );

      if (error) throw error;
      if (!studentId) return { error: new Error('Student not found with that email') };

      setLinkedStudentId(studentId as string);
      return { error: null, studentId: studentId as string };
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
