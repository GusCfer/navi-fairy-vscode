// Sprites da fada em pixel art. Compartilhado entre o webview e o script de preview.
(function (root) {
  // Corpo 7x7 — W = núcleo branco, C = anel claro, B = borda colorida
  const BODY = [
    '..BCB..',
    '.BCWCB.',
    'BCWWWCB',
    'CWWWWWC',
    'BCWWWCB',
    '.BCWCB.',
    '..BCB..',
  ];

  // Asa superior esquerda: frames de batida (L = contorno, l = preenchimento)
  // dx/dy = canto superior esquerdo relativo ao canto do corpo
  const UPPER = [
    { dx: -6, dy: -3, rows: [
      'LL....',
      'LlL...',
      'LllL..',
      '.LllL.',
      '..LllL',
      '...LLL',
    ] },
    { dx: -7, dy: 0, rows: [
      'LLL....',
      'LlllLL.',
      '.LLlllL',
      '...LLLL',
    ] },
    { dx: -6, dy: 2, rows: [
      '...LLL',
      '.LLllL',
      'LlllL.',
      'LLLL..',
    ] },
  ];

  // Asa inferior esquerda (menor)
  const LOWER = [
    { dx: -4, dy: 3, rows: [
      'LLL.',
      'LllL',
      '.LLL',
    ] },
    { dx: -4, dy: 4, rows: [
      '.LLL',
      'LllL',
      'LLL.',
    ] },
  ];

  // "z" para quando ela dorme
  const ZZZ = ['ZZZ', '..Z', '.Z.', 'Z..', 'ZZZ'];

  // Paletas: núcleo, anel, borda, brilho (rgb), contorno da asa, preenchimento da asa
  const PALETTES = {
    azul:    { W: '#ffffff', C: '#c6f3ff', B: '#55c8ff', glow: [85, 200, 255] },
    verde:   { W: '#ffffff', C: '#d4ffd0', B: '#5fe36a', glow: [95, 227, 106] },
    rosa:    { W: '#ffffff', C: '#ffd6f2', B: '#ff6fc8', glow: [255, 111, 200] },
    amarela: { W: '#ffffff', C: '#fff6c4', B: '#ffd23f', glow: [255, 210, 63] },
    roxa:    { W: '#ffffff', C: '#e6d6ff', B: '#a77bff', glow: [167, 123, 255] },
    erro:    { W: '#fff0f0', C: '#ff9c9c', B: '#ff2b2b', glow: [255, 43, 43] },
    alerta:  { W: '#ffffff', C: '#ffe0c2', B: '#ff7a3d', glow: [255, 122, 61] },
  };

  root.FAIRY = { BODY, UPPER, LOWER, ZZZ, PALETTES, BODY_SIZE: 7 };
})(typeof window !== 'undefined' ? window : globalThis);
