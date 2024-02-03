// pages/api/admin_functions.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const users = await prisma.users.findMany();
      const rides = await prisma.trips.findMany();

      return res.status(200).json({ users, rides });
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'POST') {
    // Handle adding users or rides based on the request
    if (req.body.type === 'user') {
      const { firstName, lastName, email, password, role, phoneNumber, studentId } = req.body;

      try {
        const newUser = await prisma.users.create({
          data: {
            firstName,
            lastName,
            email,
            password,
            role,
            phoneNumber,
            studentId,
          },
        });

        return res.status(200).json({ message: 'User added successfully', user: newUser });
      } catch (error) {
        console.error('Error adding user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    } else if (req.body.type === 'ride') {
      // Handle adding a new ride
      const { departureLocation, destinationLocation, departureTime, availableSeats, driverId } = req.body;

      try {
        const newRide = await prisma.rides.create({
          data: {
            departureLocation,
            destinationLocation,
            departureTime,
            availableSeats,
            driverId,
          },
        });

        return res.status(200).json({ message: 'Ride added successfully', ride: newRide });
      } catch (error) {
        console.error('Error adding ride:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  } else if (req.method === 'DELETE') {
    // Handle deleting users or rides based on the request
    const { type, id } = req.body;

    if (type === 'user') {
      try {
        const deletedUser = await prisma.users.delete({
          where: {
            userId: id,
          },
        });

        return res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
      } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    } else if (type === 'ride') {
      // Handle deleting a ride
      try {
        const deletedRide = await prisma.rides.delete({
          where: {
            tripId: id,
          },
        });

        return res.status(200).json({ message: 'Ride deleted successfully', ride: deletedRide });
      } catch (error) {
        console.error('Error deleting ride:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  } else if (req.method === 'PUT') {
    // Handle modifying users or rides based on the request
    const { type, ...rest } = req.body;
    console.log(' type, id, ...rest ',{ type,...rest });

    if (type === 'user') {
      try {
        const modifiedUser = await prisma.users.update({
          where: {
            userId: rest.userId,
          },
          data: {
            ...rest,
          },
        });
        return res.status(200).json({ message: 'User modified successfully', user: modifiedUser });
      } catch (error) {
        console.error('Error modifying user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    } else if (type === 'ride') {
      // Handle modifying a ride
      try {
        const modifiedRide = await prisma.rides.update({
          where: {
            tripId: id,
          },
          data: {
            ...rest,
          },
        });
        

        return res.status(200).json({ message: 'Ride modified successfully', ride: modifiedRide });
      } catch (error) {
        console.error('Error modifying ride:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    } else if (type === 'config') {
      try {
        const updatedConfig = await prisma.appconfig.update({
          where: {
            configId: 1, // Assuming the configuration ID is always 1
          },
          data: {
            /* Update the configuration fields based on the payload received */
            maxSeatsPerTrip: req.body.maxSeats,
            // Add other fields as needed
          },
        });
      
        return res.status(200).json({ message: 'Configuration updated successfully', config: updatedConfig });
      } catch (error) {
        console.error('Error updating configuration:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
