export const DUMMY_HOURLY_TEMPLATE = [
  3, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 4,
];

export function clampBusyness(value) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.min(10, Math.max(1, Math.round(value)));
}

export function buildEmptyDaySeries(fallbackTemplate = DUMMY_HOURLY_TEMPLATE) {
  if (!Array.isArray(fallbackTemplate) || fallbackTemplate.length === 0) {
    return Array(24).fill(1);
  }

  const normalized = [...fallbackTemplate];

  if (normalized.length < 24) {
    while (normalized.length < 24) {
      normalized.push(normalized[normalized.length - 1]);
    }
  }

  if (normalized.length > 24) {
    return normalized.slice(0, 24);
  }

  return normalized;
}
