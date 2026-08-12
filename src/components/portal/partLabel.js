// Part titles are often authored with their own prefix ("Phase 1 — Infrastructure
// Setup"). The UI already renders a number, so strip the prefix to avoid
// "Phase 1: Phase 1 — Infrastructure Setup".
const PART_PREFIX = /^(phase|part|lesson|module|step|session)\s*\d+\s*[—–:.-]\s*/i;

export function stripPartPrefix(title = '') {
  return title.replace(PART_PREFIX, '').trim() || title;
}
