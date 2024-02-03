import { useState, useEffect } from 'react';
import tw from "tailwind-styled-components";
import { useRouter } from "next/router";
import { toast } from 'sonner'

// ... other imports

const isPhoneNumberValid = (phoneNumber) => {
    return !isNaN(phoneNumber) && phoneNumber.length === 10;
};

const isValidStudentId = (studentId) => {
    return !isNaN(studentId) && studentId.length === 12;
};

const showErrorToast = (error) => {
    toast.error(error, {
        position: 'top-center',
    });
};


const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            router.push('/login');
        } else {
            try {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    role: decodedToken.role,
                    id: decodedToken.userId,
                    firstName: decodedToken.firstName,
                    lastName: decodedToken.lastName,
                    phoneNumber: decodedToken.phoneNumber,
                    studentId: decodedToken.studentId,
                    photoUrl: 'userImage/userProfile.jpg'
                });
            } catch (error) {
                console.error('Error decoding token:', error);
                localStorage.removeItem('token'); // Remove invalid token
                router.push('/login');
            }
        }
    }, [router]);

    // Fetch user data here (e.g., from an API) and setUser accordingly

    const handleChange = (event) => {
        setUser({ ...user, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!isPhoneNumberValid(user.phoneNumber)) {
            showErrorToast('Invalid phone number format. Please enter a valid phone number.');
            return;
        }

        if (!isValidStudentId(user.studentId)) {
            showErrorToast('Invalid student ID format. Please enter a valid student ID.');
            return;
        }

        try {
            const response = await fetch('/api/updateUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber,
                    studentId: user.studentId,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.token_update) {
                    localStorage.setItem('token', data.token_update);
                    localStorage.setItem('userId', data.userId);
                    toast.success('Informations update successful.', { position: 'top-center' });
                }
            } else if (response.status === 400) {
                const errorData = await response.json();
                showErrorToast(`Registration failed. ${errorData.error}`);
            } else {
                console.error(`Failed to fetch: ${response.status} - ${response.statusText}`);
                showErrorToast('Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            showErrorToast('Registration failed. Please try again.');
        }
    };

    return (



        <div className="flex flex-col items-center p-8 sm:p-12">

            <div className="flex items-center space-x-6 mb-8">
                <h1 className="text-2xl font-bold">Your Profile</h1>
                <UserImage
                    src={user && user.photoUrl}
                    alt="User Photo"
                    className="h-20 w-20 rounded-full border-4 border-gray-300"
                />
            </div>


            <div className="w-full max-w-md bg-gray-100 p-10 rounded-3xl shadow-2xl justify-center">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            First Name:
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={user && user.firstName}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-2xl p-2.5"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Last Name:
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={user && user.lastName}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-2xl p-2.5"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Phone Number:
                        </label>
                        <input
                            type="text"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={user && user.phoneNumber}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-2xl p-2.5"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Student ID:
                        </label>
                        <input
                            type="text"
                            id="studentId"
                            name="studentId"
                            value={user && user.studentId}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-2xl p-2.5"
                        />
                    </div>


                    {/* ... other fields for user info */}

                    <button
                        type="submit"
                        className="ml-24 mt-5 w-1/2  items-center px-4 py-2 bg-blue-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}


const UserImage = tw.img`
  h-8 w-auto cursor-pointer rounded-full transition-all duration-500 ease-in-out
`;


export default ProfilePage;