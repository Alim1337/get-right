// pages/api/manageTrips.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
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
  } else if (req.method === 'DELETE') {
    // Retrieve tripId from query parameters
    const tripId = parseInt(req.query.tripId, 10);

    if (isNaN(tripId)) {
      return res.status(400).json({ message: 'Bad Request - Missing or invalid tripId' });
    }

    try {
      await prisma.trips.delete({
        where: {
          tripId: tripId,
        },
      });

      return res.status(204).end(); // No content (successful deletion)
    } catch (error) {
      console.error('Error deleting trip:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
