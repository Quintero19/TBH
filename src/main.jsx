import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AlertProvider } from "@/components/AlertProvider";
import App from "./components/App";
import "./styles/css/App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>
			<AlertProvider>
				<App />
			</AlertProvider>
		</BrowserRouter>
	</React.StrictMode>,
);
