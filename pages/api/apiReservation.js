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
              departureLatitude: true,
              departureLongitude: true,
              destinationLatitude: true,
              destinationLongitude: true,
              departureTime: true,
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
          departureLatitude: reservation.trips?.departureLatitude,
          departureLongitude: reservation.trips?.departureLongitude,
          destinationLatitude: reservation.trips?.destinationLatitude,
          destinationLongitude: reservation.trips?.destinationLongitude,
          departureTime: reservation.trips?.departureTime,
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
  } else if (req.method === 'DELETE') {
    // Handle reservation deletion based on reservationId
    try {
      const { reservationId } = req.body;


      if (!reservationId) {
        return res.status(400).json({ message: 'Bad Request' });
      }

      // Check if the reservation exists
      const existingReservation = await prisma.reservations.findUnique({
        where: {
          reservationId: parseInt(reservationId, 10),
        },
      });

      if (!existingReservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

        // If more than 12 hours have passed, delete the reservation
        await prisma.reservations.delete({
          where: {
            reservationId: parseInt(reservationId, 10),
          },
        });

        return res.status(200).json({ message: 'Reservation deleted successfully' });
    } catch (error) {
      console.error('Error deleting reservation:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}