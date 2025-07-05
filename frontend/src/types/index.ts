export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

export type OrderItem = {
  id?: number;
  product_id: number;
  quantity: number;
  product?: Product;
};

export type Order = {
  id: number;
  table_number: number;
  status: string;
  items: OrderItem[];
};
