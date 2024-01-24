import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, tripId, nbr_seat_req /* other fields */ } = req.body;
    console.log('userid ,tripid , nbr_seat_req', userId, tripId, nbr_seat_req);

    try {
      const rideRequest = await prisma.ride_requests.create({
        data: {
          userId: userId,
          tripId: tripId,
          nbr_seat_req: nbr_seat_req,
          status: 'pending',
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
