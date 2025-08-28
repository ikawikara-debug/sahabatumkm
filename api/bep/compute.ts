// POST: /api/bep/compute
// Body: { price, variableCost, fixedCost, daysOpen }
function mustNumber(n: any, name: string) {
  const v = Number(n);
  if (!Number.isFinite(v)) throw new Error(Invalid number: ${name});
  return v;
}

export default function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        usage: 'POST JSON { price, variableCost, fixedCost, daysOpen }',
        sample: { price: 15000, variableCost: 8000, fixedCost: 3000000, daysOpen: 30 },
      });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const price       = mustNumber(req.body?.price, 'price');
    const variable    = mustNumber(req.body?.variableCost, 'variableCost');
    const fixed       = mustNumber(req.body?.fixedCost, 'fixedCost');
    const daysOpen    = Math.max(1, mustNumber(req.body?.daysOpen ?? 30, 'daysOpen'));

    const contrib = price - variable;
    if (contrib <= 0) return res.status(400).json({ error: 'price must be > variableCost' });

    const monthlyUnits = Math.ceil(fixed / contrib);
    const dailyUnits   = Math.ceil(monthlyUnits / daysOpen);

    res.status(200).json({
      inputs: { price, variableCost: variable, fixedCost: fixed, daysOpen },
      result: { contributionPerUnit: contrib, bepUnitsMonthly: monthlyUnits, bepUnitsPerDay: dailyUnits },
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Bad Request' });
  }
}
