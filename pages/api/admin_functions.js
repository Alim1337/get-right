// pages/api/admin_functions.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all users
    try {
      const users = await prisma.users.findMany();
      //console.log(users);
      return res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'POST') {
    // Add a new user
    const { firstName, lastName, email, password, role } = req.body;

    try {
      const newUser = await prisma.users.create({
        data: {
          firstName,
          lastName,
          email,
          password,
          role,
        },
      });

      return res.status(200).json({ message: 'User added successfully', user: newUser });
    } catch (error) {
      console.error('Error adding user:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'DELETE') {
    // Delete a user
    const userId = req.body.userId;
    console.log(userId);
        try {
      const deletedUser = await prisma.users.delete({
        where: {
          userId,
        },
      });

      return res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'PUT') {
    // Modify a user
    const { userId, firstName, lastName, email, password, role } = req.body;

    try {
      const modifiedUser = await prisma.users.update({
        where: {
          userId,
        },
        data: {
          firstName,
          lastName,
          email,
          password,
          role,
        },
      });

      return res.status(200).json({ message: 'User modified successfully', user: modifiedUser });
    } catch (error) {
      console.error('Error modifying user:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
