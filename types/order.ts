export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
    productId: number
    name: string
    price: number
    quantity: number
    image: string
}

export interface Order {
    id: string
    orderNumber: string
    date: string
    status: OrderStatus
    items: OrderItem[]
    subtotal: number
    shipping: number
    tax: number
    total: number
}