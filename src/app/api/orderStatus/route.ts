import { ORDER_STATUSES } from '@/lib/birfatura'

export async function POST() { return Response.json({ OrderStatus: ORDER_STATUSES }); }
