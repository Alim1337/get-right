import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { departure, destination, date, time, seatsAvailable, driverId } = req.body;
  const seats = parseInt(seatsAvailable, 10);
  const driver = parseInt(driverId, 10);

  const combinedDateTimeString = `${date}T${time}:00.000Z`;
  const departureTime = new Date(combinedDateTimeString);

  try {
    const createdRide = await prisma.trips.create({
      data: {
        departureLocation: departure,
        destinationLocation: destination,
        departureTime: departureTime,
        availableSeats: seats,
        driverId: driver,
      },
    });

    console.log('Ride created successfully:', createdRide);

    return res.status(200).json({ message: 'Ride created successfully' });
  } catch (error) {
    console.error('Error creating ride:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
