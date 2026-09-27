/**
 * Admin authorization utility.
 * Reads configured admin email from environment variable (VITE_ADMIN_EMAIL)
 * to avoid exposing private admin credentials in repository bundle code.
 */

export const getAdminEmail = (): string => {
  return (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();
};

export const isCurrentUserAdmin = (userEmail?: string | null): boolean => {
  if (!userEmail) return false;
  const adminEmail = getAdminEmail();
  if (!adminEmail) return false;
  return userEmail.trim().toLowerCase() === adminEmail;
};
