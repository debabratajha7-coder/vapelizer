import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { priceLines } from "@/lib/orders";
import { parseCustomer } from "@/lib/validators";
import type { CartLineInput } from "@/lib/types";

export async function POST(request: Request) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: "Razorpay is not configured." }, { status: 400 });
  }

  const body = await request.json();
  const parsed = parseCustomer(body.customer);
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const quote = await priceLines(body.lines as CartLineInput[]);
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const order = await razorpay.orders.create({
      amount: Math.round(quote.total * 100),
      currency: "INR",
      receipt: `vp_${Date.now()}`.slice(0, 40),
    });
    return NextResponse.json({
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      razorpayOrderId: order.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not start payment." },
      { status: 400 },
    );
  }
}
