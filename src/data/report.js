// ============================================================
// FINAL DEGENERACY REPORT
// ============================================================

export function formatDuration(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function buildReport(stats, elapsedMs) {
  const psi = Math.round(stats.maxPsi || 0);
  const punishment = (stats.punishment || '—').replace(/\n/g, ' ');
  const scratch = Math.round((stats.scratchPct || 0) * 100);
  const ink = Math.round(stats.signatureInk || 0);

  // Signature verdict — comedy from the handwriting analysis
  const sigVerdict =
    ink > 1600 ? 'ELABORATE. YOU HAVE PRACTICED THIS.' :
    ink > 800 ? 'LEGALLY BINDING ENOUGH.' :
    ink > 400 ? 'A LINE. TECHNICALLY A SIGNATURE.' :
    'BARELY A GESTURE. UPHELD ANYWAY.';

  const speed = elapsedMs / 60000;
  const paceNote =
    speed < 3 ? 'Completed alarmingly fast. You had nothing else going on.' :
    speed < 7 ? 'Reasonable pace for a man with obligations he is ignoring.' :
    'Took your time. Somebody interrupted you. Probably your wife.';

  // Degeneracy score — higher is worse, which is better
  let score = 0;
  score += Math.min(40, psi);              // overinflating the ego
  score += scratch >= 92 ? 20 : scratch >= 75 ? 12 : 6;
  score += Math.min(20, ink / 90);
  score += (stats.beers || 0) * 6;
  score += stats.popped ? 10 : 0;
  score = Math.min(100, Math.round(score));

  const rating =
    score >= 88 ? 'FULLY DEGENERATE' :
    score >= 72 ? 'LEAGUE READY' :
    score >= 55 ? 'PROMISING' :
    score >= 38 ? 'SUSPICIOUSLY WELL-ADJUSTED' :
    'ARE YOU OKAY';

  const verdict =
    score >= 88 ? 'Admitted without discussion.' :
    score >= 72 ? 'Admitted. Standard hazing applies.' :
    score >= 55 ? 'Admitted on a provisional basis nobody will remember.' :
    score >= 38 ? 'Admitted. The committee has notes.' :
    'Admitted, because we needed a twelfth.';

  const remarks = [];
  if (psi >= 41) remarks.push(`Inflated the Commissioner's ego to ${psi} PSI before rupture. Deflategate was ${(psi / 12.5).toFixed(1)}× less severe.`);
  if (scratch >= 96) remarks.push('Scratched the entire ticket. Every last bit of it. We watched.');
  if (scratch < 75) remarks.push('Left foil on the ticket. A quitter, but an efficient one.');
  if (ink < 400) remarks.push('Signature is a single line. Our lawyer says it counts. Our lawyer is Dustin.');
  if (speed < 3) remarks.push(paceNote);

  return { time: formatDuration(elapsedMs), psi, punishment, scratch, sigVerdict, score, rating, verdict, remarks, beers: stats.beers || 0 };
}
