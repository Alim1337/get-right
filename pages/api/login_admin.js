// pages/api/login_admin.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = 'HAXER'; 

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  try {
    const admin = await prisma.admins.findFirst({
      where: {
        username: username,
        password: password,
      },
    });

    if (admin) {
      // User found, login successful
      const token_admin = jwt.sign(
        { userId: admin.userId, username: admin.username },
        SECRET_KEY,
        { expiresIn: '1h' }
      );
      

      return res.status(200).json({ message: 'Login successful', token_admin });
    } else {
      // User not found, authentication failed
      return res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
