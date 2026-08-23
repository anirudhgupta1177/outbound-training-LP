/**
 * Splitting revenue by what was actually sold.
 *
 * The orders table holds two shapes, and the difference is why the admin could
 * only ever show one blended number:
 *
 *   - The course checkout writes one row per sale with an EMPTY items array.
 *     The whole order is a single product.
 *   - The micro funnel writes the cart it sold: a front-end offer plus any
 *     order bumps, or the 1:1 session on its own. One row, several products,
 *     each with its own price.
 *
 * So an order's gross is split across its line items in proportion to their
 * list prices, and orders with no line items count as one product. Rounding
 * remainders go to the last line, which is what keeps every product total
 * summing back to the order total exactly — a breakdown that does not
 * reconcile is worse than none, because it quietly disagrees with the headline
 * figure sitting above it.
 */

/** Fallback labels for orders that carry no line items of their own. */
const PRODUCT_LABELS = {
  'outbound-mastery': 'Outbound Mastery (full course)',
  'outbound-micro-course': 'Micro-offer funnel',
  'micro-oto-session': '1:1 Session (funnel OTO)',
  'consult-call': '1 Hour Consultation Call',
};

const labelFor = (key, fallback) => PRODUCT_LABELS[key] || fallback || key;

/**
 * Split one order into { key, label, amount } lines summing to order.amount.
 * @param {object} order
 * @returns {Array<{key:string,label:string,amount:number}>}
 */
export function splitOrder(order) {
  const gross = Number(order.amount) || 0;
  const items = Array.isArray(order.items) ? order.items.filter((i) => i && i.key) : [];

  if (items.length === 0) {
    const key = order.product || order.source || 'unknown';
    return [{ key, label: labelFor(key), amount: gross }];
  }

  const listTotal = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  // Every line price zero (a ₹1 test coupon can do this): split evenly rather
  // than dividing by zero.
  if (listTotal <= 0) {
    const each = Math.floor(gross / items.length);
    return items.map((i, idx) => ({
      key: i.key,
      label: labelFor(i.key, i.name),
      amount: idx === items.length - 1 ? gross - each * (items.length - 1) : each,
    }));
  }

  let allocated = 0;
  return items.map((i, idx) => {
    const last = idx === items.length - 1;
    // The last line absorbs the rounding remainder so the split is exact.
    const amount = last
      ? gross - allocated
      : Math.round((gross * (Number(i.price) || 0)) / listTotal);
    allocated += amount;
    return { key: i.key, label: labelFor(i.key, i.name), amount };
  });
}

/**
 * Product and ticket-price breakdowns for a set of orders.
 *
 * Revenue is kept per currency rather than summed: an order in USD and an
 * order in INR cannot be added together, and a single "revenue" column that
 * silently does so is how a dashboard ends up lying.
 */
export function buildBreakdown(orders = []) {
  const products = new Map();
  const tickets = new Map();

  for (const order of orders) {
    const currency = order.currency === 'USD' ? 'USD' : 'INR';

    // --- ticket price: what the customer actually paid, as one figure ---
    const gross = (Number(order.amount) || 0) / 100;
    const tKey = `${currency}|${gross}`;
    const ticket = tickets.get(tKey) || { currency, price: gross, orders: 0 };
    ticket.orders += 1;
    tickets.set(tKey, ticket);

    // --- product lines ---
    const lines = splitOrder(order);
    for (const line of lines) {
      const entry = products.get(line.key) || {
        key: line.key,
        label: line.label,
        units: 0,
        orders: 0,
        revenue: { INR: 0, USD: 0 },
      };
      entry.units += 1;
      entry.revenue[currency] += line.amount / 100;
      products.set(line.key, entry);
    }

    // `orders` counts how many orders contained the product at all, which is
    // not the same as `units` once a cart can hold the same key twice.
    for (const key of new Set(lines.map((l) => l.key))) {
      products.get(key).orders += 1;
    }
  }

  const byProduct = [...products.values()]
    .map((p) => ({
      ...p,
      revenue: { INR: Math.round(p.revenue.INR * 100) / 100, USD: Math.round(p.revenue.USD * 100) / 100 },
    }))
    .sort((a, b) => b.revenue.INR + b.revenue.USD - (a.revenue.INR + a.revenue.USD));

  const byTicketPrice = [...tickets.values()].sort(
    (a, b) => b.orders - a.orders || b.price - a.price
  );

  return { byProduct, byTicketPrice };
}
