import { Fragment, useState } from "react";

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({
    configuracion: false,
    usuarios: false,
    servicios: false,
    compras: false,
    ventas: false,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  return (
    <Fragment>
      {/* Botón hamburguesa para móvil */}
      <button
        className="md:hidden fixed top-5 left-5 z-50 p-2 rounded-md bg-black text-white shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
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

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-70 bg-[black] text-white shadow-2xl flex flex-col justify-between
          transform transition-transform duration-300
          md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          z-40
        `}
      >
        {/* Encabezado */}
        <div className="p-8">
          <div className="flex items-center mb-12 space-x-5">
            <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />
            <h1 className="text-4xl font-extrabold tracking-widest">GAJET</h1>
          </div>

          {/* Menú principal */}
          <div className="uppercase text-base text-gray-400 mb-6 tracking-wide">
            Main Menu
          </div>
          <ul className="space-y-4 font-semibold">
            {/* Dashboard */}
            <li>
              <div className="flex items-center space-x-5 p-4 rounded-xl hover:bg-[#161b22] cursor-pointer">
                <svg
                  className="w-7 h-7 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
                  ></path>
                </svg>
                <span>Dashboard</span>
              </div>
            </li>

            {/* Configuración */}
            <li>
              <button
                onClick={() => toggleMenu("configuracion")}
                className="flex items-center justify-between w-full hover:bg-[#161b22] p-4 rounded-xl transition-all"
              >
                <span>Configuración</span>
                <svg
                  className={`w-6 h-6 transition-transform ${
                    openMenus.configuracion ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {openMenus.configuracion && (
                <ul className="ml-8 mt-2 space-y-2 text-gray-300">
                  <li className="hover:text-white cursor-pointer">Roles</li>
                </ul>
              )}
            </li>

            {/* Usuarios */}
            <li>
              <button
                onClick={() => toggleMenu("usuarios")}
                className="flex items-center justify-between w-full hover:bg-[#161b22] p-4 rounded-xl transition-all"
              >
                <span>Usuarios</span>
                <svg
                  className={`w-6 h-6 transition-transform ${
                    openMenus.usuarios ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {openMenus.usuarios && (
                <ul className="ml-8 mt-2 space-y-2 text-gray-300">
                  <li className="hover:text-white cursor-pointer">Usuarios</li>
                  <li className="hover:text-white cursor-pointer">Empleados</li>
                </ul>
              )}
            </li>

            {/* Servicios */}
            <li>
              <button
                onClick={() => toggleMenu("servicios")}
                className="flex items-center justify-between w-full hover:bg-[#161b22] p-4 rounded-xl transition-all"
              >
                <span>Servicios</span>
                <svg
                  className={`w-6 h-6 transition-transform ${
                    openMenus.servicios ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {openMenus.servicios && (
                <ul className="ml-8 mt-2 space-y-2 text-gray-300">
                  <li className="hover:text-white cursor-pointer">Servicios</li>
                  <li className="hover:text-white cursor-pointer">Citas</li>
                  <li className="hover:text-white cursor-pointer">Horarios</li>
                </ul>
              )}
            </li>

            {/* Compras */}
            <li>
              <button
                onClick={() => toggleMenu("compras")}
                className="flex items-center justify-between w-full hover:bg-[#161b22] p-4 rounded-xl transition-all"
              >
                <span>Compras</span>
                <svg
                  className={`w-6 h-6 transition-transform ${
                    openMenus.compras ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {openMenus.compras && (
                <ul className="ml-8 mt-2 space-y-2 text-gray-300">
                  <li className="hover:text-white cursor-pointer">Compras</li>
                  <li className="hover:text-white cursor-pointer">Proveedores</li>
                  <li className="hover:text-white cursor-pointer">Categoría de productos</li>
                  <li className="hover:text-white cursor-pointer">Productos</li>
                  <li className="hover:text-white cursor-pointer">Categoría insumos</li>
                  <li className="hover:text-white cursor-pointer">Insumos</li>
                </ul>
              )}
            </li>

            {/* Ventas */}
            <li>
              <button
                onClick={() => toggleMenu("ventas")}
                className="flex items-center justify-between w-full hover:bg-[#161b22] p-4 rounded-xl transition-all"
              >
                <span>Ventas</span>
                <svg
                  className={`w-6 h-6 transition-transform ${
                    openMenus.ventas ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {openMenus.ventas && (
                <ul className="ml-8 mt-2 space-y-2 text-gray-300">
                  <li className="hover:text-white cursor-pointer">Ventas</li>
                  <li className="hover:text-white cursor-pointer">Clientes</li>
                  <li className="hover:text-white cursor-pointer">Devoluciones</li>
                </ul>
              )}
            </li>
          </ul>
        </div>

        {/* Pie de página - Cerrar sesión */}
        <div className="p-8 border-t border-[#2d333b]">
          <div className="uppercase text-base text-gray-400 mb-4">Account</div>
          <div className="flex items-center space-x-5 hover:bg-[#161b22] p-4 rounded-xl cursor-pointer">
            <svg
              className="w-7 h-7 text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-6 0V7a3 3 0 016 0v1"
              ></path>
            </svg>
            <span className="text-lg font-semibold">Cerrar sesión</span>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Sidebar;
