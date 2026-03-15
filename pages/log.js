import { useState } from 'react';
import { useRouter } from 'next/router';
import BottomNav from '../components/BottomNav';
import { storage, EXERCISES, ALL_EXERCISES } from '../lib/storage';

const CATEGORIES = ['All', ...Object.keys(EXERCISES)];

export default function LogWorkout() {
  const router = useRouter();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [exercises, setExercises] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const getFilteredExercises = () => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return ALL_EXERCISES.filter(ex =>
        ex.name.toLowerCase().includes(q) ||
        ex.muscles.toLowerCase().includes(q) ||
        ex.category.toLowerCase().includes(q)
      );
    }
    if (category === 'All') return ALL_EXERCISES;
    return (EXERCISES[category] || []).map(ex => ({ ...ex, category }));
  };

  const filtered = getFilteredExercises();

  const addExercise = (ex) => {
    if (exercises.find(e => e.name === ex.name)) return;
    const lastSets = storage.getLastSet(ex.name);
    const defaultWeight = lastSets ? lastSets[0].weight : 20;
    const defaultReps = lastSets ? lastSets[0].reps : 10;
    setExercises([...exercises, {
      name: ex.name, muscles: ex.muscles, category: ex.category,
      sets: [
        { weight: defaultWeight, reps: defaultReps, done: false },
        { weight: defaultWeight, reps: defaultReps, done: false },
        { weight: defaultWeight, reps: defaultReps, done: false },
      ]
    }]);
    setSearch('');
  };

  const removeExercise = (name) => setExercises(exercises.filter(e => e.name !== name));

  const updateSet = (exIdx, setIdx, field, value) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx][field] = field === 'done' ? value : Number(value) || 0;
    setExercises(updated);
  };

  const addSet = (exIdx) => {
    const updated = [...exercises];
    const last = updated[exIdx].sets.slice(-1)[0];
    updated[exIdx].sets.push({ weight: last.weight, reps: last.reps, done: false });
    setExercises(updated);
  };

  const removeSet = (exIdx) => {
    const updated = [...exercises];
    if (updated[exIdx].sets.length > 1) { updated[exIdx].sets.pop(); setExercises(updated); }
  };

  const completedSets = exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.done).length, 0);
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  const checkPR = () => {
    for (const ex of exercises) {
      const pr = storage.getPR(ex.name);
      const maxNow = Math.max(...ex.sets.filter(s => s.done).map(s => s.weight), 0);
      if (maxNow > 0 && maxNow > (pr || 0)) return true;
    }
    return false;
  };

  const saveWorkout = () => {
    if (exercises.length === 0 || completedSets === 0) return;
    setSaving(true);
    storage.saveWorkout({ type: category === 'All' ? 'Mixed' : category, exercises, hasPR: checkPR(), completedSets, totalSets });
    setSaving(false); setSaved(true);
    setTimeout(() => router.push('/ai?from=log'), 1200);
  };

  const catColors = {
    Chest: '#ff6b35', Back: '#4ecdc4', Shoulders: '#ffe66d', Biceps: '#c3a6ff',
    Triceps: '#ff8fab', Quads: '#06d6a0', Hamstrings: '#ffd166', Glutes: '#ef476f',
    Calves: '#118ab2', Core: '#a8dadc', Cardio: '#e63946', All: '#888',
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div className="label" style={{ marginBottom: 2 }}>New Session</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>Log Workout</div>
        </div>
        {totalSets > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#666' }}>Sets done</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: completedSets === totalSets ? '#4ecdc4' : '#ff6b35' }}>
              {completedSets}/{totalSets}
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#555', pointerEvents: 'none' }}>🔍</div>
        <input
          type="text"
          placeholder="Search any exercise or muscle..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 40, background: '#161616', border: '1px solid #2a2a2a' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 20 }}>×</button>
        )}
      </div>

      {/* Category tabs */}
      {!search && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              flexShrink: 0, padding: '8px 14px',
              background: category === cat ? (catColors[cat] || '#ff6b35') : '#161616',
              border: category === cat ? 'none' : '1px solid #222',
              borderRadius: 20, fontFamily: 'inherit',
              color: category === cat ? (['Shoulders','Calves','Hamstrings','Core','All'].includes(cat) ? '#000' : '#fff') : '#666',
              fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5, whiteSpace: 'nowrap',
            }}>{cat}</button>
          ))}
        </div>
      )}

      {/* Exercise picker */}
      <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="label" style={{ marginBottom: 0 }}>
            {search ? `"${search}"` : category === 'All' ? 'All Exercises' : category}
          </div>
          <div style={{ fontSize: 10, color: '#444' }}>{filtered.length} found</div>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#555', fontSize: 13 }}>No exercises found</div>
        ) : (
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {filtered.map((ex, i) => {
              const added = !!exercises.find(e => e.name === ex.name);
              return (
                <div key={i} onClick={() => !added && addExercise(ex)} style={{
                  padding: '12px 18px',
                  borderBottom: i < filtered.length - 1 ? '1px solid #181818' : 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: added ? 'default' : 'pointer',
                  background: added ? 'rgba(78,205,196,0.04)' : 'transparent',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 14, color: added ? '#4ecdc4' : '#ddd' }}>{ex.name}</div>
                      {(search || category === 'All') && (
                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: `${catColors[ex.category] || '#ff6b35'}18`, color: catColors[ex.category] || '#ff6b35' }}>{ex.category}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{ex.muscles}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, flexShrink: 0, marginLeft: 12, color: added ? '#4ecdc4' : '#ff6b35' }}>
                    {added ? '✓' : '+ ADD'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Logged exercises */}
      {exercises.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#444' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>☝️</div>
          <div style={{ fontSize: 13 }}>Search or browse above to add exercises</div>
        </div>
      ) : (
        <>
          <div className="label" style={{ marginBottom: 12 }}>Today's Log — {exercises.length} exercise{exercises.length > 1 ? 's' : ''}</div>
          {exercises.map((ex, exIdx) => (
            <div key={exIdx} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{ex.name}</div>
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: `${catColors[ex.category] || '#ff6b35'}18`, color: catColors[ex.category] || '#ff6b35' }}>{ex.category}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{ex.muscles}</div>
                </div>
                <button onClick={() => removeExercise(ex.name)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
              </div>
              <div className="set-row" style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9, color: '#555', textAlign: 'center' }}>SET</div>
                <div style={{ fontSize: 9, color: '#555', textAlign: 'center' }}>KG</div>
                <div style={{ fontSize: 9, color: '#555', textAlign: 'center' }}>REPS</div>
                <div style={{ fontSize: 9, color: '#555', textAlign: 'center' }}>✓</div>
              </div>
              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} className="set-row">
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#555' }}>{setIdx + 1}</div>
                  <input type="number" className="set-input" value={set.weight} onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)} style={{ textAlign: 'center', padding: '9px 4px' }} />
                  <input type="number" className="set-input" value={set.reps} onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)} style={{ textAlign: 'center', padding: '9px 4px' }} />
                  <div className={`set-done ${set.done ? 'completed' : ''}`} onClick={() => updateSet(exIdx, setIdx, 'done', !set.done)}>{set.done ? '✓' : '○'}</div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={() => addSet(exIdx)} style={{ flex: 1, padding: '9px', background: 'transparent', border: '1px dashed #2a2a2a', borderRadius: 8, color: '#555', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>+ ADD SET</button>
                {ex.sets.length > 1 && (
                  <button onClick={() => removeSet(exIdx)} style={{ padding: '9px 14px', background: 'transparent', border: '1px dashed #2a2a2a', borderRadius: 8, color: '#444', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>− SET</button>
                )}
              </div>
            </div>
          ))}
          <button className="btn-primary" onClick={saveWorkout} disabled={saving || saved || completedSets === 0} style={{ marginTop: 8 }}>
            {saved ? '✓ SAVED! GETTING AI ANALYSIS...' : saving ? 'SAVING...' : 'FINISH & GET AI TIPS →'}
          </button>
        </>
      )}
      <BottomNav />
    </div>
  );
}
