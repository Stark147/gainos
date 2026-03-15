import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import BottomNav from '../components/BottomNav';
import { storage } from '../lib/storage';

export default function Dashboard() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState([]);
  const [streak, setStreak] = useState(0);
  const [profile, setProfile] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setWorkouts(storage.getWorkouts());
    setStreak(storage.getStreak());
    setProfile(storage.getProfile());
    setMounted(true);
  }, []);

  const thisMonth = workouts.filter(w => {
    const d = new Date(w.date), now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalVolume = thisMonth.reduce((sum, w) =>
    sum + (w.exercises||[]).reduce((s,ex) =>
      s + (ex.sets||[]).filter(s=>s.done).reduce((ss,set) => ss + set.weight*set.reps, 0), 0), 0);

  const prs = thisMonth.filter(w => w.hasPR).length;
  const recentWorkout = workouts[0];

  const weekDays = ['M','T','W','T','F','S','S'];
  const todayIdx = new Date().getDay();
  const adjusted = todayIdx === 0 ? 6 : todayIdx - 1;

  const catColors = { Chest:'#ff6b6b', Back:'#4ecdc4', Shoulders:'#ffe66d', Biceps:'#c3a6ff', Triceps:'#ff8fab', Quads:'#06d6a0', Hamstrings:'#ffd166', Glutes:'#ef476f', Calves:'#74b9ff', Core:'#a8dadc', Cardio:'#fd79a8', Mixed:'#6c63ff', Push:'#ff6b35', Pull:'#4ecdc4', Legs:'#ffe66d' };

  if (!mounted) return null;

  return (
    <div className="page">
      {/* Header */}
      <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, color:'var(--accent)', textTransform:'uppercase', marginBottom:6 }}>GainOS</div>
          <div className="display" style={{ fontSize:26, color:'var(--text)', lineHeight:1.1 }}>
            Hey {profile?.name || 'Lifter'} 👋
          </div>
        </div>
        <div onClick={() => router.push('/profile')} style={{
          width:46, height:46, borderRadius:'50%', cursor:'pointer',
          background:'linear-gradient(135deg, var(--accent), #8b5cf6)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:18, fontWeight:800, color:'#fff', fontFamily:'Syne, sans-serif',
          boxShadow:'0 4px 20px rgba(108,99,255,0.5)',
        }}>
          {profile?.name?.[0]?.toUpperCase() || 'G'}
        </div>
      </div>

      {/* Streak */}
      <div className="card card-glow fade-up-1" style={{ padding:'24px', marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div className="label" style={{ marginBottom:10 }}>Current Streak</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
              <span className="display" style={{ fontSize:56, color:'var(--text)', lineHeight:1 }}>{streak}</span>
              <span style={{ fontSize:13, color:'var(--text2)' }}>days 🔥</span>
            </div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:6 }}>
              {streak === 0 ? 'Start your streak today' : streak < 7 ? 'Building momentum...' : 'Unstoppable!'}
            </div>
          </div>
          <div>
            <div className="label" style={{ marginBottom:10, textAlign:'right' }}>This Week</div>
            <div style={{ display:'flex', gap:5 }}>
              {weekDays.map((d,i) => (
                <div key={i} style={{
                  width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                  background: i <= adjusted ? 'linear-gradient(135deg, var(--accent), #8b5cf6)' : 'var(--surface2)',
                  border: i <= adjusted ? 'none' : '1px solid var(--border)',
                  fontSize: i <= adjusted ? 12 : 9,
                  color: i <= adjusted ? '#fff' : 'var(--text3)',
                  fontWeight:700,
                  boxShadow: i <= adjusted ? '0 2px 8px rgba(108,99,255,0.4)' : 'none',
                }}>
                  {i <= adjusted ? '✓' : d}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="fade-up-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }}>
        {[
          { label:'Volume', value: totalVolume > 0 ? `${(totalVolume/1000).toFixed(1)}T` : '—', icon:'⚡' },
          { label:'Sessions', value: thisMonth.length || '—', icon:'📅' },
          { label:'PRs', value: prs || '—', icon:'🏆' },
        ].map((s,i) => (
          <div key={i} className="card" style={{ padding:'16px 12px', borderRadius:16, textAlign:'center' }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{s.icon}</div>
            <div className="stat-num" style={{ fontSize:24, color:'var(--text)' }}>{s.value}</div>
            <div className="label" style={{ marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Last session */}
      {recentWorkout ? (
        <div className="card fade-up-3" style={{ padding:'20px', marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div className="label">Last Session</div>
            <span className="tag" style={{ background:`${catColors[recentWorkout.type]||'#6c63ff'}20`, color:catColors[recentWorkout.type]||'#6c63ff' }}>
              {recentWorkout.type}
            </span>
          </div>
          {(recentWorkout.exercises||[]).slice(0,3).map((ex,i) => {
            const topSet = (ex.sets||[]).filter(s=>s.done).sort((a,b)=>b.weight-a.weight)[0];
            return (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom: i<2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize:13, color:'var(--text2)', fontWeight:500 }}>{ex.name}</div>
                <div style={{ fontSize:12, color:'var(--text3)', fontFamily:'Syne,sans-serif', fontWeight:600 }}>
                  {topSet ? `${topSet.weight}kg × ${topSet.reps}` : '—'}
                </div>
              </div>
            );
          })}
          <div style={{ fontSize:11, color:'var(--text3)', marginTop:12 }}>
            {new Date(recentWorkout.date).toLocaleDateString('en-IN',{weekday:'long',month:'short',day:'numeric'})}
          </div>
        </div>
      ) : (
        <div className="card fade-up-3" style={{ padding:'36px 20px', textAlign:'center', marginBottom:16 }}>
          <div style={{ fontSize:36, marginBottom:12 }}>🏋️</div>
          <div style={{ fontSize:15, color:'var(--text2)', fontWeight:500, marginBottom:6 }}>No workouts yet</div>
          <div style={{ fontSize:12, color:'var(--text3)' }}>Log your first session to start tracking</div>
        </div>
      )}

      {/* Volume chart */}
      {workouts.length > 1 && (
        <div className="card fade-up-4" style={{ padding:'20px', marginBottom:16 }}>
          <div className="label" style={{ marginBottom:14 }}>Volume Trend</div>
          <div className="bar-chart">
            {workouts.slice(0,8).reverse().map((w,i,arr) => {
              const vol = (w.exercises||[]).reduce((s,ex)=>s+(ex.sets||[]).filter(s=>s.done).reduce((ss,set)=>ss+set.weight*set.reps,0),0);
              const maxVol = Math.max(...arr.map(w=>(w.exercises||[]).reduce((s,ex)=>s+(ex.sets||[]).filter(s=>s.done).reduce((ss,set)=>ss+set.weight*set.reps,0),0)),1);
              return (
                <div key={i} className={`bar ${i===arr.length-1?'active':''}`} style={{ height:`${Math.max((vol/maxVol)*100,8)}%` }} />
              );
            })}
          </div>
        </div>
      )}

      <button className="btn-primary fade-up-5" onClick={() => router.push('/log')}>
        Start Workout →
      </button>

      <BottomNav />
    </div>
  );
}
