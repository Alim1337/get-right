// pages/api/getTrips.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const proposition = await prisma.proposition.findMany();
            res.status(200).json(proposition);
        } catch (error) {
            console.error("Error fetching trips:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    } else if (req.method === 'POST') {
        const { propositionId, driverId, action } = req.body;
        try {
            await prisma.$transaction(async (tx) => {
                if (action === 'accept') {
                    const proposition = await tx.proposition.findUnique({
                        where: {
                            propositionId: parseInt(propositionId, 10),
                        },
                    });

                    if (!proposition) {
                        return res.status(404).json({ message: 'proposition not found' });
                    }

                    const createdTrip = await tx.trips.create({
                        data: {
                            departureLocation: proposition.departureLocation,
                            destinationLocation: proposition.destinationLocation,
                            departureTime: proposition.departureTime,
                            availableSeats: proposition.availableSeats,
                            driverId: driverId,
                            departureLatitude: proposition.departureLatitude,
                            departureLongitude: proposition.departureLongitude,
                            destinationLatitude: proposition.destinationLatitude,
                            destinationLongitude: proposition.destinationLongitude,
                        },
                    });

                    // Create a new reservation
                    await tx.reservations.create({
                        data: {
                            tripId: createdTrip.tripId,
                            passengerId: proposition.userId,
                            driverId: driverId,
                            reservationTime: new Date(),
                        },
                    });

                    // Delete the previously created proposition
                    await tx.proposition.delete({
                        where: {
                            propositionId: parseInt(propositionId, 10),
                        },
                    });
                }
            });

            return res.status(200).json({ message: 'Action successful' });
        } catch (error) {
            console.error('Error updating ride request:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}