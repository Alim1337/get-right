import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_MAX_SEATS = 4;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const appConfig = await prisma.appconfig.findFirst();

    const maxSeatsPerTrip = appConfig?.maxSeatsPerTrip ?? DEFAULT_MAX_SEATS;

    // If no config exists, create one with the default
    if (!appConfig) {
      await prisma.appconfig.create({
        data: {
          maxSeatsPerTrip: DEFAULT_MAX_SEATS,
          geoConfig: 'default',
        },
      });
    }

    res.status(200).json({ maxSeatsPerTrip });
  } catch (error) {
    console.error('Error fetching max seats:', error);
    // Always return a usable value even on error
    res.status(200).json({ maxSeatsPerTrip: DEFAULT_MAX_SEATS });
  } finally {
    await prisma.$disconnect();
  }
}