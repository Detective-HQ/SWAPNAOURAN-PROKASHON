import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function POST(request: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const { items, shippingAddress } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Transform cart items to order items format
    const orderItems = items.map((item: any) => ({
      bookId: item.id.toString(),
      quantity: item.qty,
      unitPrice: item.price,
      totalPrice: item.price * item.qty,
    }));

    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);

    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({
        items: orderItems,
        shippingAddress: shippingAddress || {},
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Failed to create order' },
        { status: response.status }
      );
    }

    const order = await response.json();
    return NextResponse.json({ 
      order,
      totalAmount 
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
