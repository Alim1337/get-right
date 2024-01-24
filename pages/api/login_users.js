// pages/api/login_user.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = 'HAXER'; 

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, password } = req.body;

    try {
        // Debug: Log the received request body
        console.log('Request Body:', req.body);

        const user = await prisma.users.findFirst({
            where: {
                email: email,
                password: password,
            },
        });

        // Debug: Log the user found (or not found)
        console.log('User:', user);

        if (user) {
            // User found, login successful
            const token_login = jwt.sign(
                { userId: user.userId, email: user.email, role: user.role },
                SECRET_KEY,
                { expiresIn: '1h' }
            );

            // Debug: Log the response data
            console.log('Response Data:', { message: 'Login successful', token_login, userId: user.userId });

            return res.status(200).json({ message: 'Login successful', token_login, userId: user.userId, role: user.role });
        } else {
            // User not found, authentication failed
            // Debug: Log the response data for failed login
            console.log('Response Data:', { message: 'Unauthorized' });

            return res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (error) {
        // Debug: Log any errors that occur during login
        console.error('Login error:', error);

        // Debug: Log the response data for internal server error
        console.log('Response Data:', { message: 'Internal Server Error' });

        return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
}
