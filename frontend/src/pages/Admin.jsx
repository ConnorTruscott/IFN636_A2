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
            const {data} = await axiosInstance.get('/api/admin/staff', {
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

    const handleDeleteStaff = async (id, department) => {
        try {
            const {data} = await axiosInstance.delete(`/api/admin/staff/${id}`, {
                headers: {Authorization: `Bearer ${user.token}`},
            });
            setStaff(staff.filter((s) => s._id !== id));
        } catch (err) {
            console.error("Failed to delete staff", err);
            alert("Could not delete staff");
        }
    };

    const handleUpdateDepartment = async (id, department) => {
        try {
            const {data} = await axiosInstance.put(`/api/admin/staff/${id}/department`, {department},
                {headers: {Authorization: `Bearer ${user.token}`}}
            );
            setStaff(staff.map((s) => (s._id === id ? {...s, department}:s)));
        } catch (err) {
            console.error("Failed to update department", err);
            alert("Could not update department");
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
        <div className="p-6 space-y-8">
            <h1 className="text-3xl font-=bold mb-4">Admin Management</h1>

            <section className="space-y-4 p-4 border rounded-lg shadow-sm bg-white">
                <h2 className="text-2xl font-semibold">Create Staff Account</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="border p-2 rounded w-full"
                    placeholder="Name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                    />
                    <input className="border p-2 rounded w-full"
                    placeholder="Email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                    />
                    <input className="border p-2 rounded w-full"
                    placeholder="Password"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                    />
                    <select className="border p-2 rounded w-full"
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
                </div>

                <button onClick={handleCreateStaff}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Create Staff
                </button>
            </section>

            <section className="space-y-4 p-4 border rounded-lg shadow-sm bg-white">
                <h2 className="text-2xl font-semibold">Manage Departments</h2>

                <div className="flex gap-2">
                    <input className="border p-w rounded flex-1"
                    placeholder="New Department Name"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    />
                    <button onClick={handleCreateDepartment}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Add
                    </button>
                </div>

                <ul className="mt-2 space-y-2">
                    {departments.map((d) => (
                        <li key={d._id} className="flex justify-between items-center p-2 border rounded">
                            <span>{d.name}</span>
                            <button onClick={() => handleDeleteDepartment(d._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="space-y-4 p-4 border rounded-lg shadow-sm bg-white">
                <h2 className="text-2xl font-semibold">Existing Staff</h2>

                <ul className="space-y-2">
                    {staff.map((s) => (
                    <li
                        key={s._id}
                        className="grid grid-cols-4 items-center gap-4 p-2 border rounded"
                    >
                        <span className="font-medium truncate">{s.name}</span>

                        <span className="text-gray-500 truncate">{s.email}</span>

                        <select
                        className="border p-2 rounded w-full"
                        value={s.department || ""}
                        onChange={(e) => handleUpdateDepartment(s._id, e.target.value)}
                        >
                        <option value="">Select Department</option>
                        {departments.map((d) => (
                            <option key={d._id} value={d.name}>
                            {d.name}
                            </option>
                        ))}
                        </select>

                        <button
                        onClick={() => handleDeleteStaff(s._id)}
                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                        >
                        Delete
                        </button>
                    </li>
                ))}
                </ul>
            </section>
        </div>
    )
};

 export default AdminPage;