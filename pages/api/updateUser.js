import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = 'HAXER';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {userId ,firstName, lastName, phoneNumber, studentId } = req.body;

    try {


        const updated = await prisma.users.update({
            where: { userId: userId },
            data: {
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber,
                studentId: studentId,
            },
        });

        const updatedUser = await prisma.users.findUnique({
            where: { userId: userId },
        });


      // Check if a user with the given student ID already exists
    //   const existingUserWithStudentId = await prisma.users.findUnique({
    //     where: { email },
    //   });



    //   if (existingUserWithStudentId) {
    //     return res.status(400).json({ error: 'Student ID already exists' });
    //   }


    //   const hashedPassword = await bcrypt.hash(password, 10); // Hash the password



      // Generate a token for the new user
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
    } catch (error) {
      console.error('Error during user registration:', error);
      res.status(500).json({ error: 'Error during user registration' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
