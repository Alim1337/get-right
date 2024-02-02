import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // Import the bcrypt library

const prisma = new PrismaClient();
const SECRET_KEY = 'HAXER';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, password } = req.body;

    try {
        const user = await prisma.users.findFirst({
            where: {
                email: email,
            },
        });

        if (user && await bcrypt.compare(password, user.password)) {
            // Passwords match, login successful
            const token_login = jwt.sign(
                {
                    userId: user.userId,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
                SECRET_KEY,
                { expiresIn: '1h' }
            );

            return res.status(200).json({ message: 'Login successful', token_login, userId: user.userId, role: user.role });
        } else {
            // User not found or passwords don't match, authentication failed
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
}
