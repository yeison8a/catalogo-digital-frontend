
export interface SelectedProductImage {
  id: string;
  file: File;
  previewUrl: string;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  sortOrder: number;
  mainImage: boolean;
  productId: string;
}