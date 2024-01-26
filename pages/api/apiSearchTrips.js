// apiSearchTrips.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { searchTermPickup, searchTermDropoff } = req.query;
  console.log("searchTermPickup:", searchTermPickup);
  console.log("searchTermDropoff:", searchTermDropoff);

  try {
    const targetTrips = await prisma.trips.findMany({
      where: {
        AND: [
          { departureLocation: { contains: searchTermPickup } },
          { destinationLocation: { contains: searchTermDropoff } },
        ],
      },
    });

    if (targetTrips.length === 0) {
      return res.status(404).json({ message: 'No matching trips found' });
    }

    console.log("searched trips", targetTrips);
    return res.status(200).json(targetTrips);
  } catch (error) {
    console.error('Error searching trips:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
