import { useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const AdminPage = () => {
    const {user} = useAuth();
    const [staff, setStaff] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [newDept, setNewDept] = useState('');
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

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const {data} = await axiosInstance.get("/api/departments", {
                    headers: {Authorization: `Bearer ${user.token}`},
                });
                setDepartments(data);
            } catch (err) {
                console.error("Failed to fetch departments", err);
            }
        };

        fetchDepartments();
    }, []);

    const handleCreateDepartment = async () => {
        if (!newDept) return;
        try {
            const {data} = await axiosInstance.post(
                '/api/departments',
                {name: newDept},
                {headers: {Authorization: `Bearer ${user.token}`}}
            );
            setDepartments([...departments, data]);
            setNewDept('')
        } catch (err) {
            console.error('Failed to create department', err);
            alert('Could not create department');
        }
    };

    const handleDeleteDepartment = async (id) => {
        try {
            await axiosInstance.delete(`/api/departments/${id}`, {
                headers: {Authorization: `Bearer ${user.token}`},
            });
            setDepartments(departments.filter((d) => d._id!==id));
        } catch (err) {
            console.error('Failed to delete department', err);
            alert('Could not delete department');
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
                <select
                value={newStaff.department}
                onChange={(e) => setNewStaff({...newStaff, department: e.target.value})}
                >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                        <option key={d._id} value={d.name}>
                            {d.name}
                        </option>
                    ))}
                </select>
                <button onClick={handleCreateStaff}>Create Staff</button>
            </section>

            <section className='mb-6'>
                <h2 className="text-xl font-semibold mb-2">Manage Departments</h2>
                <input
                placeholder="New Department Name"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                />
                <button onClick={handleCreateDepartment}>Add Department</button>

                <ul>
                    {departments.map((d) => (
                        <li key={d._id}>
                            {d.name}
                            <button onClick={() => handleDeleteDepartment(d._id)}>Delete</button>
                        </li>
                    ))}
                </ul>
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