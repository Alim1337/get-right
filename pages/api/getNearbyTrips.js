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
    const formattedTrips = nearbyTrips.map((trip) => ({
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
    }));

 //   console.log('nearbyTrips', { nearbyTrips });
    return res.status(200).json({ formattedTrips });
  } catch (error) {
    console.error('Error fetching nearby trips:', error);
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
