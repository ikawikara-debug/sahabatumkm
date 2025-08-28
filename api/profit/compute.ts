// POST: /api/profit/compute
// Body: { price, variableCost, fixedCost, unitsPerDay, daysOpen, marketingPercent }
function mustNumber(n: any, name: string) {
  const v = Number(n);
  if (!Number.isFinite(v)) throw new Error(Invalid number: ${name});
  return v;
}

export default function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        usage: 'POST JSON { price, variableCost, fixedCost, unitsPerDay, daysOpen, marketingPercent }',
        sample: { price: 15000, variableCost: 8000, fixedCost: 3000000, unitsPerDay: 40, daysOpen: 30, marketingPercent: 5 },
      });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const price       = mustNumber(req.body?.price, 'price');
    const varCost     = mustNumber(req.body?.variableCost, 'variableCost');
    const fixed       = mustNumber(req.body?.fixedCost, 'fixedCost');
    const unitsPerDay = Math.max(0, mustNumber(req.body?.unitsPerDay, 'unitsPerDay'));
    const daysOpen    = Math.max(1, mustNumber(req.body?.daysOpen ?? 30, 'daysOpen'));
    const mktPct      = Math.max(0, mustNumber(req.body?.marketingPercent ?? 0, 'marketingPercent')) / 100;

    const unitsMonth  = unitsPerDay * daysOpen;
    const revenue     = price * unitsMonth;
    const variable    = varCost * unitsMonth;
    const marketing   = revenue * mktPct;
    const netProfit   = revenue - variable - fixed - marketing;

    res.status(200).json({
      inputs: { price, variableCost: varCost, fixedCost: fixed, unitsPerDay, daysOpen, marketingPercent: mktPct * 100 },
      result: {
        unitsMonth,
        revenue,
        variable,
        fixed,
        marketing,
        netProfit,
        profitPerDay: netProfit / daysOpen,
      },
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Bad Request' });
  }
}
