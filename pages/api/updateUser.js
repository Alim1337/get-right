import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = 'HAXER';

export default async function handler(req, res) {
  if (req.method === 'GET' || req.method === 'PUT') {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const decodedToken = jwt.verify(token, SECRET_KEY);

      if (req.method === 'GET') {
        // Handle GET request to fetch user details based on the decoded token
        const user = await prisma.users.findUnique({
          where: { userId: decodedToken.userId },
        });

        res.status(200).json({
          role: decodedToken.role,
          id: decodedToken.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email:user.email,
          phoneNumber: user.phoneNumber,
          studentId: user.studentId,
        });
      } else if (req.method === 'PUT') {
        // Handle PUT request to update user information
        const { userId, firstName, lastName, phoneNumber, studentId, email } = req.body;
        console.log(' userId, firstName, lastName, phoneNumber, studentId, email', userId, firstName, lastName, phoneNumber, studentId, email);
        const updatedUser = await prisma.users.upsert({
          where: { userId: userId },
          create: {
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            studentId: studentId,
            email: email,
            password: "", // Add an empty string or a placeholder value here

          },
          update: {
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            studentId: studentId,
            email:email,
          },
        });

        // Generate a token for the updated user
        const token_update = jwt.sign(
          {
            userId: updatedUser.userId,
            email: updatedUser.email,
            role: updatedUser.role,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            phoneNumber: updatedUser.phoneNumber,
            studentId: updatedUser.studentId,
          },
          SECRET_KEY,
          { expiresIn: '1h' }
        );

        res.status(200).json({ token_update, userId: updatedUser.userId });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
