import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/sideBar";

const AdminLayout = () => {
	return (
		<div style={{ display: "flex" }}>
			<Navbar />
			<main style={{ marginLeft: "250px", padding: "1rem", width: "100%" }}>
				<Outlet />
			</main>
		</div>
	);
};

export default AdminLayout;
