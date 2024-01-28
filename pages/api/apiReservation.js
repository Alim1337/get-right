import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const userId = parseInt(req.query.userId, 10);

    if (isNaN(userId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const reservations = await prisma.reservations.findMany({
        where: {
          passengerId: userId,
        },
      });

      const reservationsWithDestinations = await Promise.all(
        reservations.map(async (reservation) => {
          const trip = await prisma.trips.findUnique({
            where: {
              tripId: reservation.tripId,
            },
            select: {
              destinationLocation: true,
              departureLocation:true,
            },
          });

          return {
            reservationId: reservation.reservationId,
            tripId: reservation.tripId,
            passengerId: reservation.passengerId,
            reservationTime: reservation.reservationTime,
            driverId: reservation.driverId,
            destinationLocation: trip?.destinationLocation,
            departureLocation : trip?.departureLocation,
          };
        })
      );

      console.log('reservations', reservationsWithDestinations);

      return res.status(200).json({
        hasReservations: reservations.length > 0,
        reservations: reservationsWithDestinations,
      });
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
