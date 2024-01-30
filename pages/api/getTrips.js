// pages/api/getTrips.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const trips = await prisma.trips.findMany({
        include: {
          reservations: true,
        },
      }); 
      const tripsWithoutReservations = trips.filter((trip) => trip.reservations.length === 0);
    //  console.log(trips);// Assuming you have a model named 'trip'
      res.status(200).json(tripsWithoutReservations);
    } catch (error) {
      console.error("Error fetching trips:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
