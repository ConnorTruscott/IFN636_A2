import { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";
//import User from "../../../backend/models/User";
import { useAuth } from "../context/AuthContext";

    const Notification = () => {
        const [isOpen, setIsOpen] = useState(false);
        const [notifications, setNotifications] = useState([]);
        const {user} = useAuth();

        useEffect(() => {
            const fetchNotifications = async () => {
                try {
                    const { data } = await axiosInstance.get("/api/notifications", {
                        headers: {Authorization: `Bearer ${user.token}`},
                    });
                    setNotifications(data);
                } catch (err) {
                    console.error("Failed to fetch notifications", err);
                }
            };

            fetchNotifications();
            const interval = setInterval(fetchNotifications, 15000);
            return () => clearInterval(interval);
        }, []);

        const markAsRead = async () => {
            try {
                await axiosInstance.post("/api/notifications/mark-read",
                    {},
                    {headers: {Authorization: `Bearer ${user.token}`}}
                );
                setNotifications(notifications.map((n) => ({...n, read: true})));
            } catch (err) {
                console.error("Failed to mark as read", err);
            }
        };

        const dismissNotification = async (id) => {
            try{
                await axiosInstance.delete(`/api/notifications/${id}`, {
                    headers: {Authorization: `Bearer ${user.token}`},
                });
                setNotifications(notifications.filter((n) => n._id !== id));
            } catch (err) {
                console.error("Failed to dismiss notification", err);
            }
        }

        //Show unread messages
        const unread = notifications.filter((n) => !n.read);

        const handleToggle = () => {
            setIsOpen(!isOpen);
            if (!isOpen && unread.length >0) {
                markAsRead();
            }
        };

        return(
            <div className="relative inline-block">
                {/*Bell Icon*/}
                <button onClick={handleToggle} className="relative text-xl">
                    🔔
                    {unread.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
                            {unread.length}
                        </span>
                    )}
                </button>

                {/*Dropdown*/}
                {/* {isOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded-lg shadow-lg z-50">
                        <div className="p-2 border-b font-semibold">Notifications</div>
                        <ul className="max-h-60 overflow-y-auto">
                            {unread.length>0 ? (
                                unread.map((n, i) => (
                                    <li key={i} className="p-2 hover:bg-gray-100">
                                        {n.message}
                                    </li>
                                ))
                            ) : (
                                <li className="p-2 text-gray-500">No new notifications</li>
                            )}
                        </ul>
                    </div>
                )} */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white text-black rounded-lg shadow-lg z-50">
                        <div className="p-2 border-b font-semibold flex justify-between items-center">
                            <span>Notifications</span>
                            <button onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-black">
                                ✖
                            </button>
                        </div>
                        <ul className="hax-h-60 overflow-y-auto">
                            {notifications.length >0 ? (
                                notifications.map((n) => (
                                    <li key={n._id}
                                    className={`p-2 flex justify-between items-center hover:bg-gray-100 ${!n.read ? "font-bold" : ""}`}>
                                        <span>{n.message}</span>
                                        <button onClick={() => dismissNotification(n._id)}
                                        className="text-gray-400 hover: text-red-500 ml-2">
                                            ✖
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li className="p-2 text-gray-500">No notifications</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    export default Notification;