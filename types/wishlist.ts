export interface WishlistItem {
    id: string
    productId: number
    name: string
    price: number
    image: string
    addedAt: Date
}

export interface WishlistState {
    items: WishlistItem[]
    lastUpdated: Date
}