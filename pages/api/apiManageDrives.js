// pages/api/manageTrips.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Retrieve userId from query parameters
  const userId = parseInt(req.query.userId, 10); // Parse the userId as an integer

  if (isNaN(userId)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const trips = await prisma.trips.findMany({
      where: {
        driverId: userId,
      },
    });

    return res.status(200).json({ trips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
