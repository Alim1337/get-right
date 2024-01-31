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
        include: {
          trips: {
            select: {
              destinationLocation: true,
              departureLocation: true,
              driverId: true,
              users: {
                select: {
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                },
              },
            },
          },
        },
      });

      const reservationsWithDestinations = reservations.map((reservation) => {
        return {
          reservationId: reservation.reservationId,
          tripId: reservation.tripId,
          passengerId: reservation.passengerId,
          reservationTime: reservation.reservationTime,
          driver: {
            firstName: reservation.trips?.users?.firstName,
            lastName: reservation.trips?.users?.lastName,
            phoneNumber: reservation.trips?.users?.phoneNumber,
          },
          destinationLocation: reservation.trips?.destinationLocation,
          departureLocation: reservation.trips?.departureLocation,
        };
      });

      const numberOfReservations = reservations.length;

      return res.status(200).json({
        hasReservations: reservations.length > 0,
        numberOfReservations: numberOfReservations,
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
