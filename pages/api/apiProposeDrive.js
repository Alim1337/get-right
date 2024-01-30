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
    userId,
    departureLatitude,
    departureLongitude,
    destinationLatitude,
    destinationLongitude,
  } = req.body;

  const seats = parseInt(seatsAvailable, 10);
  const user = parseInt(userId, 10);

  const combinedDateTimeString = `${date}T${time}:00.000Z`;
  const departureTime = new Date(combinedDateTimeString);


  try {
    const proposeDrive = await prisma.proposition.create({
      data: {
        departureLocation: departure,
        destinationLocation: destination,
        departureTime: departureTime,
        availableSeats: seats,
        userId: user,
        departureLatitude: departureLatitude,
        departureLongitude: departureLongitude,
        destinationLatitude: destinationLatitude,
        destinationLongitude: destinationLongitude,
      },
    });

    console.log('Ride created successfully:', proposeDrive);

    // await prisma.users.update({
    //   where: { userId: driver },
    //   data: { role: 'driver' },
    // });

    return res.status(200).json({ message: 'Drive proposition created successfully' });
  } catch (error) {
    console.error('Error creating proposition:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
