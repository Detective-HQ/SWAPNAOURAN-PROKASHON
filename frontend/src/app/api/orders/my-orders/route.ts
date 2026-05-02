import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { serverApi } from '@/lib/api-server';

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ordersResponse = await serverApi('/orders/my', { method: 'GET' });
    return NextResponse.json({ orders: ordersResponse?.data || [] });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
