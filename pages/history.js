import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import { storage } from '../lib/storage';

export default function History() {
  const [workouts, setWorkouts] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setWorkouts(storage.getWorkouts()); setMounted(true); }, []);

  const catColors = { Chest:'#ff6b6b',Back:'#4ecdc4',Shoulders:'#ffe66d',Biceps:'#c3a6ff',Triceps:'#ff8fab',Quads:'#06d6a0',Hamstrings:'#ffd166',Glutes:'#ef476f',Calves:'#74b9ff',Core:'#a8dadc',Cardio:'#fd79a8',Mixed:'#6c63ff',Push:'#ff6b35',Pull:'#4ecdc4',Legs:'#ffe66d' };

  const getVolume = (w) => {
    const v = (w.exercises||[]).reduce((s,ex)=>s+(ex.sets||[]).filter(s=>s.done).reduce((ss,set)=>ss+set.weight*set.reps,0),0);
    return v > 0 ? `${(v/1000).toFixed(1)}T` : '—';
  };

  const chartData = workouts.slice(0,8).reverse();
  const maxVol = Math.max(...chartData.map(w=>(w.exercises||[]).reduce((s,ex)=>s+(ex.sets||[]).filter(s=>s.done).reduce((ss,set)=>ss+set.weight*set.reps,0),0)),1);

  if (!mounted) return null;

  return (
    <div className="page">
      <div className="fade-up" style={{ marginBottom:32 }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, color:'var(--accent)', textTransform:'uppercase', marginBottom:6 }}>GainOS</div>
        <div className="display" style={{ fontSize:26 }}>History</div>
      </div>

      {chartData.length > 1 && (
        <div className="card fade-up-1" style={{ padding:'20px', marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div className="label">Volume Trend</div>
            <div style={{ fontSize:11, color:'var(--accent)', fontWeight:600 }}>{workouts.length} sessions</div>
          </div>
          <div className="bar-chart">
            {chartData.map((w,i) => {
              const vol = (w.exercises||[]).reduce((s,ex)=>s+(ex.sets||[]).filter(s=>s.done).reduce((ss,set)=>ss+set.weight*set.reps,0),0);
              return (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  {i === chartData.length-1 && vol > 0 && <div style={{ fontSize:8, color:'var(--accent)', fontWeight:700 }}>{(vol/1000).toFixed(1)}T</div>}
                  <div className={`bar ${i===chartData.length-1?'active':''}`} style={{ height:`${Math.max((vol/maxVol)*100,8)}%`, width:'100%' }} />
                  <div style={{ fontSize:8, color:'var(--text3)' }}>{new Date(w.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'}).split(' ')[0]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="label fade-up-2" style={{ marginBottom:12 }}>All Sessions</div>

      {workouts.length === 0 ? (
        <div className="card fade-up-2" style={{ padding:'48px 20px', textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
          <div style={{ fontSize:15, color:'var(--text2)', fontWeight:500, marginBottom:6 }}>No workouts yet</div>
          <div style={{ fontSize:12, color:'var(--text3)' }}>Your sessions will appear here</div>
        </div>
      ) : workouts.map((w,i) => (
        <div key={i} className={i < 3 ? `fade-up-${i+2}` : ''} style={{ marginBottom:10 }}>
          <div className="card" style={{ padding:'18px 20px', cursor:'pointer', borderColor: expanded===i ? 'rgba(108,99,255,0.4)' : 'var(--border)', transition:'border-color 0.2s, box-shadow 0.2s', boxShadow: expanded===i ? '0 4px 20px rgba(108,99,255,0.1)' : 'none' }}
            onClick={() => setExpanded(expanded===i ? null : i)}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <span className="tag" style={{ background:`${catColors[w.type]||'#6c63ff'}20`, color:catColors[w.type]||'#6c63ff' }}>{w.type||'Workout'}</span>
                  {w.hasPR && <span className="tag" style={{ background:'rgba(255,209,102,0.15)', color:'#ffd166' }}>🏆 PR</span>}
                </div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>
                  {(w.exercises||[]).length} exercises · {getVolume(w)} · {w.completedSets||0} sets
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:11, color:'var(--text3)', marginBottom:6 }}>
                  {new Date(w.date).toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'})}
                </div>
                <div style={{ fontSize:14, color:'var(--text3)', textAlign:'right' }}>{expanded===i?'↑':'↓'}</div>
              </div>
            </div>

            {expanded===i && (
              <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)' }}>
                {(w.exercises||[]).map((ex,ei) => {
                  const done = (ex.sets||[]).filter(s=>s.done);
                  const top = done.sort((a,b)=>b.weight-a.weight)[0];
                  return (
                    <div key={ei} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: ei<w.exercises.length-1?'1px solid var(--border)':'none' }}>
                      <div style={{ fontSize:13, color:'var(--text2)', fontWeight:500 }}>{ex.name}</div>
                      <div style={{ fontSize:12, color:'var(--text3)', fontFamily:'Syne,sans-serif', fontWeight:600 }}>
                        {top ? `${done.length}×${top.weight}kg×${top.reps}` : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}
      <BottomNav />
    </div>
  );
}
