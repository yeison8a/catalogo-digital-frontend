
export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  category: Category;
  mainImageUrl: string | null;
}
