// apiSearchTrips.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { searchTerm } = req.query;

  try {
    const targetTrip = await prisma.trips.findFirst({
      where: {
        OR: [
          { destinationLocation: { contains: searchTerm } },
          // You may need to adjust the following condition based on your data structure
          {
            destinationLocation: { contains: searchTerm },
          },
        ],
      },
    });

    if (!targetTrip) {
      return res.status(404).json({ message: 'No matching trips found' });
    }

    const { destinationLatitude, destinationLongitude } = targetTrip;

    // Now, you can find trips with the same destination or nearby locations
    const trips = await prisma.trips.findMany({
      where: {
        OR: [
          { destinationLocation: targetTrip.destinationLocation },
          // You may need to adjust the following condition based on your data structure
          {
            destinationLatitude: {
              gte: destinationLatitude - 0.045,
              lte: destinationLatitude + 0.045,
            },
            destinationLongitude: {
              gte: destinationLongitude - 0.045,
              lte: destinationLongitude + 0.045,
            },
          },
        ],
      },
    });

    return res.status(200).json(trips);
  } catch (error) {
    console.error('Error searching trips:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
