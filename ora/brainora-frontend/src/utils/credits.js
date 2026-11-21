// Shows 5.00 as "5", 2.50 as "2.5", 1.25 as "1.25".
export function formatCredits(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '0';
  }

  return number.toFixed(2).replace(/\.?0+$/, '');
}