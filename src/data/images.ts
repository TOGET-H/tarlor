const topA = '/picture/top-a.jpg';
const topB = '/picture/top-b.jpg';
const topC = '/picture/top-c.jpg';
const skirtA = '/picture/skirt-a.jpg';
const skirtB = '/picture/skirt-b.jpg';
const pantsA = '/picture/pants-a.jpg';
const dressA = '/picture/dress-a.jpg';
const dressB = '/picture/dress-b.jpg';
const dressC = '/picture/dress-c.jpg';
const dressD = '/picture/dress-d.jpg';
export const bodyShapeImage = '/picture/body/x-shape.png';
export const faceShapeImage = '/picture/face/round-face.png';

export const lookImages: Record<string, string> = {
  'suit-1': topA,
  'suit-2': topB,
  'suit-3': topC
};

export const resultImages: Record<string, string> = {
  'suit-1': topA,
  'suit-2': topB,
  'suit-3': topC
};

export const productImagePools = {
  inner: [topA, topB, topC],
  outerwear: [topA, topB, topC],
  dress: [dressA, dressB, dressC, dressD],
  bottom: [skirtA, skirtB, pantsA],
  shoes: [],
  bag: [],
  accessory: []
};

export const mobileResultItems = [
  { id: 'image-1', type: 'image' as const, src: topA },
  { id: 'image-2', type: 'image' as const, src: topB },
  { id: 'video-1', type: 'video' as const, src: topC },
  { id: 'image-3', type: 'image' as const, src: dressA },
  { id: 'loading-1', type: 'loading' as const },
  { id: 'image-4', type: 'image' as const, src: dressB }
];
