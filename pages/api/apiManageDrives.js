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

      const tripIds = trips.map((trip) => trip.tripId);

      const rideRequests = await prisma.ride_requests.findMany({
        where: {
          tripId: {
            in: tripIds,
          },
        },
        include: {
          users: true, // Include user information
          trips: true,  // Include trip information
        },
      });

      return res.status(200).json({ trips,rideRequests });
    } catch (error) {
      console.error('Error fetching trips:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === 'DELETE') {
    const { tripId, requestId } = req.query;

    if (!tripId && !requestId) {
      return res.status(400).json({ message: 'Bad Request - Missing tripId or requestId' });
    }

    try {
      if (tripId) {
        // Handle trip deletion
        await prisma.trips.delete({
          where: {
            tripId: parseInt(tripId, 10),
          },
        });
      } else if (requestId) {
        // Handle ride request deletion
        await prisma.ride_requests.delete({
          where: {
            requestId: parseInt(requestId, 10),
          },
        });
      }

      return res.status(204).end(); // No content (successful deletion)
    } catch (error) {
      console.error('Error deleting item:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
