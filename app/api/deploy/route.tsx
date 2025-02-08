import { NextRequest, NextResponse } from "next/server"
import { deployWallet } from "../(service)/contract.service"

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { account } = await req.json()

  if (!account) {
    return NextResponse.json({ error: "Missing account" }, { status: 400 })
  }

  try {
    await deployWallet(account)
    console.log("Deployed! ")
  } catch (error) {
    console.error(`Error deploying wallet for account ${account}. `, error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }

  console.log("Returning response ")

  return NextResponse.json({
    success: true,
  })
}
