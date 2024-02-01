import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
        departureLocation: { contains: searchTermPickup },
        destinationLocation: { contains: searchTermDropoff },
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

    // console.log("searched trips", targetTrips);
    return res.status(200).json(formattedTrips);
  } catch (error) {
    console.error('Error searching trips:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return distance;
};

const deg2rad = (deg) => deg * (Math.PI / 180);
