/**
 * Unit Conversion Test
 * 
 * Verifies that equivalent units produce the same cost contributions.
 * This is run once on page load to ensure calculations are working correctly.
 */

import { convertUnit } from './types'

interface ConversionTestCase {
  qty1: number
  unit1: string
  qty2: number
  unit2: string
  unitCost: number
  expectedCostContribution: number
  label: string
}

const testCases: ConversionTestCase[] = [
  {
    qty1: 350,
    unit1: 'g',
    qty2: 0.350,
    unit2: 'kg',
    unitCost: 100, // $100 per kg
    expectedCostContribution: 35, // 0.350 * 100 = 35
    label: '350g vs 0.350kg (mass conversion)',
  },
  {
    qty1: 900,
    unit1: 'g',
    qty2: 0.900,
    unit2: 'kg',
    unitCost: 50, // $50 per kg
    expectedCostContribution: 45, // 0.900 * 50 = 45
    label: '900g vs 0.900kg (mass conversion)',
  },
  {
    qty1: 3000,
    unit1: 'ml',
    qty2: 3,
    unit2: 'l',
    unitCost: 200, // $200 per liter
    expectedCostContribution: 600, // 3 * 200 = 600
    label: '3000ml vs 3L (volume conversion)',
  },
  {
    qty1: 250,
    unit1: 'ml',
    qty2: 0.250,
    unit2: 'l',
    unitCost: 80, // $80 per liter
    expectedCostContribution: 20, // 0.250 * 80 = 20
    label: '250ml vs 0.250L (volume conversion)',
  },
]

export function runConversionTests(): void {
  let allPassed = true
  
  console.log('[ConversionTest] Running unit conversion verification...')
  
  for (const testCase of testCases) {
    // Convert qty1 to unit2
    const convertedQty = convertUnit(testCase.qty1, testCase.unit1 as any, testCase.unit2 as any)
    
    if (convertedQty === null) {
      console.error(`[ConversionTest] FAILED: ${testCase.label} - Could not convert ${testCase.qty1}${testCase.unit1} to ${testCase.unit2}`)
      allPassed = false
      continue
    }
    
    // Calculate cost using both quantities
    const cost1 = testCase.qty1 * testCase.unitCost
    const cost2 = convertedQty * testCase.unitCost
    const expectedCost1 = testCase.expectedCostContribution
    const expectedCost2 = testCase.expectedCostContribution
    
    // Check if costs are equal (within floating point tolerance)
    const tolerance = 0.01
    const cost1Match = Math.abs(cost1 - expectedCost1) < tolerance
    const cost2Match = Math.abs(cost2 - expectedCost2) < tolerance
    const costsEqual = Math.abs(cost1 - cost2) < tolerance
    
    if (cost1Match && cost2Match && costsEqual) {
      console.log(`[ConversionTest] PASSED: ${testCase.label}`)
      console.log(`  ${testCase.qty1}${testCase.unit1} × $${testCase.unitCost} = $${cost1.toFixed(2)}`)
      console.log(`  ${testCase.qty2}${testCase.unit2} × $${testCase.unitCost} = $${cost2.toFixed(2)}`)
      console.log(`  ✓ Both equal $${testCase.expectedCostContribution}`)
    } else {
      console.error(`[ConversionTest] FAILED: ${testCase.label}`)
      console.error(`  ${testCase.qty1}${testCase.unit1} × $${testCase.unitCost} = $${cost1.toFixed(2)} (expected $${expectedCost1})`)
      console.error(`  ${testCase.qty2}${testCase.unit2} × $${testCase.unitCost} = $${cost2.toFixed(2)} (expected $${expectedCost2})`)
      console.error(`  Converted: ${testCase.qty1}${testCase.unit1} = ${convertedQty}${testCase.unit2}`)
      allPassed = false
    }
  }
  
  if (allPassed) {
    console.log('[ConversionTest] ✓ All unit conversion tests PASSED')
  } else {
    console.error('[ConversionTest] ✗ Some unit conversion tests FAILED')
  }
}
