export type DocumentQualificationStatus = 'VALIDATED' | 'REJECTED';

export function getDocumentQualificationStatus(
  notes: string | null | undefined
): DocumentQualificationStatus | null {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes);
    return parsed?.accountantValidation?.status ?? null;
  } catch {
    return null;
  }
}
