import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, problemType, problemDetails } = req.body;
    console.log('userId, problemType, problemDetails', userId, problemType, problemDetails);

    try {
      // Check if the user exists
      const user = await prisma.users.findUnique({
        where: { userId: Number(userId) },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Create a new report
      const report = await prisma.reports.create({
        data: {
          userId: Number(userId),
          problemType,
          problemDetails,
        },
      });

      res.status(201).json({ message: 'Report submitted successfully', report });
    } catch (error) {
      console.error('Error submitting report:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
} else if (req.method === 'GET') {
    try {
      // Fetch all reports
      const reports = await prisma.reports.findMany();

      res.status(200).json(reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}