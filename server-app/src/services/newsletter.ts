const BREVO_API_URL = 'https://api.brevo.com/v3';

const apiKey = () => process.env.BREVO_API_KEY || '';
const listId = () => Number(process.env.BREVO_LIST_ID) || 0;

export const subscribeContact = async (email: string, firstName?: string, lastName?: string): Promise<void> => {
  const res = await fetch(`${BREVO_API_URL}/contacts`, {
    method: 'POST',
    headers: { 'api-key': apiKey(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      attributes: { FIRSTNAME: firstName, LASTNAME: lastName },
      listIds: [listId()],
      updateEnabled: true,
    }),
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message || 'Erreur Brevo');
  }
};

export const unsubscribeContact = async (email: string): Promise<void> => {
  const res = await fetch(`${BREVO_API_URL}/contacts/lists/${listId()}/contacts/remove`, {
    method: 'POST',
    headers: { 'api-key': apiKey(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ emails: [email] }),
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message || 'Erreur Brevo');
  }
};

export const getContactStatus = async (email: string): Promise<boolean> => {
  const res = await fetch(`${BREVO_API_URL}/contacts/${encodeURIComponent(email)}`, {
    headers: { 'api-key': apiKey() },
  });
  if (!res.ok) return false;
  const data = await res.json() as { listIds?: number[] };
  return (data.listIds || []).includes(listId());
};
