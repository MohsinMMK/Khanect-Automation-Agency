/**
 * Settings Service
 * Handles profile updates and password changes via Supabase
 */

import { supabase } from '@/lib/supabase';
import type { ProfileFormData, PasswordFormData, NotificationPreferences } from '@/types/portal';

export interface ServiceResult {
  success: boolean;
  error?: { message: string };
}

/**
 * Update client profile
 */
export async function updateProfile(
  clientId: string,
  data: ProfileFormData
): Promise<ServiceResult> {
  if (!supabase) {
    return { success: false, error: { message: 'Database not configured' } };
  }

  try {
    const { error } = await supabase
      .from('clients')
      .update({
        full_name: data.full_name,
        phone: data.phone,
        business_name: data.business_name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId);

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: { message: error.message } };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error updating profile:', err);
    return { success: false, error: { message: 'Failed to update profile' } };
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  clientId: string,
  preferences: NotificationPreferences
): Promise<ServiceResult> {
  if (!supabase) {
    return { success: false, error: { message: 'Database not configured' } };
  }

  try {
    const { error } = await supabase
      .from('clients')
      .update({
        notification_preferences: preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId);

    if (error) {
      console.error('Error updating notifications:', error);
      return { success: false, error: { message: error.message } };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error updating notifications:', err);
    return { success: false, error: { message: 'Failed to update notification preferences' } };
  }
}

/**
 * Change user password
 */
export async function changePassword(
  newPassword: string
): Promise<ServiceResult> {
  if (!supabase) {
    return { success: false, error: { message: 'Authentication service unavailable' } };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Error changing password:', error);
      return { success: false, error: { message: error.message } };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error changing password:', err);
    return { success: false, error: { message: 'Failed to change password' } };
  }
}

/**
 * Delete account (soft delete - sets status to inactive)
 */
export async function deleteAccount(clientId: string): Promise<ServiceResult> {
  if (!supabase) {
    return { success: false, error: { message: 'Database not configured' } };
  }

  try {
    const { error } = await supabase
      .from('clients')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId);

    if (error) {
      console.error('Error deleting account:', error);
      return { success: false, error: { message: error.message } };
    }

    // Sign out the user
    await supabase.auth.signOut();

    return { success: true };
  } catch (err) {
    console.error('Unexpected error deleting account:', err);
    return { success: false, error: { message: 'Failed to delete account' } };
  }
}
