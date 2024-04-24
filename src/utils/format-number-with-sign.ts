export const formatNumberWithSign = (num: number, fractionDigits = 2) => {
  const formattedNum = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Math.abs(num));

  return num < 0 ? `-${formattedNum}` : `+${formattedNum}`;
};
