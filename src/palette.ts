// HSL to hex conversion
function hslToHex(h: number, s: number, l: number): string {
  const sl = s / 100;
  const ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

type Strategy = 'analogous' | 'complementary' | 'triadic' | 'split-complementary';

function pickStrategy(): Strategy {
  const strategies: Strategy[] = ['analogous', 'complementary', 'triadic', 'split-complementary'];
  return strategies[Math.floor(Math.random() * strategies.length)];
}

export function generatePalette(): string[] {
  const baseHue = Math.floor(Math.random() * 360);
  const baseSat = 55 + Math.floor(Math.random() * 35); // 55–90
  const baseLit = 40 + Math.floor(Math.random() * 25); // 40–65

  const strategy = pickStrategy();

  let hues: number[];

  if (strategy === 'analogous') {
    const spread = 20 + Math.floor(Math.random() * 15);
    hues = [-2, -1, 0, 1, 2].map(i => (baseHue + i * spread + 360) % 360);
  } else if (strategy === 'complementary') {
    const comp = (baseHue + 180) % 360;
    hues = [
      baseHue,
      (baseHue + 30) % 360,
      (baseHue + 15) % 360,
      comp,
      (comp + 20) % 360,
    ];
  } else if (strategy === 'triadic') {
    const t1 = (baseHue + 120) % 360;
    const t2 = (baseHue + 240) % 360;
    hues = [baseHue, (baseHue + 20) % 360, t1, (t1 + 20) % 360, t2];
  } else {
    // split-complementary
    const s1 = (baseHue + 150) % 360;
    const s2 = (baseHue + 210) % 360;
    hues = [baseHue, (baseHue + 20) % 360, s1, (s1 + 15) % 360, s2];
  }

  // Vary saturation and lightness slightly per swatch
  return hues.map((h, i) => {
    const sVariance = (i % 3 === 0 ? -8 : 5);
    const lVariance = [-8, 5, 0, -5, 10][i];
    const s = Math.max(30, Math.min(95, baseSat + sVariance));
    const l = Math.max(25, Math.min(75, baseLit + lVariance));
    return hslToHex(h, s, l);
  });
}
