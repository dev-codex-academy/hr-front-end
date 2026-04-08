export const safeParseJSON = (raw, fallback) => {
  try {
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}
