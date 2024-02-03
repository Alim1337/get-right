// api/searchTrips.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let { searchTermPickup, searchTermDropoff } = req.query;
  console.log("searchTermPickup (before):", searchTermPickup);
  console.log("searchTermDropoff (before):", searchTermDropoff);

  // Remove parentheses from search terms
  searchTermPickup = searchTermPickup.replace(/[\(\)]/g, '');
  searchTermDropoff = searchTermDropoff.replace(/[\(\)]/g, '');

  console.log("searchTermPickup (after):", searchTermPickup);
  console.log("searchTermDropoff (after):", searchTermDropoff);

  try {
    const targetTrips = await prisma.trips.findMany({
      where: {
        OR: [
          {
            departureLocation: {
              contains: searchTermPickup.toLowerCase(),
            },
          },
          {
            destinationLocation: {
              contains: searchTermDropoff.toLowerCase(),
            },
          },
        ],
      },
      include: {
        users: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (targetTrips.length === 0) {
      return res.status(404).json({ message: 'No matching trips found' });
    }
    console.log("searched trips", targetTrips);

    const formattedTrips = targetTrips.map((trip) => ({
      tripId: trip.tripId,
      departureLocation: trip.departureLocation,
      destinationLocation: trip.destinationLocation,
      departureTime: trip.departureTime,
      availableSeats: trip.availableSeats,
      driverName: `${trip.users.firstName} ${trip.users.lastName}`,
      // Calculate and include distance here
      distance: calculateDistance(
        trip.departureLatitude,
        trip.departureLongitude,
        trip.destinationLatitude,
        trip.destinationLongitude
      ),
      firstName:  trip.users.firstName,
      lastName :  trip.users.lastName,
    }));

    // Sort trips by distance in ascending order
    formattedTrips.sort((a, b) => a.distance - b.distance);

    return res.status(200).json({ formattedTrips });
  } catch (error) {
    console.error('Error searching trips:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
