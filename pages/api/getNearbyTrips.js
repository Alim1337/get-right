// api/getNearbyTrips.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { latitude, longitude, range } = req.query;
  console.log('latitude, longitude, range ', latitude, longitude, range);

  try {
    const nearbyTrips = await prisma.trips.findMany({
      where: {
        departureLatitude: {
          gte: parseFloat(latitude) - parseFloat(range),
          lte: parseFloat(latitude) + parseFloat(range),
        },
        departureLongitude: {
          gte: parseFloat(longitude) - parseFloat(range),
          lte: parseFloat(longitude) + parseFloat(range),
        },
        departureTime: {
          gte: new Date(),
        },
      },
    });

    return res.status(200).json({ nearbyTrips });
  } catch (error) {
    console.error('Error fetching nearby trips:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
