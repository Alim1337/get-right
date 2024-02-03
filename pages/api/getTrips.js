import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const trips = await prisma.trips.findMany({
        include: {
          reservations: true,
          users: true, // Include the user details for the driver
        },
      });

      // Calculate distance for each trip and filter trips without reservations
      const tripsWithDistance = trips
        .map((trip) => ({
          ...trip,
          distance: calculateDistance(
            trip.departureLatitude,
            trip.departureLongitude,
            trip.destinationLatitude,
            trip.destinationLongitude
          ),
          driver: {
            firstName: trip.users.firstName,
            lastName: trip.users.lastName,
          },
        }))
        .filter((trip) => trip.reservations.length === 0);

      res.status(200).json(tripsWithDistance);
    } catch (error) {
      console.error("Error fetching trips:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
