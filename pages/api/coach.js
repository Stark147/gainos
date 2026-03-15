// pages/api/coach.js
// This runs on the server — API key is safe here, never exposed to browser

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { workoutSummary, exerciseHistory } = req.body;

  if (!workoutSummary) return res.status(400).json({ error: 'No workout data' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are GainOS AI Coach — an expert strength training coach. 
Analyze the workout data and provide specific, actionable recommendations.
Be direct, confident, and encouraging. Use simple language.
Format your response with clear sections:
1. 💪 What you did well (1-2 lines)
2. 📈 Progressive overload plan (specific weights/reps for next session, per exercise)
3. ⚠️ Watch out for (1 recovery/form note if relevant)
Keep total response under 200 words. No fluff.`,
        messages: [{
          role: 'user',
          content: `Analyze this workout and give me my next session plan:

TODAY'S SESSION:
${workoutSummary}

EXERCISE HISTORY (last sessions):
${exerciseHistory || 'First time logging these exercises'}

Give me specific weight targets for my NEXT session.`
        }]
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.content?.[0]?.text || 'Could not generate recommendations.';
    return res.status(200).json({ recommendation: text });

  } catch (err) {
    console.error('AI API error:', err);
    return res.status(500).json({ error: 'AI service unavailable. Try again.' });
  }
}
