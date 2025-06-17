import { React, useState, useEffect } from "react";
import {
    FiBox,
    FiHome,
    FiLogOut,
    FiSettings,
    FiShoppingCart,
    FiUser,
} from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import api from "@/utils/api";

const Logout = "/logout/";

const Sidebar = ({ onToggleSidebar }) => {
    const [openMenus, setOpenMenus] = useState({
        configuracion: false,
        usuarios: false,
        servicios: false,
        compras: false,
        ventas: false,
    });

    const [sidebarOpen, setSidebarOpen] = useState(false);  

    const navigate = useNavigate();

    useEffect(() => {
        if (onToggleSidebar) {
            onToggleSidebar(sidebarOpen);
        }
    }, [sidebarOpen, onToggleSidebar]); 

    useEffect(() => {
        if (window.innerWidth < 768) {
            if (sidebarOpen) {
                document.body.style.overflow = 'hidden'; 
            } else {
                document.body.style.overflow = ''; 
            }
        }
        return () => {
            document.body.style.overflow = ''; 
        };
    }, [sidebarOpen]);

    const handleLogout = async () => {
        try {
            await api.post(Logout), {
                method: "POST",
                credentials: "include",
            };
            navigate("/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const toggleMenu = (menu) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menu]: !prev[menu],
        }));
    };

    return (
        <>
            <button
                type="button"
                className="md:hidden fixed top-5 left-5 z-50 p-2 rounded-md bg-black text-white shadow-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Alternar barra lateral"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <title id="toggleSidebarTitle">Alternar barra lateral</title>
                    {sidebarOpen ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    )}
                </svg>
            </button>

            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setSidebarOpen(false)} 
                ></div>
            )}


            <div
                className={`fixed top-0 left-0 h-full w-70 bg-[black] text-white shadow-2xl flex flex-col justify-between
          transform transition-transform duration-300
          md:translate-x-0 /* Siempre visible en pantallas medianas y grandes */
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} /* En móvil: se desliza dentro/fuera de la vista */
          z-40 /* Asegura que esté por encima del contenido principal */
        `}
            >
                <div className="p-5">
                    <div className="flex items-center mb-12 space-x-4">
                        <img
                            src="/img/logos/tbh1.png"
                            alt="Logo"
                            className="w-10 h-10 object-cover rounded-full"
                        />
                        <h1 className="text-xl font-extrabold tracking-widest">
                            The Barber House
                        </h1>
                    </div>

                    <div className="uppercase text-base text-gray-400 mb-6 tracking-wide">
                        Menú
                    </div>
                    <div
                        className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1"
                        style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#4B5563 transparent",
                        }}
                    >
                        <ul className="space-y-4 font-semibold">
                            <li>
                                <div className="flex items-center space-x-5 p-4 rounded-xl hover:bg-[#161b22] cursor-pointer">
                                    <FiHome className="w-7 h-7 text-blue-400" />
                                    <span>
                                        <Link to="/admin/dashboard" onClick={() => setSidebarOpen(false)}>
                                            <span className="hover:text-white">Dashboard</span>
                                        </Link>
                                    </span>
                                </div>
                            </li>

                    
                            <li>
                                <button
                                    type="button"
                                    onClick={() => toggleMenu("configuracion")}
                                    className="flex items-center justify-between w-full hover:bg-[#161b22] p-4 rounded-xl transition-all"
                                >
                                    <div className="flex items-center space-x-5">
                                        <FiSettings className="w-7 h-7 text-yellow-400" />
                                        <span>Configuración</span>
                                    </div>
                                    <svg
                                        className={`w-6 h-6 transition-transform ${openMenus.configuracion ? "rotate-90" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <title id="configuracionIconTitle">
                                            Alternar Menú de Configuración
                                        </title>
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                                {openMenus.configuracion && (
                                    <ul className="ml-8 mt-2 space-y-2 text-gray-300">
                                        <Link to="/admin/roles" onClick={() => setSidebarOpen(false)}>
                                            <li className="hover:text-white cursor-pointer p-2 border-t border-[#2d333b]">
                                                Roles
                                            </li>
                                        </Link>
                                    </ul>
                                )}
                            </li>

                            {/* Usuarios */}
                            <li>
                                <button
                                    type="button"
                                    onClick={() => toggleMenu("usuarios")}
                                    className="flex items-center justify-between w-full hover:bg-[#161b22] p-4 rounded-xl transition-all"
                                >
                                    <div className="flex items-center space-x-5">
                                        <FiUser className="w-7 h-7 text-green-400" />
                                        <span>Usuarios</span>
                                    </div>
                                    <svg
                                        className={`w-6 h-6 transition-transform ${openMenus.usuarios ? "rotate-90" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <title id="usuariosIconTitle">Alternar Menú de Usuarios</title>
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                                {openMenus.usuarios && (
                                    <ul className="ml-8 mt-2 space-y-2 text-gray-300">
                                        <Link to="/admin/usuario" onClick={() => setSidebarOpen(false)}>
                                            <li className="hover:text-white cursor-pointer p-2 border-t border-[#2d333b]">
                                                Usuarios
                                            </li>
                                        </Link>
                                        <Link to="/admin/empleado" onClick={() => setSidebarOpen(false)}>
                                            <li className="hover:text-white cursor-pointer p-2 border-t border-[#2d333b]">
                                                Empleados
                                            </li>
                                        </Link>
                                    </ul>
                                )}
                            </li>

                            {/* Servicios */}
                            <li>
                                <button
                                    type="button"
                                    onClick={() => toggleMenu("servicios")}
                                    className="flex items-center justify-between w-full hover:bg-[#161b22] p-4 rounded-xl transition-all"
                                >
                                    <div className="flex items-center space-x-5">
                                        <FiBox className="w-7 h-7 text-indigo-400" />
                                        <span>Servicios</span>
                                    </div>
                                    <svg
                                        className={`w-6 h-6 transition-transform ${openMenus.servicios ? "rotate-90" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <title id="serviciosIconTitle">Alternar Menú de Servicios</title>
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                                {openMenus.servicios && (
                                    <ul className="ml-8 mt-2 space-y-2 text-gray-300">
                                        <Link to="/admin/servicios" onClick={() => setSidebarOpen(false)}>
                                            <li className="hover:text-white cursor-pointer p-2 border-t border-[#2d333b]">
                                                Servicios
                                            </li>
                                        </Link>
                                        <Link to="/admin/agendamiento" onClick={() => setSidebarOpen(false)}>
                                            <li className="hover:text-white cursor-pointer p-2 border-t border-[#2d333b]">
                                                Agendamiento
                                            </li>
                                        </Link>
                                        <Link to="/admin/horarios" onClick={() => setSidebarOpen(false)}>
                                            <li className="hover:text-white cursor-pointer p-2 border-t border-[#2d333b]">
                                                Horarios
                                            </li>
                                        </Link>
                                    </ul>
                                )}
                            </li>

                            {/* Compras */}
                            <li>
                                <button
                                    type="button"
                                    onClick={() => toggleMenu("compras")}
                                    className="flex items-center justify-between w-full hover:bg-[#161b22] p-4 rounded-xl transition-all"
                                >
                                    <div className="flex items-center space-x-5">
                                        <FiShoppingCart className="w-7 h-7 text-purple-400" />
                                        <span>Compras</span>
                                    </div>
                                    <svg
                                        className={`w-6 h-6 transition-transform ${openMenus.compras ? "rotate-90" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <title id="comprasIconTitle">Alternar Menú de Compras</title>
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                                {openMenus.compras && (
                                    <ul className="ml-8 mt-2 space-y-2 text-gray-300">
                                        <Link to="/admin/compras" onClick={() => setSidebarOpen(false)}>
                                            <li className="hover:text-white cursor-pointer p-2 border-t border-[#2d333b]">
                                                Compras
                                            </li>
                                        </Link>
                                        <Link to="/admin/proveedores" onClick={() => setSidebarOpen(false)}>
                                            <li className="hover:text-white cursor-pointer p-2 border-t border-[#2d333b]">
                                                Proveedores
                                            </li>
                                        </Link>
                                        <Link to="/admin/categoriaproducto" onClick={() => setSidebarOpen(false)}>
                                            <li className="hover:text-white cursor-pointer p-2 border-t border-[#2d333b]">
                                                Categoría productos
                                            </li>
                                        </Link>
                                        <Link to="/admin/productos" onClick={() => setSidebarOpen(false)}>
                                            <li className="hover:text-white cursor-pointer p-2 border-t border-[#2d333b]">
                                                Productos
                                            </li>
                                        </Link>
                                        <Link to="/admin/categoriainsumo" onClick={() => setSidebarOpen(false)}>
                                            <li className="hover:text-white cursor-pointer p-2 border-t border-[#2d333b]">
                                                Categoría insumos
                                            </li>
                                        </Link>
                                        <Link to="/admin/insumo" onClick={() => setSidebarOpen(false)}>
                                            <li className="hover:text-white cursor-pointer p-2 border-t border-[#2d333b]">
                                                Insumos
                                            </li>
                                        </Link>
                                    </ul>
                                )}
                            </li>

                            {/* Ventas */}
                            <li>
                                <button
                                    type="button"
                                    onClick={() => toggleMenu("ventas")}
                                    className="flex items-center justify-between w-full hover:bg-[#161b22] p-4 rounded-xl transition-all"
                                >
                                    <div className="flex items-center space-x-5">
                                        <FiShoppingCart className="w-7 h-7 text-red-400" />
                                        <span>Ventas</span>
                                    </div>
                                    <svg
                                        className={`w-6 h-6 transition-transform ${openMenus.ventas ? "rotate-90" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <title id="ventasIconTitle">Alternar Menú de Ventas</title>
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                                {openMenus.ventas && (
                                    <ul className="ml-8 mt-2 space-y-2 text-gray-300">
                                        <Link to="/admin/ventas" onClick={() => setSidebarOpen(false)}>
                                            <li className="hover:text-white cursor-pointer p-2 border-t border-[#2d333b]">
                                                Ventas
                                            </li>
                                        </Link>
                                        <Link to="/admin/clientes" onClick={() => setSidebarOpen(false)}>
                                            <li className="hover:text-white cursor-pointer p-2 border-t border-[#2d333b]">
                                                Clientes
                                            </li>
                                        </Link>
                                        <Link to="/admin/devoluciones" onClick={() => setSidebarOpen(false)}>
                                            <li className="hover:text-white cursor-pointer p-2 border-t border-[#2d333b]">
                                                Devoluciones
                                            </li>
                                        </Link>
                                    </ul>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Pie de página - Cerrar sesión */}
                <div className="p-8 border-t border-[#2d333b]">
                    <div className="flex items-center space-x-5 hover:bg-[#161b22] p-4 rounded-xl cursor-pointer">
                        <FiLogOut className="w-7 h-7 text-gray-300" />
                        <button type="button" onClick={handleLogout}>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
