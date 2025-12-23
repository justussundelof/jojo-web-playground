import { Order } from '@/types/order'

export const dummyOrders: Order[] = [
    {
        id: '1',
        orderNumber: 'JOJO-2024-001',
        date: '2024-12-15',
        status: 'delivered',
        items: [
            {
                productId: 1,
                name: 'Vintage Dior Jacket',
                price: 599,
                quantity: 1,
                image: '/placeholder-product.jpg'
            }
        ],
        subtotal: 599,
        shipping: 49,
        tax: 162,
        total: 810
    },
    {
        id: '2',
        orderNumber: 'JOJO-2024-002',
        date: '2024-12-18',
        status: 'processing',
        items: [
            {
                productId: 2,
                name: 'YSL Vintage Blouse',
                price: 350,
                quantity: 1,
                image: '/placeholder-product.jpg'
            },
            {
                productId: 3,
                name: 'Chanel Silk Scarf',
                price: 250,
                quantity: 2,
                image: '/placeholder-product.jpg'
            }
        ],
        subtotal: 850,
        shipping: 49,
        tax: 225,
        total: 1124
    },
    {
        id: '3',
        orderNumber: 'JOJO-2024-003',
        date: '2024-12-10',
        status: 'shipped',
        items: [
            {
                productId: 4,
                name: 'Hermès Vintage Belt',
                price: 450,
                quantity: 1,
                image: '/placeholder-product.jpg'
            }
        ],
        subtotal: 450,
        shipping: 0,
        tax: 113,
        total: 563
    }
]