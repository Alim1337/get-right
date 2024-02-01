import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    departure,
    destination,
    date,
    time,
    seatsAvailable,
    driverId,
    departureLatitude,
    departureLongitude,
    destinationLatitude,
    destinationLongitude,
  } = req.body;

  const seats = parseInt(seatsAvailable, 10);
  const driver = parseInt(driverId, 10);

  const combinedDateTimeString = `${date}T${time}:00.000Z`;
  const departureTime = new Date(combinedDateTimeString);

  try {
    await prisma.$transaction(async (tx) => {
      // Create the trip within the transaction
      const createdRide = await tx.trips.create({
        data: {
          departureLocation: departure,
          destinationLocation: destination,
          departureTime: departureTime,
          availableSeats: seats,
          driverId: driver,
          departureLatitude: departureLatitude,
          departureLongitude: departureLongitude,
          destinationLatitude: destinationLatitude,
          destinationLongitude: destinationLongitude,
        },
      });

      // Update the user's role within the transaction
      await tx.users.update({
        where: { userId: driver },
        data: { role: 'driver' },
      });

      return createdRide; // Return the created ride
    });

    res.status(200).json({ message: 'Ride created successfully' });
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
