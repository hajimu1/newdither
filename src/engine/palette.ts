// src/engine/palette.ts
// ===============================================================
// Palette Engine
// - hex/rgb 변환
// - closest color
// - built-in palettes
// - k-means auto palette
// ===============================================================

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

/* ===============================================================
   Color Utils
=============================================================== */
export const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (x: number) =>
    clamp(Math.round(x), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/* ===============================================================
   Palette Helpers
=============================================================== */
export function closestColor(
  r: number,
  g: number,
  b: number,
  palette: number[][]
): number[] {
  let best = palette[0];
  let min = Infinity;

  for (const c of palette) {
    const d = (r - c[0]) ** 2 + (g - c[1]) ** 2 + (b - c[2]) ** 2;
    if (d < min) {
      min = d;
      best = c;
    }
  }
  return best;
}

/* ===============================================================
   Built-in Palettes
=============================================================== */
export const PALETTES: Record<string, string[]> = {
  bw: ['#000000', '#FFFFFF'],

  gray4: ['#000000', '#555555', '#AAAAAA', '#FFFFFF'],

  gray8: [
    '#000000',
    '#242424',
    '#494949',
    '#6D6D6D',
    '#929292',
    '#B6B6B6',
    '#DBDBDB',
    '#FFFFFF',
  ],

  gray16: [
    '#000000',
    '#111111',
    '#222222',
    '#333333',
    '#444444',
    '#555555',
    '#666666',
    '#777777',
    '#888888',
    '#999999',
    '#AAAAAA',
    '#BBBBBB',
    '#CCCCCC',
    '#DDDDDD',
    '#EEEEEE',
    '#FFFFFF',
  ],

  sepia: [
    '#2E1F0F',
    '#3F2A15',
    '#5C4123',
    '#7A5831',
    '#9A6F3F',
    '#B7864D',
    '#D49D5B',
    '#F2B469',
  ],

  samcoupe: [
    '#000000',
    '#222222',
    '#7F7F7F',
    '#BFBFBF',
    '#FFFFFF',
    '#00007F',
    '#0000FF',
    '#7F0000',
    '#FF0000',
    '#7F007F',
    '#FF00FF',
    '#007F00',
    '#00FF00',
    '#007F7F',
    '#00FFFF',
    '#FFFF00',
  ],

  gameboy: ['#0F380F', '#306230', '#8BAC0F', '#9BBC0F'],

  cga16: [
    '#000000',
    '#0000AA',
    '#00AA00',
    '#00AAAA',
    '#AA0000',
    '#AA00AA',
    '#AA5500',
    '#AAAAAA',
    '#555555',
    '#5555FF',
    '#55FF55',
    '#55FFFF',
    '#FF5555',
    '#FF55FF',
    '#FFFF55',
    '#FFFFFF',
  ],

  cpc16: [
    '#000000',
    '#0000FF',
    '#FF0000',
    '#FF00FF',
    '#00FF00',
    '#00FFFF',
    '#FFFF00',
    '#FFFFFF',
    '#000080',
    '#800000',
    '#800080',
    '#008000',
    '#008080',
    '#808000',
    '#808080',
    '#FF8000',
  ],

  cpc27: [
    '#000000',
    '#0000FF',
    '#FF0000',
    '#FF00FF',
    '#00FF00',
    '#00FFFF',
    '#FFFF00',
    '#FFFFFF',
    '#000080',
    '#800000',
    '#800080',
    '#008000',
    '#008080',
    '#808000',
    '#808080',
    '#FF8000',
    '#FF8080',
    '#80FF80',
    '#8080FF',
    '#80FFFF',
    '#FFFF80',
    '#FF80FF',
    '#C0C0C0',
    '#404040',
    '#FFA0A0',
    '#A0FFA0',
    '#A0A0FF',
  ],

  teletext8: [
    '#000000',
    '#FF0000',
    '#00FF00',
    '#FFFF00',
    '#0000FF',
    '#FF00FF',
    '#00FFFF',
    '#FFFFFF',
  ],

  vic20: [
    '#000000',
    '#FFFFFF',
    '#8B3F2F',
    '#B97A56',
    '#7A53A6',
    '#5CAB5E',
    '#4F45B5',
    '#8ED6D1',
    '#AA6FCF',
    '#C58B7C',
    '#D48FEA',
    '#87D18B',
    '#7F76E4',
    '#B9B9B9',
    '#D9D98F',
    '#E9E9AA',
  ],

  tms9918: [
    '#000000',
    '#2ECC40',
    '#66D97A',
    '#5B5BEA',
    '#7D7DFF',
    '#D9534F',
    '#4DD0E1',
    '#FF5E57',
    '#FF8A80',
    '#C8C84A',
    '#E6E68A',
    '#26A65B',
    '#C86DD7',
    '#BDBDBD',
    '#FFFFFF',
    '#D8C27A',
  ],

  intellivision: [
    '#0A0000',
    '#3A6EA5',
    '#6BCB2C',
    '#C81D77',
    '#FF7F11',
    '#F4E409',
    '#0B8F1A',
    '#1A33FF',
    '#6EC1E4',
    '#A98BE0',
    '#C7D36F',
    '#F72C7A',
    '#B0B0B0',
    '#FFFFFF',
    '#6B4F00',
    '#2D2D2D',
  ],

  pico8: [
    '#000000',
    '#1D2B53',
    '#7E2553',
    '#008751',
    '#AB5236',
    '#5F574F',
    '#C2C3C7',
    '#FFF1E8',
    '#FF004D',
    '#FFA300',
    '#FFEC27',
    '#00E436',
    '#29ADFF',
    '#83769C',
    '#FF77A8',
    '#FFCCAA',
  ],

  nes: [
    '#7C7C7C',
    '#0000FC',
    '#0000BC',
    '#4428BC',
    '#940084',
    '#A80020',
    '#A81000',
    '#881400',
    '#503000',
    '#007800',
    '#006800',
    '#005800',
    '#004058',
    '#000000',
    '#BCBCBC',
    '#0078F8',
  ],

  apple2: ['#000000', '#FFFFFF', '#FF00FF', '#00FFFF', '#00FF00', '#FF0000'],

  commodore64: [
    '#000000',
    '#FFFFFF',
    '#68372B',
    '#70A4B2',
    '#6F3D86',
    '#588D43',
    '#352879',
    '#B8C76F',
    '#6F4F25',
    '#433900',
    '#9A6759',
    '#444444',
    '#6C6C6C',
    '#9AD284',
    '#6C5EB5',
    '#959595',
  ],

  'zx-spectrum': [
    '#000000',
    '#0000D7',
    '#D70000',
    '#D700D7',
    '#00D700',
    '#00D7D7',
    '#D7D700',
    '#D7D7D7',
  ],

  pastel8: [
    '#FFB3BA',
    '#FFDFBA',
    '#FFFFBA',
    '#BAFFC9',
    '#BAE1FF',
    '#E0BBE4',
    '#957DAD',
    '#D291BC',
  ],

  vaporwave6: [
    '#FF71CE',
    '#01CDFE',
    '#05FFA1',
    '#B967FF',
    '#FFFB96',
    '#F5A9B8',
  ],

  neon8: [
    '#FF00FF',
    '#00FFFF',
    '#39FF14',
    '#FFEA00',
    '#FF6EC7',
    '#00BFFF',
    '#FF1493',
    '#ADFF2F',
  ],

  warm8: [
    '#2B1100',
    '#5C1A00',
    '#8A3000',
    '#B84C0A',
    '#D86C1F',
    '#F08F3A',
    '#FFC766',
    '#FFE6A8',
  ],

  db16: [
    '#000000',
    '#442434',
    '#30346D',
    '#4E4A4E',
    '#854C30',
    '#346524',
    '#D04648',
    '#757161',
    '#597DCE',
    '#D27D2C',
    '#8595A1',
    '#6DAA2C',
    '#D2AA99',
    '#6DC2CA',
    '#DAD45E',
    '#DEEED6',
  ],

  cold8: [
    '#001F3F',
    '#003F7F',
    '#005FBF',
    '#007FFF',
    '#40A0FF',
    '#80C0FF',
    '#BFDFFF',
    '#E6F2FF',
  ],

  atari2600: [
    '#000000',
    '#444444',
    '#888888',
    '#CCCCCC',
    '#FFFFFF',
    '#A00000',
    '#00A000',
    '#0000A0',
  ],

  msx: [
    '#000000',
    '#3EB849',
    '#74D07D',
    '#5955E0',
    '#8076F1',
    '#B95E51',
    '#65DBEF',
    '#DB6559',
    '#FF897D',
    '#CCC35E',
    '#DED087',
    '#3AA241',
    '#B766B5',
    '#CCCCCC',
    '#FFFFFF',
    '#000000',
  ],

  amigaocs: [
    '#000000',
    '#FFFFFF',
    '#880000',
    '#AAFFEE',
    '#CC44CC',
    '#00CC55',
    '#0000AA',
    '#EEEE77',
    '#DD8855',
    '#664400',
    '#FF7777',
    '#333333',
    '#777777',
    '#AAFF66',
    '#0088FF',
    '#BBBBBB',
  ],

  ibmcga4: ['#000000', '#00AAAA', '#AA00AA', '#FFFFFF'],

  laserpop8: [
    '#FF0054',
    '#FF5400',
    '#FFBD00',
    '#00F5D4',
    '#00BBF9',
    '#4361EE',
    '#9B5DE5',
    '#F15BB5',
  ],

  acidburst8: [
    '#D000FF',
    '#FF2A6D',
    '#FF8500',
    '#FFD60A',
    '#70E000',
    '#00F5A0',
    '#00BBF9',
    '#3A86FF',
  ],

  jewel12: [
    '#2E1065',
    '#5B21B6',
    '#7C3AED',
    '#C026D3',
    '#DB2777',
    '#E11D48',
    '#F97316',
    '#FACC15',
    '#65A30D',
    '#0F766E',
    '#0284C7',
    '#E5E7EB',
  ],

  festival12: [
    '#FF003C',
    '#FF5E00',
    '#FFBE0B',
    '#FBFF12',
    '#8AC926',
    '#00F5D4',
    '#00BBF9',
    '#3A86FF',
    '#8338EC',
    '#FF006E',
    '#FF87AB',
    '#FFFFFF',
  ],

  toxic8: [
    '#0B0F0C',
    '#1AFF00',
    '#AFFF00',
    '#E7FF00',
    '#00FF85',
    '#00F0FF',
    '#39FF14',
    '#B7FF00',
  ],

  magma8: [
    '#240046',
    '#5A189A',
    '#9D4EDD',
    '#F72585',
    '#FF4D00',
    '#FF8500',
    '#FFB703',
    '#FFE8A3',
  ],

  candyglow8: [
    '#FF4FA3',
    '#FF85C1',
    '#FFB703',
    '#FFD166',
    '#7BFFB7',
    '#4DFFEA',
    '#6ECBFF',
    '#B388FF',
  ],

  aurora10: [
    '#051923',
    '#003554',
    '#006494',
    '#00A6FB',
    '#00F5D4',
    '#70E000',
    '#C0FF00',
    '#F9C74F',
    '#F72585',
    '#B5179E',
  ],

  comicpop8: [
    '#000000',
    '#FF1744',
    '#2979FF',
    '#00E676',
    '#FFEA00',
    '#FF9100',
    '#D500F9',
    '#FFFFFF',
  ],

  paradise12: [
    '#FF006E',
    '#FF4D6D',
    '#FF7B00',
    '#FFBE0B',
    '#E9FF70',
    '#70E000',
    '#00F5D4',
    '#00BBF9',
    '#3A86FF',
    '#8338EC',
    '#C77DFF',
    '#FFF1FF',
  ],
};

/* ===============================================================
   K-Means Auto Palette
=============================================================== */
export function kmeansFromImageData(
  imgData: ImageData,
  k: number,
  maxIter = 8,
  sampleStep = 4
): string[] {
  const { data, width, height } = imgData;
  const samples: [number, number, number][] = [];

  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 128) continue;
      samples.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  if (samples.length === 0) {
    return ['#000000', '#FFFFFF'];
  }

  const actualK = Math.min(k, samples.length);
  const centers: [number, number, number][] = [];
  const used = new Set<number>();

  while (centers.length < actualK) {
    const idx = Math.floor(Math.random() * samples.length);
    if (used.has(idx)) continue;
    used.add(idx);
    centers.push([...samples[idx]]);
  }

  const assign = new Array(samples.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // assign
    for (let i = 0; i < samples.length; i++) {
      const [sr, sg, sb] = samples[i];
      let best = 0;
      let min = Infinity;

      for (let c = 0; c < centers.length; c++) {
        const [cr, cg, cb] = centers[c];
        const d = (sr - cr) ** 2 + (sg - cg) ** 2 + (sb - cb) ** 2;
        if (d < min) {
          min = d;
          best = c;
        }
      }
      assign[i] = best;
    }

    // update
    const sumR = new Array(centers.length).fill(0);
    const sumG = new Array(centers.length).fill(0);
    const sumB = new Array(centers.length).fill(0);
    const count = new Array(centers.length).fill(0);

    for (let i = 0; i < samples.length; i++) {
      const c = assign[i];
      sumR[c] += samples[i][0];
      sumG[c] += samples[i][1];
      sumB[c] += samples[i][2];
      count[c]++;
    }

    for (let c = 0; c < centers.length; c++) {
      if (!count[c]) continue;
      centers[c] = [sumR[c] / count[c], sumG[c] / count[c], sumB[c] / count[c]];
    }
  }

  const result = centers.map(([r, g, b]) => rgbToHex(r, g, b));
  return Array.from(new Set(result));
}
