import { useState, useRef } from 'react';
import BottomNav from '../components/BottomNav';
import { ALL_EXERCISES } from '../lib/storage';

const POPULAR_SUPPLEMENTS = ['Creatine','Ashwagandha','Vitamin D','Magnesium','Omega-3','Berberine','NMN','Melatonin','Zinc','Rhodiola','CoQ10','Glutathione'];
const POPULAR_EXERCISES   = ['Bench Press','Squat','Deadlift','Pull-ups','Overhead Press','Romanian Deadlift','Hip Thrust','Plank','Lat Pulldown','Bicep Curl'];

const VERDICT_MAP = {
  'Strong Evidence':'v-strong','Moderate Evidence':'v-moderate',
  'Weak Evidence':'v-weak','Mixed Evidence':'v-mixed','Insufficient Evidence':'v-weak',
};

const SC = {
  'Strong':       {color:'#43e97b',bg:'rgba(67,233,123,0.1)', bar:100},
  'Moderate':     {color:'#ffd166',bg:'rgba(255,209,102,0.1)',bar:66},
  'Weak':         {color:'#ef476f',bg:'rgba(239,71,111,0.1)', bar:33},
  'Insufficient': {color:'#4cc9f0',bg:'rgba(76,201,240,0.1)', bar:15},
};

const VCFG = {
  'v-strong':  {color:'#43e97b', bg:'rgba(67,233,123,0.08)',  border:'rgba(67,233,123,0.25)'},
  'v-moderate':{color:'#ffd166', bg:'rgba(255,209,102,0.08)', border:'rgba(255,209,102,0.25)'},
  'v-weak':    {color:'#ef476f', bg:'rgba(239,71,111,0.08)',  border:'rgba(239,71,111,0.25)'},
  'v-mixed':   {color:'#a78bfa', bg:'rgba(108,99,255,0.08)',  border:'rgba(108,99,255,0.25)'},
};

export default function Research() {
  const [tab, setTab]         = useState('supplement'); // 'supplement' | 'exercise'
  const [q, setQ]             = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [err, setErr]         = useState(null);
  const [exSearch, setExSearch] = useState('');
  const inputRef = useRef();

  const search = async (name, type) => {
    const term = (name || q).trim();
    const searchType = type || tab;
    if (!term) return;
    setLoading(true); setErr(null); setResult(null);
    if (name) setQ(name);
    try {
      const res = await fetch('/api/supplement', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ query: term, type: searchType }),
      });
      const data = await res.json();
      if (data.error) setErr(data.error);
      else setResult(data);
    } catch { setErr('Connection error. Try again.'); }
    setLoading(false);
  };

  const reset = () => { setResult(null); setErr(null); setQ(''); setTimeout(() => inputRef.current?.focus(), 100); };

  const vc = result ? (VCFG[VERDICT_MAP[result.analysis?.verdict?.rating]||'v-mixed']||VCFG['v-mixed']) : VCFG['v-mixed'];

  // Exercise search filter
  const filteredExercises = exSearch.trim()
    ? ALL_EXERCISES.filter(e => e.name.toLowerCase().includes(exSearch.toLowerCase()) || e.muscles.toLowerCase().includes(exSearch.toLowerCase()) || e.category.toLowerCase().includes(exSearch.toLowerCase()))
    : ALL_EXERCISES.slice(0, 20);

  const catColors = {Chest:'#ff6b6b',Back:'#4ecdc4',Shoulders:'#ffe66d',Biceps:'#c3a6ff',Triceps:'#ff8fab',Quads:'#06d6a0',Hamstrings:'#ffd166',Glutes:'#ef476f',Calves:'#74b9ff',Core:'#a8dadc',Cardio:'#fd79a8'};

  return (
    <div className="page">

      {/* Header */}
      <div style={{marginBottom:24}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:3,color:'var(--accent)',textTransform:'uppercase',marginBottom:6}}>GainOS</div>
        <div className="display" style={{fontSize:26}}>Research 🔬</div>
        <div style={{fontSize:13,color:'var(--text2)',marginTop:4}}>Real PubMed studies + AI analysis</div>
      </div>

      {/* Tab switcher */}
      {!result && (
        <div style={{display:'flex',gap:8,marginBottom:20,background:'var(--surface)',borderRadius:14,padding:4,border:'1px solid var(--border)'}}>
          {[
            {id:'supplement',label:'💊 Supplements'},
            {id:'exercise',  label:'🏋️ Exercises'},
          ].map(t => (
            <button key={t.id} onClick={() => {setTab(t.id);setQ('');setErr(null);}} style={{
              flex:1,padding:'10px',borderRadius:10,border:'none',cursor:'pointer',
              background: tab===t.id ? 'linear-gradient(135deg,var(--accent),#8b5cf6)' : 'transparent',
              color: tab===t.id ? '#fff' : 'var(--text2)',
              fontSize:13,fontWeight:600,fontFamily:'inherit',
              boxShadow: tab===t.id ? '0 4px 14px rgba(108,99,255,0.35)' : 'none',
              transition:'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>
      )}

      {/* Search bar */}
      {!result && (
        <div style={{position:'relative',marginBottom:20}}>
          <div style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',fontSize:16,color:'var(--text3)',pointerEvents:'none'}}>
            {tab==='supplement' ? '🔬' : '💪'}
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder={tab==='supplement' ? 'Search any supplement...' : 'Search any exercise or muscle...'}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key==='Enter' && search()}
            style={{width:'100%',padding:'15px 120px 15px 46px',fontFamily:'inherit',fontSize:15,background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:14,color:'var(--text)',outline:'none',transition:'border-color 0.2s,box-shadow 0.2s'}}
            onFocus={e => {e.target.style.borderColor='rgba(108,99,255,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(108,99,255,0.1)'}}
            onBlur={e  => {e.target.style.borderColor='';e.target.style.boxShadow=''}}
          />
          <button onClick={() => search()} disabled={loading||!q.trim()} style={{
            position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',
            padding:'9px 18px',background:'linear-gradient(135deg,var(--accent),#8b5cf6)',
            border:'none',borderRadius:10,color:'#fff',fontSize:12,fontWeight:700,
            cursor:loading||!q.trim()?'not-allowed':'pointer',fontFamily:'inherit',
            opacity:loading||!q.trim()?0.5:1,boxShadow:'0 4px 14px rgba(108,99,255,0.3)',
          }}>{loading?'...':'Search'}</button>
        </div>
      )}

      {/* Popular supplements */}
      {!result && !loading && tab==='supplement' && (
        <div style={{marginBottom:20}}>
          <div className="label" style={{marginBottom:10}}>Popular Supplements</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {POPULAR_SUPPLEMENTS.map(s => (
              <span key={s} onClick={() => search(s,'supplement')} style={{
                padding:'7px 16px',background:'var(--surface)',border:'1px solid var(--border2)',
                borderRadius:40,fontSize:12,fontWeight:500,color:'var(--text2)',cursor:'pointer',transition:'all 0.18s',
              }}
              onMouseEnter={e=>{e.target.style.background='rgba(108,99,255,0.12)';e.target.style.color='#a78bfa';e.target.style.borderColor='rgba(108,99,255,0.3)'}}
              onMouseLeave={e=>{e.target.style.background='';e.target.style.color='';e.target.style.borderColor=''}}
              >{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Exercise browser */}
      {!result && !loading && tab==='exercise' && (
        <div style={{marginBottom:20}}>
          <div className="label" style={{marginBottom:10}}>Popular Exercises</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
            {POPULAR_EXERCISES.map(s => (
              <span key={s} onClick={() => search(s,'exercise')} style={{
                padding:'7px 16px',background:'var(--surface)',border:'1px solid var(--border2)',
                borderRadius:40,fontSize:12,fontWeight:500,color:'var(--text2)',cursor:'pointer',transition:'all 0.18s',
              }}
              onMouseEnter={e=>{e.target.style.background='rgba(108,99,255,0.12)';e.target.style.color='#a78bfa';e.target.style.borderColor='rgba(108,99,255,0.3)'}}
              onMouseLeave={e=>{e.target.style.background='';e.target.style.color='';e.target.style.borderColor=''}}
              >{s}</span>
            ))}
          </div>

          {/* Browse all exercises */}
          <div className="label" style={{marginBottom:10}}>Browse All Exercises</div>
          <div style={{position:'relative',marginBottom:10}}>
            <input type="text" placeholder="Filter exercises..." value={exSearch} onChange={e => setExSearch(e.target.value)}
              style={{width:'100%',padding:'11px 16px',fontFamily:'inherit',fontSize:13,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text)',outline:'none'}}/>
          </div>
          <div className="card" style={{padding:0,overflow:'hidden',maxHeight:280,overflowY:'auto'}}>
            {filteredExercises.map((ex,i) => (
              <div key={i} onClick={() => search(ex.name,'exercise')} style={{
                padding:'11px 16px',borderBottom:i<filteredExercises.length-1?'1px solid var(--border)':'none',
                display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',transition:'background 0.15s',
              }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
              onMouseLeave={e=>e.currentTarget.style.background=''}>
                <div>
                  <div style={{fontSize:13,color:'var(--text)',fontWeight:500}}>{ex.name}</div>
                  <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{ex.muscles}</div>
                </div>
                <span style={{fontSize:9,fontWeight:700,letterSpacing:1,padding:'2px 8px',borderRadius:20,background:`${catColors[ex.category]||'#6c63ff'}18`,color:catColors[ex.category]||'#6c63ff',textTransform:'uppercase'}}>{ex.category}</span>
              </div>
            ))}
          </div>
          {exSearch && <div style={{fontSize:11,color:'var(--text3)',marginTop:6,textAlign:'center'}}>{filteredExercises.length} results</div>}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{textAlign:'center',padding:'60px 20px'}}>
          <div style={{width:24,height:24,border:'2px solid var(--border2)',borderTopColor:'var(--accent)',borderRadius:'50%',animation:'spin 0.7s linear infinite',margin:'0 auto 20px'}}/>
          <div style={{fontSize:14,color:'var(--text2)',fontWeight:500,marginBottom:6}}>Searching PubMed...</div>
          <div style={{fontSize:12,color:'var(--text3)'}}>Fetching studies · Running AI analysis</div>
        </div>
      )}

      {/* Error */}
      {err && <div style={{padding:'14px 18px',background:'rgba(239,71,111,0.08)',border:'1px solid rgba(239,71,111,0.2)',borderRadius:14,color:'#ef476f',fontSize:13,marginBottom:16}}>⚠ {err}</div>}

      {/* Results */}
      {result && !loading && (
        <div>
          {/* Header */}
          <div className="card" style={{padding:'20px',marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <div>
                <button onClick={reset} style={{background:'none',border:'none',color:'var(--text3)',fontSize:12,cursor:'pointer',fontFamily:'inherit',padding:'0 0 8px',display:'block'}}>← back</button>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div className="display" style={{fontSize:24,color:'var(--text)'}}>{result.query}</div>
                  <span style={{fontSize:9,fontWeight:800,letterSpacing:1.5,padding:'3px 10px',borderRadius:20,background:result.type==='exercise'?'rgba(6,214,160,0.12)':'rgba(108,99,255,0.12)',color:result.type==='exercise'?'#06d6a0':'#a78bfa',textTransform:'uppercase',border:`1px solid ${result.type==='exercise'?'rgba(6,214,160,0.3)':'rgba(108,99,255,0.3)'}`}}>
                    {result.type}
                  </span>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="label" style={{marginBottom:4}}>PubMed</div>
                <div className="display" style={{fontSize:22,color:'var(--accent)'}}>{Number(result.totalStudies).toLocaleString()}</div>
              </div>
            </div>
            <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.75}}>{result.analysis?.overview}</p>
          </div>

          {/* Verdict */}
          {result.analysis?.verdict && (
            <div style={{padding:'18px 20px',marginBottom:12,borderRadius:16,background:vc.bg,border:`1px solid ${vc.border}`,color:vc.color}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div className="label" style={{color:'inherit',opacity:0.6}}>Scientific Verdict</div>
                <span style={{fontSize:9,fontWeight:800,letterSpacing:2,padding:'3px 12px',borderRadius:40,border:'1px solid currentColor',opacity:0.75,textTransform:'uppercase'}}>{result.analysis.verdict.rating}</span>
              </div>
              <p style={{fontSize:13,lineHeight:1.75,marginBottom:8,opacity:0.88}}>{result.analysis.verdict.summary}</p>
              <p style={{fontSize:11,opacity:0.55}}><strong>Best for:</strong> {result.analysis.verdict.bestFor}</p>
            </div>
          )}

          {/* Effects */}
          {result.analysis?.primaryEffects?.length > 0 && (
            <div style={{marginBottom:12}}>
              <div className="label" style={{marginBottom:10}}>{result.type==='exercise'?'Research Findings':'Primary Effects'}</div>
              {result.analysis.primaryEffects.map((ef,i) => {
                const sc = SC[ef.strength?.split(' ')[0]] || SC['Insufficient'];
                return (
                  <div key={i} className="card" style={{padding:'16px 18px',marginBottom:8}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <div style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{ef.effect}</div>
                      <span style={{fontSize:9,fontWeight:800,letterSpacing:1.5,padding:'3px 10px',borderRadius:40,background:sc.bg,color:sc.color,border:`1px solid ${sc.color}30`,textTransform:'uppercase'}}>{ef.strength}</span>
                    </div>
                    <p style={{fontSize:12,color:'var(--text2)',lineHeight:1.65,marginBottom:8}}>{ef.description}</p>
                    <div style={{height:3,background:'var(--surface2)',borderRadius:2,overflow:'hidden'}}>
                      <div style={{width:`${sc.bar}%`,height:'100%',background:`linear-gradient(90deg,${sc.color}70,${sc.color})`,borderRadius:2}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dosage / Programming + Side effects */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            {result.analysis?.dosage && (
              <div className="card" style={{padding:'16px'}}>
                <div style={{fontSize:18,marginBottom:8}}>{result.type==='exercise'?'🏋️':'💊'}</div>
                <div className="label" style={{marginBottom:10}}>{result.type==='exercise'?'Programming':'Dosage'}</div>
                {[
                  {k:result.type==='exercise'?'Sets × Reps':'Typical Dose', v:result.analysis.dosage.typical, color:'var(--accent)'},
                  {k:'Timing',  v:result.analysis.dosage.timing},
                  {k:result.type==='exercise'?'Key Cues':'Best Form', v:result.analysis.dosage.form},
                ].filter(r=>r.v).map((row,i)=>(
                  <div key={i} style={{marginBottom:8}}>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:2,color:'var(--text3)',textTransform:'uppercase',marginBottom:2}}>{row.k}</div>
                    <div style={{fontSize:12,fontWeight:500,color:row.color||'var(--text2)',lineHeight:1.5}}>{row.v}</div>
                  </div>
                ))}
              </div>
            )}
            {result.analysis?.sideEffects?.length > 0 && (
              <div className="card" style={{padding:'16px'}}>
                <div style={{fontSize:18,marginBottom:8}}>{result.type==='exercise'?'⚡':'⚠️'}</div>
                <div className="label" style={{marginBottom:10}}>{result.type==='exercise'?'Watch Out':'Side Effects'}</div>
                {result.analysis.sideEffects.map((se,i)=>(
                  <div key={i} style={{display:'flex',gap:6,padding:'5px 0',borderBottom:i<result.analysis.sideEffects.length-1?'1px solid var(--border)':'none'}}>
                    <span style={{width:4,height:4,borderRadius:'50%',background:'var(--text3)',marginTop:6,flexShrink:0}}/>
                    <p style={{fontSize:11,color:'var(--text2)',lineHeight:1.5}}>{se}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety / Form notes */}
          {result.analysis?.safetyNotes && (
            <div style={{display:'flex',gap:10,padding:'14px 16px',background:'rgba(108,99,255,0.06)',border:'1px solid rgba(108,99,255,0.18)',borderRadius:14,marginBottom:14}}>
              <span style={{fontSize:16,flexShrink:0}}>🛡️</span>
              <p style={{fontSize:12,color:'rgba(167,139,250,0.85)',lineHeight:1.65}}>{result.analysis.safetyNotes}</p>
            </div>
          )}

          {/* Studies */}
          {result.studies?.length > 0 && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div className="label">Published Studies</div>
                <span style={{fontSize:9,fontWeight:700,letterSpacing:1.5,padding:'3px 10px',borderRadius:40,background:'rgba(108,99,255,0.12)',color:'var(--accent)',border:'1px solid rgba(108,99,255,0.25)',textTransform:'uppercase'}}>
                  {result.studies.length} of {Number(result.totalStudies).toLocaleString()}
                </span>
              </div>
              <div className="card" style={{overflow:'hidden',marginBottom:16}}>
                {result.studies.map((s,i)=>(
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{display:'block',textDecoration:'none'}}>
                    <div style={{padding:'14px 18px',borderBottom:i<result.studies.length-1?'1px solid var(--border)':'none',transition:'background 0.15s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
                      onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <div style={{display:'flex',justifyContent:'space-between',gap:10,marginBottom:4}}>
                        <p style={{fontSize:12,fontWeight:500,color:'var(--text2)',lineHeight:1.5,flex:1}}>{s.title}</p>
                        <span style={{fontSize:11,fontWeight:700,color:'var(--accent)',flexShrink:0}}>{s.year}</span>
                      </div>
                      <p style={{fontSize:10,color:'var(--text3)'}}>{s.authors} · {s.journal}</p>
                      <p style={{fontSize:10,color:'rgba(108,99,255,0.6)',marginTop:4,fontWeight:600}}>View on PubMed →</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <button onClick={reset} style={{width:'100%',padding:'13px',background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:12,color:'var(--text2)',fontSize:13,fontFamily:'inherit',cursor:'pointer'}}>
            ← Search again
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
