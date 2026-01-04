
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const body = await req.json();
  const { attemptId } = await params;

  // TODO: evaluation logic is handled elsewhere
  return NextResponse.json({ ok: true });
}
