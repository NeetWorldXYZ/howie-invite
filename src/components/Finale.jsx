import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../GameContext.jsx';
import { buildReport } from '../data/report.js';
import { LEAGUE_INVITE_URL, LEAGUE_NAME, LEAGUE_YEAR } from '../config.js';
import { storage, getInviteToken } from '../persistence.js';
import { sfx } from '../sound.js';

export default function Finale() {
  const { state } = useGame();
  const [stage, setStage] = useState('seal'); // seal -> report
  const submitted = useRef(false);

  const elapsed = (state.endTime || Date.now()) - (state.startTime || Date.now());
  const report = useMemo(() => buildReport(state.stats, elapsed), [state.stats, elapsed]);

  useEffect(() => {
    const t = setTimeout(() => sfx.seal(), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;
    storage.submitResult({
      token: getInviteToken(),
      completed: true,
      completionMs: elapsed,
      score: report.score,
      grade: report.grade,
      hintsUsed: report.hints,
      stats: state.stats,
      dateCompleted: new Date().toISOString(),
    });
  }, [elapsed, report, state.stats]);

  if (stage === 'seal') {
    return (
      <div className="finale-scene">
        <div className="finale-card">
          <div className="gold-seal">
            <div>HH<br /><span style={{ fontSize: 8, letterSpacing: '0.2em' }}>APPROVED</span></div>
          </div>
          <div className="finale-title">Shift Complete</div>
          <div className="inv-rule" />
          <p style={{ fontSize: 16 }}>Your application has been approved.</p>
          <div className="inv-rule" />
          <div className="finale-title" style={{ fontSize: 11 }}>Welcome to</div>
          <div className="finale-league">{LEAGUE_NAME}</div>
          <div className="finale-year">{LEAGUE_YEAR}</div>
        </div>
        <button className="btn primary" onClick={() => { sfx.chime(); setStage('report'); }}>
          VIEW SHIFT PERFORMANCE
        </button>
      </div>
    );
  }

  return (
    <div className="finale-scene">
      <div className="receipt shift-report">
        <div className="rc-center rc-big">SHIFT PERFORMANCE</div>
        <div className="rc-center" style={{ fontSize: 10 }}>STORE #4471 — 8/30 — NEW HIRE</div>
        <div className="rc-rule" />
        <div className="report-line"><span>TIME</span><span>{report.time}</span></div>
        <div className="report-line"><span>HINTS USED</span><span>{report.hints}</span></div>
        <div className="report-line"><span>DOUGH ACCURACY</span><span>{report.doughAcc}%</span></div>
        <div className="report-line"><span>PIZZAS FUCKED UP</span><span>{report.pizzasFucked}</span></div>
        <div className="report-line"><span>CLOCK-IN ATTEMPTS</span><span>{report.clockinTries}</span></div>
        <div className="report-line"><span>FALSE ACCUSATIONS (CASH)</span><span>{report.wrongCash}</span></div>
        <div className="report-line"><span>FALSE ACCUSATIONS (JAKE)</span><span>{report.wrongJake}</span></div>
        <div className="report-line"><span>HR LIABILITY</span><span>{report.hrLabel}</span></div>
        <div className="rc-rule" />
        <div className="report-line"><span>MGMT POTENTIAL</span></div>
        <div style={{ fontSize: 11 }}>{report.potential}</div>
        <div className="rc-rule" />
        <div className="report-grade">{report.grade}</div>
        <div className="rc-center" style={{ fontSize: 10 }}>SCORE {report.score} / 100</div>
        {report.remarks.length > 0 && (
          <>
            <div className="rc-rule" />
            <div className="report-remarks">
              {report.remarks.map((r, i) => <div key={i}>• {r}</div>)}
            </div>
          </>
        )}
        <div className="rc-rule" />
        <div className="rc-center" style={{ fontSize: 10 }}>RETAIN FOR YOUR RECORDS. NOBODY ELSE WILL.</div>
      </div>

      {LEAGUE_INVITE_URL ? (
        <a className="btn primary" href={LEAGUE_INVITE_URL} target="_blank" rel="noreferrer">
          ACCEPT LEAGUE INVITATION
        </a>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <button className="btn primary" onClick={() => sfx.deny()}>ACCEPT LEAGUE INVITATION</button>
          <div className="muted small" style={{ marginTop: 10 }}>
            The Commissioner has not attached the league link yet.<br />Screenshot this and harass him directly.
          </div>
        </div>
      )}
    </div>
  );
}
