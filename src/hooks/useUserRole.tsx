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

export const ADMIN_WHITELIST = [
  'jeetpsinha@gmail.com',
  'sixersjeet@gmail.com',
  'jsinha-28@peddie.org'
];

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

  const isSuperadminSession = typeof window !== 'undefined' && sessionStorage.getItem('preppath_admin_unlocked') === '0729!';
  const isWhitelistedUser = Boolean(user?.email && ADMIN_WHITELIST.includes(user.email.toLowerCase()));

  const hasRole = (role: AppRole) => {
    if (role === 'admin' && (isSuperadminSession || isWhitelistedUser)) {
      return true;
    }
    return roles.some(r => r.role === role);
  };

  const isParent = () => hasRole('parent');
  const isStudent = () => hasRole('student');

  return {
    roles,
    loading,
    hasRole,
    isParent,
    isStudent,
    isWhitelistedUser,
    isSuperadminSession,
    linkedStudentId,
    linkStudent,
    createUserRole,
  };
}

