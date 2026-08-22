/**
 * Curated Unsplash photo ids. Kept in one place so the mock data reads cleanly
 * and so swapping in real Supabase Storage URLs later is a one-file change.
 */

const unsplash = (id: string, width = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

export const photo = {
  garageA: unsplash('1506521781263-d8422e82f27a'),
  garageB: unsplash('1573348722427-f1d6819fdf98'),
  garageC: unsplash('1590674899484-d5640e854abe'),
  garageD: unsplash('1613638377394-281765460baa'),
  garageE: unsplash('1604063155785-ee4488b8ad15'),
  garageF: unsplash('1611867967135-0faab97d1530'),
  lotA: unsplash('1470224114660-3f6686c562eb'),
  lotB: unsplash('1545179605-1296651e9d43'),
  lotC: unsplash('1502877338535-766e1452684a'),
  lotD: unsplash('1449965408869-eaa3f722e40d'),
  lotE: unsplash('1600661653561-629509216228'),
  lotF: unsplash('1580273916550-e323be2ae537'),
  streetA: unsplash('1543465077-db45d34b88a5'),
  streetB: unsplash('1517940310602-26535839fe84'),
  streetC: unsplash('1517672651691-24622a91b550'),
  cityA: unsplash('1494976388531-d1058494cdd8'),
  cityB: unsplash('1552519507-da3b142c6e3d'),
  cityC: unsplash('1583121274602-3e2820c69888'),
  cityD: unsplash('1503376780353-7e6692767b70'),
  cityE: unsplash('1493238792000-8113da705763'),
  carA: unsplash('1568605114967-8130f3a36994'),
  carB: unsplash('1560518883-ce09059eeffa'),
  carC: unsplash('1523983388277-336a66bf9bcd'),
  carD: unsplash('1590650153855-d9e808231d41'),
  carE: unsplash('1580654712603-eb43273aff33'),
  carF: unsplash('1607853202273-797f1c22a38e'),
  carG: unsplash('1615874959474-d609969a20ed'),
} as const;
