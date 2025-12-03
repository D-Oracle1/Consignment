import { NextRequest, NextResponse } from 'next/server'
import { pricingCalculatorSchema } from '@/lib/validators'
import { calculateShippingCost, getEstimatedDeliveryDate } from '@/lib/utils/pricing'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = pricingCalculatorSchema.parse(body)

    const cost = await calculateShippingCost({
      weight: validatedData.weight,
      length: validatedData.length,
      width: validatedData.width,
      height: validatedData.height,
      originZip: validatedData.originZip,
      destinationZip: validatedData.destinationZip,
      isExpress: validatedData.isExpress,
      category: validatedData.category,
    })

    const estimatedDelivery = await getEstimatedDeliveryDate(
      validatedData.originZip,
      validatedData.destinationZip,
      validatedData.isExpress
    )

    return NextResponse.json({
      cost,
      estimatedDelivery,
    })
  } catch (error: any) {
    console.error('Pricing calculation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to calculate pricing' },
      { status: 400 }
    )
  }
}
