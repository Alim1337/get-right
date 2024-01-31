// api/getNearbyTrips.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { latitude, longitude, range } = req.query;
  console.log('latitude, longitude, range ', latitude, longitude, range);

  // Convert range from kilometers to degrees
  const rangeInDegrees = range/ 111.32; // 1 degree is approximately 111.32 kilometers
  console.log('rangeInDegrees  ',rangeInDegrees );

  try {
    const nearbyTrips = await prisma.trips.findMany({
      where: {
        departureLatitude: {
          gte: parseFloat(latitude) - rangeInDegrees,
          lte: parseFloat(latitude) + rangeInDegrees,
        },
        departureLongitude: {
          gte: parseFloat(longitude) - rangeInDegrees,
          lte: parseFloat(longitude) + rangeInDegrees,
        },
      
      },
    });
 //   console.log('nearbyTrips', { nearbyTrips });
    return res.status(200).json({ nearbyTrips });
  } catch (error) {
    console.error('Error fetching nearby trips:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
