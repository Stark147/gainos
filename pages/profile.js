import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import BottomNav from '../components/BottomNav';
import { storage } from '../lib/storage';

export default function Profile() {
  const router = useRouter();
  const [form, setForm] = useState({ name:'', weight:'', height:'', goal:'Build Muscle' });
  const [saved, setSaved] = useState(false);
  const [wCount, setWCount] = useState(0);

  useEffect(() => {
    const p = storage.getProfile();
    if (p) setForm(p);
    setWCount(storage.getWorkouts().length);
  }, []);

  const save = () => {
    storage.saveProfile(form);
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push('/'); }, 1000);
  };

  const goals = ['Build Muscle','Lose Fat','Get Stronger','Improve Endurance','Stay Fit'];

  return (
    <div className="page" style={{ paddingBottom:40 }}>
      <div className="fade-up" style={{ marginBottom:32 }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, color:'var(--accent)', textTransform:'uppercase', marginBottom:6 }}>GainOS</div>
        <div className="display" style={{ fontSize:26 }}>Profile</div>
      </div>

      {/* Avatar */}
      <div className="fade-up-1" style={{ textAlign:'center', marginBottom:32 }}>
        <div style={{ width:80, height:80, borderRadius:'50%', margin:'0 auto 12px', background:'linear-gradient(135deg, var(--accent), #8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:800, color:'#fff', fontFamily:'Syne,sans-serif', boxShadow:'0 8px 30px rgba(108,99,255,0.45)' }}>
          {form.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ fontSize:12, color:'var(--text3)' }}>{wCount} workout{wCount !== 1 ? 's' : ''} logged</div>
      </div>

      <div className="fade-up-2" style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div>
          <div className="label" style={{ marginBottom:8 }}>Your Name</div>
          <input placeholder="e.g. Gagan" value={form.name} onChange={e => setForm({...form,name:e.target.value})} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <div className="label" style={{ marginBottom:8 }}>Weight (kg)</div>
            <input type="number" placeholder="75" value={form.weight} onChange={e => setForm({...form,weight:e.target.value})} />
          </div>
          <div>
            <div className="label" style={{ marginBottom:8 }}>Height (cm)</div>
            <input type="number" placeholder="175" value={form.height} onChange={e => setForm({...form,height:e.target.value})} />
          </div>
        </div>
        <div>
          <div className="label" style={{ marginBottom:10 }}>Goal</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {goals.map(g => (
              <button key={g} onClick={() => setForm({...form,goal:g})} style={{
                padding:'9px 16px', borderRadius:20, cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:500,
                background: form.goal===g ? 'linear-gradient(135deg, var(--accent), #8b5cf6)' : 'var(--surface)',
                border: form.goal===g ? 'none' : '1px solid var(--border2)',
                color: form.goal===g ? '#fff' : 'var(--text2)',
                boxShadow: form.goal===g ? '0 4px 14px rgba(108,99,255,0.35)' : 'none',
                transition:'all 0.2s',
              }}>{g}</button>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={save} style={{ marginTop:8 }}>
          {saved ? '✓ Saved!' : 'Save Profile'}
        </button>

        <div className="divider" />

        <div className="card" style={{ padding:'16px 18px' }}>
          <div className="label" style={{ marginBottom:12 }}>Data Management</div>
          <button className="btn-ghost" onClick={() => { if(confirm('Delete all workout data? Cannot be undone.')) { storage.clearAll(); router.push('/'); } }} style={{ color:'#ef476f', borderColor:'rgba(239,71,111,0.3)' }}>
            🗑 Clear All Data
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
