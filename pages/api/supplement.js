export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { query, type } = req.body;
  if (!query?.trim()) return res.status(400).json({ error: 'No search term provided' });

  const name = query.trim();
  const isExercise = type === 'exercise';

  try {
    // PubMed search
    const searchTerm = isExercise
      ? `${name}[Title/Abstract] AND (exercise OR training OR muscle OR strength OR hypertrophy)`
      : `${name}[Title/Abstract]`;

    const searchRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchTerm)}&retmax=15&retmode=json&sort=relevance`);
    const searchData = await searchRes.json();
    const ids = searchData.esearchresult?.idlist || [];

    let studies = [];
    if (ids.length > 0) {
      const summaryRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.slice(0,10).join(',')}&retmode=json`);
      const summaryData = await summaryRes.json();
      studies = ids.slice(0,10).map(id => {
        const doc = summaryData.result?.[id];
        if (!doc) return null;
        return {
          id, url:`https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          title: doc.title || 'Untitled',
          authors: (doc.authors||[]).slice(0,3).map(a=>a.name).join(', ') || 'Unknown',
          journal: doc.fulljournalname || doc.source || 'Unknown Journal',
          year: doc.pubdate ? doc.pubdate.split(' ')[0] : 'N/A',
        };
      }).filter(Boolean);
    }

    const studyContext = studies.length > 0
      ? studies.map((s,i) => `${i+1}. "${s.title}" — ${s.authors} (${s.year}, ${s.journal})`).join('\n')
      : 'No specific PubMed studies found.';

    const systemPrompt = isExercise
      ? `You are a sports science and exercise research assistant. Analyze the exercise based on published research. Respond ONLY in this exact JSON format with no other text:
{"overview":"2-3 sentences about what this exercise is and what muscles/systems it targets","primaryEffects":[{"effect":"primary benefit name","strength":"Strong/Moderate/Weak/Insufficient","description":"1-2 sentence explanation with evidence context"},{"effect":"secondary benefit","strength":"Strong/Moderate/Weak/Insufficient","description":"1-2 sentences"},{"effect":"third benefit","strength":"Strong/Moderate/Weak/Insufficient","description":"1-2 sentences"}],"dosage":{"typical":"recommended sets x reps range","timing":"when in workout / training frequency","form":"key form cues or variations"},"sideEffects":["injury risk 1","common mistake","contraindication if any"],"verdict":{"rating":"Strong Evidence / Moderate Evidence / Weak Evidence / Mixed Evidence / Insufficient Evidence","summary":"2-3 honest sentences on what research says about this exercise's effectiveness","bestFor":"who benefits most from this exercise"},"safetyNotes":"Important form cues, injury prevention, or who should avoid this exercise"}`
      : `You are a scientific supplement research assistant. Respond ONLY in this exact JSON format with no other text:
{"overview":"2-3 sentence overview of what this supplement is","primaryEffects":[{"effect":"effect name","strength":"Strong/Moderate/Weak/Insufficient","description":"1-2 sentence explanation"},{"effect":"effect name","strength":"Strong/Moderate/Weak/Insufficient","description":"1-2 sentences"},{"effect":"effect name","strength":"Strong/Moderate/Weak/Insufficient","description":"1-2 sentences"}],"dosage":{"typical":"typical dose range","timing":"when to take it","form":"best form"},"sideEffects":["side effect 1","side effect 2","side effect 3"],"verdict":{"rating":"Strong Evidence / Moderate Evidence / Weak Evidence / Mixed Evidence / Insufficient Evidence","summary":"2-3 honest sentences on whether this supplement is worth taking","bestFor":"who benefits most"},"safetyNotes":"Important safety info, interactions, or warnings"}`;

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Analyze: "${name}" (type: ${isExercise ? 'exercise' : 'supplement'})\n\nPubMed studies found:\n${studyContext}\n\nProvide analysis in the exact JSON format specified.`
        }]
      }),
    });

    const aiData = await aiRes.json();
    if (aiData.error) return res.status(500).json({ error: 'AI analysis failed: ' + aiData.error.message });

    let analysis = null;
    try {
      const clean = (aiData.content?.[0]?.text || '').replace(/```json|```/g, '').trim();
      analysis = JSON.parse(clean);
    } catch {
      analysis = { overview: aiData.content?.[0]?.text || 'Analysis unavailable', primaryEffects: [], verdict: { rating: 'See overview', summary: '', bestFor: '' }, dosage: {}, sideEffects: [], safetyNotes: '' };
    }

    return res.status(200).json({
      query: name,
      type: isExercise ? 'exercise' : 'supplement',
      totalStudies: searchData.esearchresult?.count || 0,
      studies,
      analysis,
    });

  } catch (err) {
    console.error('Research API error:', err);
    return res.status(500).json({ error: 'Research failed. Try again.' });
  }
}
