import { PrismaClient } from '@prisma/client'
import { fetchRankedListings } from '../src/lib/listings-utils'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Starting Search Logic Verification...')
  
  try {
    // Case 1: Toronto + Luxury
    console.log('\nCase 1: Toronto + "Luxury" search')
    const result1 = await fetchRankedListings(prisma, { 
      city: 'Toronto', 
      q: 'Luxury',
      useRanking: true 
    }, 10, 0)
    
    const nonTorontoCount1 = result1.listings.filter((l: any) => l.city.toLowerCase() !== 'toronto').length
    if (nonTorontoCount1 === 0 && result1.listings.length > 0) {
      console.log(`✅ Success: All ${result1.listings.length} results are in Toronto.`)
    } else {
      console.log(`❌ Failure: ${nonTorontoCount1} results were NOT in Toronto!`)
    }

    // Case 2: Toronto + Geo Bounds (The critical case)
    console.log('\nCase 2: Toronto + Geo Bounds (Pickering area)')
    // Lat/Lng that might include Pickering but we want ONLY Toronto
    const result2 = await fetchRankedListings(prisma, { 
      city: 'Toronto',
      latMin: 43.6,
      latMax: 44.0,
      lngMin: -79.5,
      lngMax: -78.9, // This box typically includes parts of Pickering
      useRanking: false 
    }, 10, 0)

    const nonTorontoCount2 = result2.listings.filter((l: any) => l.city.toLowerCase() !== 'toronto').length
    if (nonTorontoCount2 === 0 && result2.listings.length > 0) {
      console.log(`✅ Success: All ${result2.listings.length} results are in Toronto, despite broad geo-bounds.`)
    } else if (result2.listings.length === 0) {
      console.log('⚠️ No results found for this intersection.')
    } else {
      console.log(`❌ Failure: Found ${nonTorontoCount2} non-Toronto results!`)
      console.log('Sample non-Toronto cities:', result2.listings.map((l: any) => l.city).join(', '))
    }

    console.log('\n✨ Verification Complete.')
  } catch (error) {
    console.error('❌ Verification Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
