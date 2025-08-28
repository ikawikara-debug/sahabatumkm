// POST: /api/hpp/compute
// Body: { items: [{ ingredient, qty, unit_price }], portions, margin }
type Item = { ingredient: string; qty: number; unit_price: number };

function rupiahRound(x: number) {
  // bulatkan ke kelipatan Rp100 terdekat ke atas agar aman
  const step = 100;
  return Math.ceil(x / step) * step;
}
function mustNumber(n: any, name: string) {
  const v = Number(n);
  if (!Number.isFinite(v)) throw new Error(Invalid number: ${name});
  return v;
}

export default function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        usage: 'POST JSON { items:[{ingredient,qty,unit_price}], portions, margin }',
        sample: {
          items: [
            { ingredient: 'Nasi',  qty: 5,  unit_price: 16000 },
            { ingredient: 'Telur', qty: 30, unit_price: 2000  },
          ],
          portions: 50,
          margin: 30,
        },
      });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const items: Item[] = Array.isArray(req.body?.items) ? req.body.items : [];
    const portions      = Math.max(1, mustNumber(req.body?.portions, 'portions'));
    const margin        = Math.max(0, mustNumber(req.body?.margin ?? 0, 'margin'));

    const totalCost = items.reduce((acc, it) => {
      const qty  = mustNumber(it.qty, 'qty');
      const unit = mustNumber(it.unit_price, 'unit_price');
      return acc + qty * unit;
    }, 0);

    const hppPerPortion   = totalCost / portions;
    const suggestedPrice  = rupiahRound(hppPerPortion / (1 - margin / 100));

    res.status(200).json({
      inputs: { items, portions, margin },
      result: {
        totalCost,
        hppPerPortion,
        suggestedPrice,
      },
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Bad Request' });
  }
}
