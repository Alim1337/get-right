import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEFAULT_MAX_SEATS = 4;

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
    driverId,
    departureLatitude,
    departureLongitude,
    destinationLatitude,
    destinationLongitude,
  } = req.body;

  // Log everything so we can debug
  console.log('=== apiCreateRide received ===');
  console.log({ departure, destination, date, time, seatsAvailable, driverId });

  // Relaxed validation — only truly critical fields
  if (!departure || !destination || !driverId) {
    console.error('Missing critical fields:', { departure: !!departure, destination: !!destination, driverId: !!driverId });
    return res.status(400).json({ 
      message: 'Missing required fields', 
      received: { departure, destination, driverId } 
    });
  }

  // Use fallback date/time if missing
  const useDate = date || new Date().toISOString().split('T')[0];
  const useTime = time || '08:00';

  // Truncate location strings to fit VarChar(500)
  const truncate = (str, max = 490) => str && str.length > max ? str.substring(0, max) : str;
  const safeDeparture = truncate(departure);
  const safeDestination = truncate(destination);

  const seats = parseInt(seatsAvailable, 10) || 1;
  const driver = parseInt(driverId, 10);
  const combinedDateTimeString = `${useDate}T${useTime}:00.000Z`;
  const departureTime = new Date(combinedDateTimeString);

  try {
    let maxSeatsPerTrip = DEFAULT_MAX_SEATS;
    try {
      const appConfig = await prisma.appconfig.findFirst();
      if (appConfig?.maxSeatsPerTrip) maxSeatsPerTrip = appConfig.maxSeatsPerTrip;
      if (!appConfig) {
        await prisma.appconfig.create({
          data: { maxSeatsPerTrip: DEFAULT_MAX_SEATS, geoConfig: 'default' },
        });
      }
    } catch (configErr) {
      console.warn('Could not fetch appconfig, using default:', DEFAULT_MAX_SEATS);
    }

    const finalSeats = Math.min(seats, maxSeatsPerTrip);

    await prisma.$transaction(async (tx) => {
      await tx.trips.create({
        data: {
          departureLocation: safeDeparture,
          destinationLocation: safeDestination,
          departureTime: departureTime,
          availableSeats: finalSeats,
          driverId: driver,
          departureLatitude: departureLatitude || null,
          departureLongitude: departureLongitude || null,
          destinationLatitude: destinationLatitude || null,
          destinationLongitude: destinationLongitude || null,
          maxSeatsPerTrip: maxSeatsPerTrip,
        },
      });

      await tx.users.update({
        where: { userId: driver },
        data: { role: 'driver' },
      });
    });

    console.log('Trip created successfully for driver:', driver);
    res.status(200).json({ message: 'Ride created successfully' });
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}