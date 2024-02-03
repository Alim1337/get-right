import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // Import the bcrypt library

const prisma = new PrismaClient();
const SECRET_KEY = 'HAXER';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { firstName, lastName, phoneNumber, email, password, studentId } = req.body;

    try {



      const existingUserWithEmail = await prisma.users.findUnique({
        where: { email },
      });


      if (existingUserWithEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Check if a user with the given student ID already exists
      const existingUserWithStudentId = await prisma.users.findUnique({
        where: { email },
      });



      if (existingUserWithStudentId) {
        return res.status(400).json({ error: 'Student ID already exists' });
      }


      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

      const newUser = await prisma.users.create({
        data: {
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
          studentId: studentId,
          email: email,
          password: hashedPassword, // Store the hashed password
          role: 'client',
        },
      });

      // Generate a token for the new user
      const token_signup = jwt.sign(
        {
          userId: newUser.userId,
          email: newUser.email,
          role: newUser.role,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phoneNumber: newUser.phoneNumber,
          studentId: newUser.studentId,
        },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.status(200).json({ token_signup, userId: newUser.userId });
    } catch (error) {
      console.error('Error during user registration:', error);
      res.status(500).json({ error: 'Error during user registration' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
