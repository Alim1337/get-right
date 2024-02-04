// pages/api/create_admin.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  try {
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the admin with the hashed password and create an associated user
    const createdAdmin = await prisma.admins.create({
      data: {
        username: username,
        password: hashedPassword,
        users: {
          create: {
            firstName: 'admin',
            lastName: 'admin',
            phoneNumber: '056787633',
            email: 'admin@email.com',
            studentId: '1239483900',
            password: hashedPassword,
          },
        },
      },
      include: {
        users: true,
      },
    });

    return res.status(200).json({ message: 'Admin and associated user created successfully', admin: createdAdmin });
  } catch (error) {
    console.error('Error creating admin and user:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
