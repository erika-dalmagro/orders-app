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

export type Table = {
  id: number;
  name: string;
  capacity: number;
};

export type Order = {
  id: number;
  table_id: number;
  table?: Table;
  status: string;
  items: OrderItem[];
};
