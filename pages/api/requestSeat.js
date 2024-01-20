// pages/api/requestSeat.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, tripId, /* other fields */ } = req.body;
    console.log('userid ,tripid',userId,tripId);

    try {
      const rideRequest = await prisma.ride_requests.create({
        data: {
          userId :userId,
          tripId :tripId,
          status: 'pending', // Set initial status as pending
          // Include other relevant fields here
        },
      });

      return res.status(201).json({ message: 'Seat requested successfully', rideRequest });
    } catch (error) {
      console.error('Error requesting seat:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
