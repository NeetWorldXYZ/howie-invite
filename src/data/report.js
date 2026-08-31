// ============================================================
// FINAL SHIFT REPORT — grading logic
// ============================================================

export function formatDuration(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function buildReport(stats, elapsedMs) {
  const hints = stats.hintsUsed || 0;
  const doughAcc = stats.doughAccuracy != null ? Math.round(stats.doughAccuracy) : 100;
  const pizzasFucked = Math.max(0, (stats.makelineAttempts || 1) - 1);
  const wrongJake = stats.jakeWrongPicks || 0;
  const wrongCash = Math.max(0, (stats.cashAttempts || 1) - 1);
  const clockinTries = stats.clockinAttempts || 1;
  const closingMisses = stats.closingMistakes || 0;
  const saidFuckThis = stats.doughChoice === 'fuck_this';

  // ---- HR liability ----
  let hr = 0;
  if (saidFuckThis) hr += 2;
  hr += wrongJake; // every unsupported termination reason is a lawsuit rehearsal
  const hrLabel = hr <= 1 ? 'LOW' : hr <= 3 ? 'MODERATE' : 'CONCERNING';

  // ---- score (0–100) ----
  let score = 100;
  score -= hints * 6;
  score -= Math.max(0, clockinTries - 1) * 2;
  score -= pizzasFucked * 5;
  score -= wrongCash * 5;
  score -= wrongJake * 6;
  score -= closingMisses * 2;
  score -= Math.max(0, 100 - doughAcc) * 0.2;
  const minutes = elapsedMs / 60000;
  if (minutes > 35) score -= Math.min(10, (minutes - 35) * 0.5);
  score = Math.max(0, Math.round(score));

  const grade =
    score >= 92 ? 'A' :
    score >= 84 ? 'A−' :
    score >= 76 ? 'B' :
    score >= 66 ? 'C+' :
    score >= 55 ? 'C' :
    score >= 42 ? 'D' : 'F (HIRED ANYWAY — WE\'RE SHORT-STAFFED)';

  // ---- management potential ----
  let potential;
  if (score >= 90 && !saidFuckThis) {
    potential = 'ALARMINGLY HIGH. PLEASE HAVE A HOBBY.';
  } else if (score >= 84) {
    potential = 'PROMOTABLE. UNFORTUNATELY.';
  } else if (score >= 70 && saidFuckThis) {
    potential = 'STRONG INSTINCTS, ZERO PATIENCE. SO... MANAGER.';
  } else if (score >= 70) {
    potential = 'ADEQUATE. WOULD SURVIVE A FRIDAY.';
  } else if (wrongJake >= 3) {
    potential = 'DO NOT LET THIS PERSON NEAR HR PAPERWORK AGAIN.';
  } else if (score >= 50) {
    potential = 'NEEDS SUPERVISION. IS THE SUPERVISOR.';
  } else {
    potential = 'KEYS REVOKED PENDING REVIEW.';
  }

  const remarks = [];
  if (pizzasFucked === 0) remarks.push('Zero remakes on the makeline. Randy never knew how close he came.');
  if (pizzasFucked >= 3) remarks.push(`Randy received ${pizzasFucked} apologies and one correct pizza.`);
  if (saidFuckThis) remarks.push('Verbatim quote from dough prep recorded in your permanent file.');
  if (stats.doughChoice === 'keep_going') remarks.push('Voluntarily portioned additional dough. Dennis has never trusted anyone more.');
  if (hints === 0) remarks.push('Completed shift without assistance. Store Help remains unaware you exist.');
  if (hints >= 4) remarks.push(`Requested help ${hints} times. The laminated sheets were right there.`);
  if (wrongJake === 0 && stats.step6Done) remarks.push('Terminated an employee correctly on the first attempt. HR wept.');
  if (wrongCash === 0 && stats.step4Done) remarks.push('Found $37.84 faster than three district managers and one auditor.');

  return {
    time: formatDuration(elapsedMs),
    hints,
    doughAcc,
    pizzasFucked,
    hrLabel,
    potential,
    score,
    grade,
    remarks,
    clockinTries,
    wrongCash,
    wrongJake,
    closingMisses,
  };
}
