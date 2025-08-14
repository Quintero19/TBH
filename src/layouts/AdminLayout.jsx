import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sideBar";

const AdminLayout = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const handleToggleSidebar = (isOpen) => {
		setIsSidebarOpen(isOpen);
	};

	return (
		<div className="flex min-h-screen bg-gray-100 overflow-hidden">
			<Sidebar onToggleSidebar={handleToggleSidebar} />
			<div
				className={`flex-1 transition-all duration-300 min-w-0 overflow-auto
                    md:ml-[260px] /* Margen para desktop, el ancho de tu sidebar. */

                    ${window.innerWidth < 768 ? (isSidebarOpen ? "p-0" : "p-4") : ""} /* Padding para móvil. */
                `}
			>
				<div className="max-w-screen-xl mx-auto pt-4">
					<Outlet />
				</div>
			</div>
		</div>
	);
};

export default AdminLayout;
