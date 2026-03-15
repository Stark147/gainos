import { useState, useRef } from 'react';
import Head from 'next/head';

const POPULAR = ['Creatine','Ashwagandha','Vitamin D','Magnesium','Omega-3','Berberine','NMN','Collagen','Lions Mane','Melatonin','Zinc','Rhodiola','CoQ10','Glutathione'];

const VERDICT_MAP = {
  'Strong Evidence':'verdict-strong',
  'Moderate Evidence':'verdict-moderate',
  'Weak Evidence':'verdict-weak',
  'Mixed Evidence':'verdict-mixed',
  'Insufficient Evidence':'verdict-weak',
};

const STRENGTH_CFG = {
  'Strong':    {color:'#00d98b',bg:'rgba(0,217,139,0.1)', bar:100},
  'Moderate':  {color:'#ffca28',bg:'rgba(255,202,40,0.1)', bar:66},
  'Weak':      {color:'#ff5f7e',bg:'rgba(255,95,126,0.1)', bar:33},
  'Insufficient':{color:'#4fc3f7',bg:'rgba(79,195,247,0.1)',bar:15},
};

export default function Home(){
  const [q,setQ]=useState('');
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [err,setErr]=useState(null);
  const inputRef=useRef();

  const search=async(name)=>{
    const term=(name||q).trim();
    if(!term)return;
    setLoading(true);setErr(null);setResult(null);
    if(name)setQ(name);
    try{
      const res=await fetch('/api/research',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({supplement:term})});
      const data=await res.json();
      if(data.error)setErr(data.error);
      else setResult(data);
    }catch{setErr('Connection error. Please try again.');}
    setLoading(false);
  };

  const reset=()=>{setResult(null);setErr(null);setQ('');setTimeout(()=>inputRef.current?.focus(),100)};
  const vClass=result?.analysis?.verdict?.rating?VERDICT_MAP[result.analysis.verdict.rating]||'verdict-mixed':'verdict-mixed';

  return(<>
    <Head><title>{result?`${result.supplement} — SupplIQ`:'SupplIQ — Supplement Intelligence'}</title></Head>
    <div className="page">

      {/* ── HERO ── */}
      {!result&&!loading&&(
        <div style={{textAlign:'center',paddingTop:40,marginBottom:56}}>
          <div className="u0" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'5px 14px',background:'rgba(0,217,139,0.08)',border:'1px solid rgba(0,217,139,0.2)',borderRadius:40,marginBottom:28}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#00d98b',display:'inline-block'}}/>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:3,color:'#00d98b',textTransform:'uppercase'}}>SupplIQ Research</span>
          </div>
          <h1 className="u1 serif" style={{fontSize:'clamp(36px,7vw,64px)',lineHeight:1.05,color:'#f4f5fa',marginBottom:18}}>
            Science-backed<br/>
            <span style={{background:'linear-gradient(135deg,#00d98b,#4fc3f7)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>supplement research</span>
          </h1>
          <p className="u2" style={{fontSize:17,color:'rgba(244,245,250,0.45)',lineHeight:1.7,maxWidth:480,margin:'0 auto 0'}}>
            Enter any supplement. Get real published studies from PubMed's 35M+ database with AI-powered analysis — instantly.
          </p>
        </div>
      )}

      {/* ── RESULT HEADER ── */}
      {result&&(
        <div className="u0" style={{marginBottom:32,display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
          <div>
            <button onClick={reset} style={{background:'none',border:'none',color:'rgba(244,245,250,0.35)',fontSize:13,cursor:'pointer',fontFamily:'Figtree,sans-serif',padding:'0 0 12px',display:'flex',alignItems:'center',gap:6,transition:'color 0.15s'}}
              onMouseEnter={e=>e.target.style.color='#f4f5fa'} onMouseLeave={e=>e.target.style.color='rgba(244,245,250,0.35)'}>
              ← Search again
            </button>
            <h1 className="serif" style={{fontSize:36,color:'#f4f5fa',marginBottom:4}}>{result.supplement}</h1>
            <p style={{fontSize:13,color:'rgba(244,245,250,0.35)'}}>
              <span style={{color:'#00d98b',fontWeight:600}}>{Number(result.totalStudies).toLocaleString()}</span> studies on PubMed · {result.studies?.length||0} fetched
            </p>
          </div>
        </div>
      )}

      {/* ── SEARCH BAR ── */}
      <div className={result?'u0':'u3'} style={{marginBottom:result?28:40}}>
        <div className="search-outer">
          <span className="search-ico">🔬</span>
          <input ref={inputRef} className="search-input" type="text" placeholder="Search any supplement — Creatine, Ashwagandha, NMN..." value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} autoFocus={!result}/>
          <button className="search-btn" onClick={()=>search()} disabled={loading||!q.trim()}>
            {loading?'···':'Search'}
          </button>
        </div>
      </div>

      {/* ── POPULAR PILLS ── */}
      {!result&&!loading&&(
        <div className="u4" style={{marginBottom:20}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:3,color:'rgba(244,245,250,0.2)',textTransform:'uppercase',textAlign:'center',marginBottom:16}}>Popular Searches</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center'}}>
            {POPULAR.map(s=><span key={s} className="pill" onClick={()=>search(s)}>{s}</span>)}
          </div>
        </div>
      )}

      {/* ── LOADING ── */}
      {loading&&(
        <div style={{textAlign:'center',padding:'80px 20px'}}>
          <div className="spin" style={{margin:'0 auto 24px'}}/>
          <p style={{fontSize:16,color:'rgba(244,245,250,0.5)',fontWeight:500,marginBottom:8}}>Searching PubMed database...</p>
          <p style={{fontSize:13,color:'rgba(244,245,250,0.25)'}}>Fetching studies · Running AI analysis</p>
        </div>
      )}

      {/* ── ERROR ── */}
      {err&&(
        <div style={{padding:'16px 20px',background:'rgba(255,95,126,0.07)',border:'1px solid rgba(255,95,126,0.2)',borderRadius:14,color:'#ff5f7e',fontSize:14,marginBottom:20}}>
          ⚠ {err}
        </div>
      )}

      {/* ══════════ RESULTS ══════════ */}
      {result&&!loading&&(
        <div>

          {/* Overview card */}
          <div className="card card-shine u1" style={{padding:'28px',marginBottom:14}}>
            <p className="label" style={{marginBottom:12}}>Overview</p>
            <p style={{fontSize:15,color:'rgba(244,245,250,0.62)',lineHeight:1.8}}>{result.analysis?.overview}</p>
          </div>

          {/* Verdict */}
          {result.analysis?.verdict&&(
            <div className={`verdict-banner u2`} style={{marginBottom:14,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:'1px',background:'linear-gradient(90deg,transparent,var(--vc,#00d98b),transparent)',opacity:0.5}}/>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:8}}>
                <p className="label" style={{color:'inherit',opacity:0.6}}>Scientific Verdict</p>
                <span style={{fontSize:10,fontWeight:800,letterSpacing:2,padding:'4px 14px',borderRadius:40,border:'1px solid currentColor',opacity:0.75,textTransform:'uppercase'}}>
                  {result.analysis.verdict.rating}
                </span>
              </div>
              <p style={{fontSize:15,lineHeight:1.8,marginBottom:14,opacity:0.88}}>{result.analysis.verdict.summary}</p>
              <p style={{fontSize:12,opacity:0.55}}><strong>Best for:</strong> {result.analysis.verdict.bestFor}</p>
            </div>
          )}

          {/* Effects */}
          {result.analysis?.primaryEffects?.length>0&&(
            <div className="u3" style={{marginBottom:14}}>
              <p className="label" style={{marginBottom:12}}>Primary Effects</p>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {result.analysis.primaryEffects.map((ef,i)=>{
                  const sc=STRENGTH_CFG[ef.strength?.split(' ')[0]]||STRENGTH_CFG['Insufficient'];
                  return(
                    <div key={i} className="card card-shine" style={{padding:'20px 22px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                        <p style={{fontSize:14,fontWeight:600,color:'#f4f5fa'}}>{ef.effect}</p>
                        <span style={{fontSize:9,fontWeight:800,letterSpacing:1.5,padding:'3px 12px',borderRadius:40,textTransform:'uppercase',background:sc.bg,color:sc.color,border:`1px solid ${sc.color}30`}}>
                          {ef.strength}
                        </span>
                      </div>
                      <p style={{fontSize:13,color:'rgba(244,245,250,0.5)',lineHeight:1.7,marginBottom:10}}>{ef.description}</p>
                      <div className="ebar-track">
                        <div className="ebar-fill" style={{width:`${sc.bar}%`,background:`linear-gradient(90deg,${sc.color}80,${sc.color})`}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dosage + Side Effects */}
          <div className="u4" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            {result.analysis?.dosage&&(
              <div className="card card-shine" style={{padding:'22px'}}>
                <div style={{fontSize:22,marginBottom:12}}>💊</div>
                <p className="label" style={{marginBottom:16}}>Dosage Guide</p>
                {[
                  {k:'TYPICAL DOSE',v:result.analysis.dosage.typical,color:'#00d98b'},
                  {k:'TIMING',v:result.analysis.dosage.timing},
                  {k:'BEST FORM',v:result.analysis.dosage.form},
                ].filter(r=>r.v).map((row,i)=>(
                  <div key={i} style={{marginBottom:12}}>
                    <p style={{fontSize:9,fontWeight:700,letterSpacing:2,color:'rgba(244,245,250,0.25)',textTransform:'uppercase',marginBottom:3}}>{row.k}</p>
                    <p style={{fontSize:13,fontWeight:500,color:row.color||'rgba(244,245,250,0.6)',lineHeight:1.5}}>{row.v}</p>
                  </div>
                ))}
              </div>
            )}
            {result.analysis?.sideEffects?.length>0&&(
              <div className="card card-shine" style={{padding:'22px'}}>
                <div style={{fontSize:22,marginBottom:12}}>⚠️</div>
                <p className="label" style={{marginBottom:16}}>Side Effects</p>
                {result.analysis.sideEffects.map((se,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,padding:'6px 0',borderBottom:i<result.analysis.sideEffects.length-1?'1px solid rgba(255,255,255,0.06)':'none'}}>
                    <span style={{width:4,height:4,borderRadius:'50%',background:'rgba(244,245,250,0.2)',marginTop:7,flexShrink:0}}/>
                    <p style={{fontSize:12,color:'rgba(244,245,250,0.5)',lineHeight:1.5}}>{se}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety */}
          {result.analysis?.safetyNotes&&(
            <div className="u4" style={{display:'flex',gap:14,alignItems:'flex-start',padding:'16px 20px',background:'rgba(79,195,247,0.05)',border:'1px solid rgba(79,195,247,0.15)',borderRadius:14,marginBottom:20}}>
              <span style={{fontSize:18,flexShrink:0,marginTop:1}}>🛡️</span>
              <p style={{fontSize:13,color:'rgba(79,195,247,0.8)',lineHeight:1.7}}>{result.analysis.safetyNotes}</p>
            </div>
          )}

          {/* Studies */}
          {result.studies?.length>0&&(
            <div className="u5">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <p className="label">Published Studies</p>
                <span style={{fontSize:10,fontWeight:700,letterSpacing:1.5,padding:'3px 12px',borderRadius:40,background:'rgba(0,217,139,0.1)',color:'#00d98b',border:'1px solid rgba(0,217,139,0.2)',textTransform:'uppercase'}}>
                  {result.studies.length} of {Number(result.totalStudies).toLocaleString()} found
                </span>
              </div>
              <div className="card" style={{overflow:'hidden'}}>
                {result.studies.map((s,i)=>(
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="study-link">
                    <div className="study-row">
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,marginBottom:6}}>
                        <p style={{fontSize:13,fontWeight:500,color:'rgba(244,245,250,0.82)',lineHeight:1.55,flex:1}}>{s.title}</p>
                        <span style={{fontSize:12,fontWeight:700,color:'#00d98b',flexShrink:0,fontFamily:'Figtree,sans-serif'}}>{s.year}</span>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:4}}>
                        <p style={{fontSize:11,color:'rgba(244,245,250,0.3)'}}>{s.authors}</p>
                        <p style={{fontSize:10,color:'rgba(244,245,250,0.2)',fontStyle:'italic'}}>{s.journal}</p>
                      </div>
                      <p style={{fontSize:11,color:'rgba(0,217,139,0.5)',marginTop:6,fontWeight:500}}>View on PubMed →</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Bottom reset */}
          <div style={{marginTop:40,textAlign:'center'}}>
            <button onClick={reset} className="btn btn-ghost" style={{width:'auto',padding:'12px 32px'}}>
              ← Search another supplement
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{marginTop:result?60:40,textAlign:'center',fontSize:11,color:'rgba(244,245,250,0.18)',lineHeight:1.8}}>
        Studies sourced from PubMed (NIH National Library of Medicine)<br/>
        For informational purposes only · Consult a healthcare professional before use
      </div>

    </div>
  </>);
}
