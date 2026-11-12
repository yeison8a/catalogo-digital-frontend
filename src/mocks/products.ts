
import type { Product } from "@/types/product";

const categories = {
  technology: {
    id: "a0000000-0000-4000-8000-000000000001",
    name: "Tecnología",
  },
  accessories: {
    id: "a0000000-0000-4000-8000-000000000002",
    name: "Accesorios",
  },
  home: {
    id: "a0000000-0000-4000-8000-000000000003",
    name: "Hogar",
  },
};

export const mockProducts: Product[] = [
  {
    id: "b0000000-0000-4000-8000-000000000001",
    name: "Audífonos inalámbricos",
    description: "Audífonos Bluetooth.",
    price: 90000,
    available: true,
    category: categories.technology,
    mainImageUrl: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000002",
    name: "Bolso casual",
    description: "Bolso para uso diario.",
    price: 65000,
    available: true,
    category: categories.accessories,
    mainImageUrl: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000003",
    name: "Lámpara de escritorio",
    description: "Lámpara para escritorio.",
    price: 49000,
    available: false,
    category: categories.home,
    mainImageUrl: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000004",
    name: "Termo de acero",
    description: "Termo reutilizable.",
    price: 39000,
    available: true,
    category: categories.accessories,
    mainImageUrl: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000005",
    name: "Parlante portátil",
    description: "Parlante Bluetooth.",
    price: 110000,
    available: true,
    category: categories.technology,
    mainImageUrl: null,
  },
  {
    id: "b0000000-0000-4000-8000-000000000006",
    name: "Organizador de escritorio",
    description: "Organizador multiusos.",
    price: 25000,
    available: true,
    category: categories.home,
    mainImageUrl: null,
  },
];
