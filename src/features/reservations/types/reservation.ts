export type ReservationItem = {
  productId: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  quantity: number;
};

export type ReservationContextValue = {
  items: ReservationItem[];
  idempotencyKey: string;
  itemCount: number;
  total: number;
  addProduct: (item: Omit<ReservationItem, "quantity">) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeProduct: (productId: string) => void;
  clearReservation: () => void;
};

export type ReservationStorageState = {
  idempotencyKey: string | null;
  items: ReservationItem[];
};
