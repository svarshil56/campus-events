import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { database } from '../../services/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import './AdminUserManagement.css';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(database, "users"));
            const userList = querySnapshot.docs.map(doc => ({
                id: doc.id, // This is the uid
                ...doc.data()
            }));
            setUsers(userList);
        } catch (error) {
            console.error("Error fetching users:", error);
            alert("Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"? This cannot be undone.`)) {
            return;
        }

        try {
            await deleteDoc(doc(database, "users", userId));
            // Note: This only deletes the Firestore document. Authentication record deletion requires Admin SDK or Cloud Function.
            // For now, we just remove them from our DB which effectively bans them from logging in if we check DB on login.

            setUsers(users.filter(u => u.id !== userId));
            alert(`User ${userName} deleted.`);
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
        }
    };

    return (
        <div className="admin-users-container">
            <Navbar />
            <div className="admin-content-wrapper">
                <h1 className="admin-heading">User Management</h1>

                {loading ? (
                    <div className="loading-text">Loading Users...</div>
                ) : (
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.name || 'N/A'}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`role-badge ${user.role}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteUser(user.id, user.name)}
                                                disabled={user.role === 'admin'} // Prevent deleting admins for safety
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUserManagement;
