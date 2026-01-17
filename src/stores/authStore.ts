import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Role } from "@/lib/types";
import { authAPI } from "@/lib/api";
import { getPermissions, Permission } from "@/lib/api/permissions";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Permission | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      permissions: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const user = await authAPI.login(email, password);
          const permissions = getPermissions(user.role);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            permissions,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error instanceof Error ? error.message : "Login failed" 
          };
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          permissions: null,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
      }),
    }
  )
);

// Helper hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === "ADMIN");
export const usePermissions = () => useAuthStore((state) => state.permissions);
