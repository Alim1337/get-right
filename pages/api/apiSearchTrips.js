// apiSearchTrips.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { searchTerm } = req.query;
 console.log('searchTerm',searchTerm);
  try {
    const trips = await prisma.trips.findMany({
      where: {
        OR: [
          { departureLocation: { contains: searchTerm } },
          { destinationLocation: { contains: searchTerm } },
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
