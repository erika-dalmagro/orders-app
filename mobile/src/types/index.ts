export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  created_at?: string;
  updated_at?: string;
};

export type OrderItem = {
  id?: number;
  product_id: number;
  quantity: number;
  product?: Product;
  created_at?: string;
  updated_at?: string;
};

export type Table = {
  id: number;
  name: string;
  capacity: number;
  single_tab: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Order = {
  id: number;
  table_id: number;
  table?: Table;
  status: string;
  items: OrderItem[];
  date: string;
  kitchen_status?: string;
  created_at?: string;
  updated_at?: string;
};
