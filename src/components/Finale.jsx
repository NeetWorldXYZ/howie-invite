import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../GameContext.jsx';
import { buildReport } from '../data/report.js';
import { FINALE } from '../data/trials.js';
import { LEAGUE_INVITE_URL, LEAGUE_NAME, LEAGUE_YEAR } from '../config.js';
import { storage, getInviteToken } from '../persistence.js';
import { sfx } from '../sound.js';

export default function Finale() {
  const { state } = useGame();
  const [stage, setStage] = useState('card');
  const submitted = useRef(false);

  const elapsed = (state.endTime || Date.now()) - (state.startTime || Date.now());
  const report = useMemo(() => buildReport(state.stats, elapsed), [state.stats, elapsed]);

  useEffect(() => {
    const t = setTimeout(() => sfx.seal(), 600);
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
      rating: report.rating,
      punishment: report.punishment,
      stats: state.stats,
      dateCompleted: new Date().toISOString(),
    });
  }, [elapsed, report, state.stats]);

  if (stage === 'card') {
    return (
      <div className="finale-scene">
        <div className="finale-card">
          <div className="gold-seal">
            <div>HH<br /><span style={{ fontSize: 8, letterSpacing: '0.2em' }}>APPROVED</span></div>
          </div>
          <div className="finale-title">{FINALE.kicker}</div>
          <div className="inv-rule" />
          <p style={{ fontSize: 16 }}>{FINALE.approved}</p>
          <div className="inv-rule" />
          <div className="finale-title" style={{ fontSize: 11 }}>{FINALE.welcome}</div>
          <div className="finale-league">{LEAGUE_NAME}</div>
          <div className="finale-year">{LEAGUE_YEAR}</div>
        </div>
        <button className="btn primary" onClick={() => { sfx.chime(); setStage('report'); }}>
          VIEW YOUR RECORD
        </button>
      </div>
    );
  }

  return (
    <div className="finale-scene">
      <div className="receipt shift-report">
        <div className="rc-center rc-big">INITIATION RECORD</div>
        <div className="rc-center" style={{ fontSize: 10 }}>HUNGRY HOMIES {LEAGUE_YEAR} — ENTRY 007</div>
        <div className="rc-rule" />
        <div className="report-line"><span>TIME</span><span>{report.time}</span></div>
        <div className="report-line"><span>EGO INFLATED TO</span><span>{report.psi} PSI</span></div>
        <div className="report-line"><span>TICKET SCRATCHED</span><span>{report.scratch}%</span></div>
        <div className="report-line"><span>BEERS</span><span>{report.beers}</span></div>
        <div className="rc-rule" />
        <div className="report-line"><span>PUNISHMENT ACCEPTED</span></div>
        <div style={{ fontSize: 11, fontWeight: 600 }}>{report.punishment}</div>
        <div className="rc-rule" />
        <div className="report-line"><span>SIGNATURE</span></div>
        <div style={{ fontSize: 11 }}>{report.sigVerdict}</div>
        <div className="rc-rule" />
        <div className="report-grade">{report.rating}</div>
        <div className="rc-center" style={{ fontSize: 10 }}>DEGENERACY {report.score} / 100</div>
        <div className="rc-center" style={{ fontSize: 11, marginTop: 6 }}>{report.verdict}</div>
        {report.remarks.length > 0 && (
          <>
            <div className="rc-rule" />
            <div className="report-remarks">
              {report.remarks.map((r, i) => <div key={i}>• {r}</div>)}
            </div>
          </>
        )}
        <div className="rc-rule" />
        <div className="rc-center" style={{ fontSize: 10 }}>THIS RECORD IS PERMANENT AND WILL BE READ ALOUD.</div>
      </div>

      {LEAGUE_INVITE_URL ? (
        <a className="btn primary" href={LEAGUE_INVITE_URL} target="_blank" rel="noreferrer">
          {FINALE.cta}
        </a>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <button className="btn primary" onClick={() => sfx.deny()}>{FINALE.cta}</button>
          <div className="muted small" style={{ marginTop: 10, whiteSpace: 'pre-line' }}>{FINALE.noUrl}</div>
        </div>
      )}
    </div>
  );
}
