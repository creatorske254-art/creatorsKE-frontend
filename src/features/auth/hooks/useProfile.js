import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { userService } from '../services/auth.service';

/**
 * The signed-in user's profile (useProfile) and preferences (usePreferences), shared by every
 * settings page.
 */
export const PROFILE_KEY = ['user', 'profile'];
export const PREFERENCES_KEY = ['user', 'preferences'];
export const PRIVACY_KEY = ['user', 'privacy'];

/**
 * The signed-in account's full profile (GET /users/profile) and a save
 * mutation. Saving also refreshes the AuthContext user so the navbar
 * avatar / name update without a reload.
 */
export function useProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  const query = useQuery({ queryKey: PROFILE_KEY, queryFn: userService.getProfile });

  const save = useMutation({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(PROFILE_KEY, updated);
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      if (updated) {
        const user = { ...updated };
        delete user.creator; delete user.brand; delete user.preferences;
        updateUser?.(user);
      }
      toast.success('Profile saved.');
    },
    onError: (err) => toast.error(err?.message || 'Could not save your profile.'),
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    saveProfile: save.mutate,
    saveProfileAsync: save.mutateAsync,
    isSaving: save.isPending,
  };
}

/** Notification, privacy and locale preferences (GET/PATCH /users/preferences). */
export function usePreferences() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: PREFERENCES_KEY, queryFn: userService.getPreferences });

  const save = useMutation({
    mutationFn: (data) => userService.updatePreferences(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(PREFERENCES_KEY, updated);
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    },
    onError: (err) => toast.error(err?.message || 'Could not save your preferences.'),
  });

  return {
    preferences: query.data ?? {},
    isLoading: query.isLoading,
    isError: query.isError,
    savePreferences: save.mutate,
    savePreferencesAsync: save.mutateAsync,
    isSaving: save.isPending,
  };
}

export function usePrivacySettings() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: PRIVACY_KEY, queryFn: userService.getPrivacy });

  const save = useMutation({
    mutationFn: (data) => userService.updatePrivacy(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(PRIVACY_KEY, updated);
      queryClient.invalidateQueries({ queryKey: ['public-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['public-rate-card'] });
      queryClient.invalidateQueries({ queryKey: ['directory'] });
      toast.success('Privacy settings saved.');
    },
    onError: (err) => toast.error(err?.message || 'Could not save your privacy settings.'),
  });

  return {
    privacy: query.data ?? {},
    isLoading: query.isLoading,
    isError: query.isError,
    savePrivacy: save.mutate,
    isSaving: save.isPending,
  };
}
