export const primaryAdminEmails = [
  'thureinminn@gmail.com',
  'thureinminnn2026@gmail.com',
  'aspirayouthteam@gmail.com',
] as const;

export const isPrimaryAdminEmail = (email?: string | null) => (
  !!email && primaryAdminEmails.includes(email.toLowerCase() as typeof primaryAdminEmails[number])
);
