import { createContext, useContext, useRef, useState, type ReactNode } from 'react';

export const garmentCategories = [
  { key: 'tops', label: 'Tops' },
  { key: 'bottoms', label: 'Bottoms' },
  { key: 'footwear', label: 'Footwear' },
  { key: 'outerwear', label: 'Outerwear' },
  { key: 'accessories', label: 'Accessories' },
] as const;

export type GarmentCategory = (typeof garmentCategories)[number]['key'];
export type GarmentStatus = 'available' | 'laundry' | 'dirty';
export type Garment = {
  id: string;
  brand: string;
  name: string;
  category: GarmentCategory;
  status: GarmentStatus;
  wears: number;
  meta: string;
  note?: string;
  noteTone?: 'neutral' | 'positive';
  imageUri: string;
};

type WardrobeValue = {
  garments: Garment[];
  addGarment: (item: Omit<Garment, 'id' | 'status' | 'wears'>) => void;
};

const WardrobeContext = createContext<WardrobeValue | null>(null);

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [garments, setGarments] = useState<Garment[]>([]);
  const nextId = useRef(0);
  const addGarment: WardrobeValue['addGarment'] = (item) => {
    const garment: Garment = { ...item, id: `garment-${++nextId.current}`, status: 'available', wears: 0 };
    setGarments((previous) => [garment, ...previous]);
  };

  return <WardrobeContext.Provider value={{ garments, addGarment }}>{children}</WardrobeContext.Provider>;
}

export function useWardrobe() {
  const wardrobe = useContext(WardrobeContext);
  if (!wardrobe) throw new Error('useWardrobe must be used within WardrobeProvider');
  return wardrobe;
}
