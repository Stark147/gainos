import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import BottomNav from '../components/BottomNav';
import { storage } from '../lib/storage';

export default function AICoach() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const all = storage.getWorkouts();
    setWorkouts(all);
    setMounted(true);
    if (router.query.from === 'log' && all.length > 0) analyzeWorkout(all);
  }, [router.query]);

  const buildSummary = (ws) => {
    const latest = ws[0];
    if (!latest) return '';
    return (latest.exercises||[]).map(ex => {
      const sets = (ex.sets||[]).filter(s=>s.done);
      if (!sets.length) return null;
      return `${ex.name}: ${sets.map(s=>`${s.weight}kg×${s.reps}`).join(', ')}`;
    }).filter(Boolean).join('\n');
  };

  const buildHistory = (ws) => {
    return ws.slice(1,4).map(w => {
      const date = new Date(w.date).toLocaleDateString('en-IN',{month:'short',day:'numeric'});
      return `[${date}]\n${(w.exercises||[]).map(ex=>{
        const top = (ex.sets||[]).filter(s=>s.done).sort((a,b)=>b.weight-a.weight)[0];
        return top ? `${ex.name}: ${top.weight}kg×${top.reps}` : null;
      }).filter(Boolean).join('\n')}`;
    }).join('\n\n');
  };

  const analyzeWorkout = async (wkts) => {
    const data = wkts || workouts;
    if (!data.length) return;
    setLoading(true); setError(null); setRecommendation(null);
    try {
      const res = await fetch('/api/coach', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ workoutSummary: buildSummary(data), exerciseHistory: buildHistory(data) }),
      });
      const result = await res.json();
      if (result.error) setError(result.error);
      else setRecommendation(result.recommendation);
    } catch { setError('Connection error. Try again.'); }
    setLoading(false);
  };

  const latest = workouts[0];
  const overloadData = latest ? (latest.exercises||[]).map(ex => {
    const pr = storage.getPR(ex.name);
    const done = (ex.sets||[]).filter(s=>s.done);
    const maxNow = done.length ? Math.max(...done.map(s=>s.weight)) : 0;
    return { name:ex.name, maxNow, isPR: maxNow > 0 && maxNow >= (pr||0), completedSets:done.length };
  }) : [];

  if (!mounted) return null;

  return (
    <div className="page">
      <div className="fade-up" style={{ marginBottom:32 }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, color:'var(--accent)', textTransform:'uppercase', marginBottom:6 }}>GainOS</div>
        <div className="display" style={{ fontSize:26 }}>AI Coach ✦</div>
      </div>

      {!latest ? (
        <div className="card fade-up-1" style={{ padding:'48px 20px', textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🤖</div>
          <div style={{ fontSize:15, color:'var(--text2)', fontWeight:500, marginBottom:8 }}>No data yet</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:24 }}>Log a session to get AI coaching</div>
          <button className="btn-primary" onClick={() => router.push('/log')}>Log a Workout →</button>
        </div>
      ) : (
        <>
          {/* Latest session */}
          <div className="card fade-up-1" style={{ padding:'20px', marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div className="label">Latest Session</div>
              <div style={{ fontSize:11, color:'var(--text3)' }}>{new Date(latest.date).toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'})}</div>
            </div>
            {overloadData.map((ex,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom: i<overloadData.length-1?'1px solid var(--border)':'none' }}>
                <div style={{ fontSize:13, color:'var(--text2)', fontWeight:500 }}>{ex.name}</div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:12, color:'var(--text3)', fontFamily:'Syne,sans-serif', fontWeight:600 }}>{ex.completedSets} sets · {ex.maxNow}kg</span>
                  {ex.isPR && <span className="tag" style={{ background:'rgba(255,209,102,0.15)', color:'#ffd166' }}>PR 🏆</span>}
                </div>
              </div>
            ))}
          </div>

          {/* AI card */}
          <div className="card fade-up-2" style={{ padding:'20px', marginBottom:14, borderColor: loading||recommendation ? 'rgba(108,99,255,0.4)' : 'var(--border)', boxShadow: loading||recommendation ? '0 4px 30px rgba(108,99,255,0.12)' : 'none', transition:'all 0.3s' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <div className="label" style={{ marginBottom:4 }}>AI Analysis</div>
                <div style={{ fontSize:13, color:'var(--text2)', fontWeight:500 }}>Progressive Overload Plan</div>
              </div>
              <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg, var(--accent), #8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, boxShadow:'0 4px 12px rgba(108,99,255,0.4)' }}>
                {loading ? '⏳' : recommendation ? '✓' : '✦'}
              </div>
            </div>

            {loading && (
              <div style={{ padding:'20px 0', textAlign:'center' }}>
                <div style={{ fontSize:13, color:'var(--accent)', fontWeight:600, marginBottom:6 }}>Analyzing your performance...</div>
                <div style={{ fontSize:11, color:'var(--text3)', marginBottom:16 }}>Calculating optimal progression</div>
                <div className="progress-bar"><div className="progress-fill" style={{ width:'75%' }} /></div>
              </div>
            )}

            {error && (
              <div style={{ padding:'12px 16px', background:'rgba(239,71,111,0.08)', borderRadius:12, borderLeft:'3px solid #ef476f', fontSize:13, color:'#ef476f', marginBottom:14 }}>{error}</div>
            )}

            {recommendation && (
              <div style={{ background:'rgba(108,99,255,0.06)', borderRadius:14, padding:'16px', border:'1px solid rgba(108,99,255,0.15)', marginBottom:16 }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:2.5, color:'var(--accent)', textTransform:'uppercase', marginBottom:12 }}>Coach Recommendation</div>
                <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.85, whiteSpace:'pre-wrap', fontWeight:400 }}>{recommendation}</div>
              </div>
            )}

            {!loading && !recommendation && (
              <div style={{ fontSize:13, color:'var(--text3)', marginBottom:16, lineHeight:1.6 }}>
                Get personalized next-session targets based on your training history.
              </div>
            )}

            <button className="btn-primary" onClick={() => analyzeWorkout(null)} disabled={loading}>
              {recommendation ? '↺ Re-Analyze' : loading ? 'Analyzing...' : 'Get AI Recommendations →'}
            </button>
          </div>

          {workouts.length < 3 && (
            <div className="card fade-up-3" style={{ padding:'16px 18px' }}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                <div style={{ fontSize:20 }}>💡</div>
                <div>
                  <div style={{ fontSize:13, color:'var(--text2)', fontWeight:500, marginBottom:4 }}>More data = better coaching</div>
                  <div style={{ fontSize:12, color:'var(--text3)', lineHeight:1.6 }}>Log {3-workouts.length} more session{workouts.length<2?'s':''} to unlock full progressive overload tracking.</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <BottomNav />
    </div>
  );
}
