import { useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const AdminPage = () => {
    const {user} = useAuth();
    const [staff, setStaff] = useState([]);
    const [newStaff, setNewStaff] = useState({name: '', email: '', password: '', role: 'Staff', department: ''});

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const {data} = await axiosInstance.get('api/auth/admin/staff', {
                headers: {Authorization: `Bearer ${user.token}`},
            });
            setStaff(data);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch Staff');
        }
    };

    const handleCreateStaff = async () => {
        try {
            const {data} = await axiosInstance.post('/api/auth/admin/register', newStaff, {
                headers: {Authorization: `Bearer ${user.token}`},
            });
            setStaff([...staff, data]);
            setNewStaff({name: '', email: '', password: '', role: 'Staff', department: ''});
        } catch (err) {
            console.error(err);
            alert("Couldn't create Staff");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Admin Management</h1>

            <section className="mb=6">
                <h2 className="text-xl font-semibold mb-2">Create Staff Account</h2>
                <input
                placeholder="Name"
                value={newStaff.name}
                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                />
                <input
                placeholder="Email"
                value={newStaff.email}
                onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                />
                <input
                placeholder="Password"
                value={newStaff.password}
                onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                />
                <input
                placeholder="Department"
                value={newStaff.department}
                onChange={(e) => setNewStaff({...newStaff, department: e.target.value})}
                />
                <button onClick={handleCreateStaff}>Create Staff</button>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">Existing Staff</h2>
                <ul>
                    {staff.map((s) =>(
                        <li key={s._id}>
                            {s.name} ({s.email}) - {s.department}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
};

export default AdminPage;