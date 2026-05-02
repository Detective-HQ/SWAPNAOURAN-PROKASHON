import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { serverApi } from '@/lib/api-server';

export async function POST(request: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    const createdOrderResponse = await serverApi('/orders', {
      method: 'POST',
      data: {
        items: orderItems,
        shippingAddress: shippingAddress || {},
      },
    });

    const order = createdOrderResponse?.data;
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
