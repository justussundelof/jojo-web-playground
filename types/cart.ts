
export interface CartItem {
    id: string;
    productId: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    maxQuantity?: number; // for stock limits
}

export interface CartState {
    items: CartItem[];
    lastUpdated: Date;
}