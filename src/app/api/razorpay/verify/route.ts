import crypto from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrder } from "@/lib/orders";
import { parseCustomer } from "@/lib/validators";
import type { CartLineInput } from "@/lib/types";

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ error: "Razorpay is not configured." }, { status: 400 });

  const body = await request.json();
  const orderId = String(body.razorpay_order_id || "");
  const paymentId = String(body.razorpay_payment_id || "");
  const signature = String(body.razorpay_signature || "");
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  if (!orderId || !paymentId || expected !== signature) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  const parsed = parseCustomer(body.customer);
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const session = await auth();
    const placed = await createOrder({
      lines: body.lines as CartLineInput[],
      customer: parsed.data,
      userId: session?.user?.id,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
    });
    return NextResponse.json(placed);
  } catch (error) {
    return NextResponse.json(
      {
        error: `${error instanceof Error ? error.message : "Could not save the order."} Payment id: ${paymentId}. Contact the store with that id.`,
      },
      { status: 500 },
    );
  }
}
