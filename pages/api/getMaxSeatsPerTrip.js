import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(_, res) {
  if (_.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const appConfig = await prisma.appconfig.findFirst({
      where: { configId: 1 }, // Assuming configId 1 is the desired config entry
      select: { maxSeatsPerTrip: true },
    });

    if (!appConfig) {
      return res.status(500).json({ message: 'App config not found' });
    }

    const maxSeatsPerTrip = appConfig.maxSeatsPerTrip;
console.log('maxSeatsPerTrip',maxSeatsPerTrip);
    res.status(200).json({ maxSeatsPerTrip });
  } catch (error) {
    console.error('Error fetching max seats per trip:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
