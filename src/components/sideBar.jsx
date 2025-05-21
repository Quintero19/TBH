import { Fragment, useState } from "react";
import { Link } from "react-router-dom";

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
        <div className="p-3">
          <div className="flex items-center mb-12 space-x-4">
            <img
              src="../../public/img/logos/tbh1.png"
              alt="Logo"
              className="w-10 h-10 object-cover rounded-full"
            />
            <h1 className="text-xl font-extrabold tracking-widest">The Barber House</h1>
          </div>

          {/* Menú principal */}
          <div className="uppercase text-base text-gray-400 mb-6 tracking-wide">
            Menu
          </div>
          <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
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
                  <Link to='/admin/dashboard'><span>Dashboard</span></Link>
                </div>
              </li>

              {/* Configuración */}
              <li>
                <button
                  onClick={() => toggleMenu("configuracion")}
                  className="flex items-center justify-between w-full hover:bg-[#161b22] p-4 rounded-xl transition-all"
                >
                  <div className="flex items-center space-x-5">
                    <svg
                      className="w-7 h-7 text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 2.34a8.003 8.003 0 00-1.42-2.36l1.36-1.36a1 1 0 10-1.41-1.42l-1.36 1.36a8.003 8.003 0 00-2.36-1.42V2h-2v2.14a8.003 8.003 0 00-2.36 1.42L7.64 4.22a1 1 0 10-1.41 1.42l1.36 1.36a8.003 8.003 0 00-1.42 2.36H2v2h2.14a8.003 8.003 0 001.42 2.36l-1.36 1.36a1 1 0 101.41 1.42l1.36-1.36a8.003 8.003 0 002.36 1.42V22h2v-2.14a8.003 8.003 0 002.36-1.42l1.36 1.36a1 1 0 001.41-1.42l-1.36-1.36a8.003 8.003 0 001.42-2.36H22v-2h-2.14z" />
                    </svg>
                    <span>Configuración</span>
                  </div>
                  <svg
                    className={`w-6 h-6 transition-transform ${openMenus.configuracion ? "rotate-90" : ""}`}
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
                  <div className="flex items-center space-x-5">
                    <svg
                      className="w-7 h-7 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20h6M4 20h5v-2a4 4 0 00-3-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Usuarios</span>
                  </div>
                  <svg
                    className={`w-6 h-6 transition-transform ${openMenus.usuarios ? "rotate-90" : ""}`}
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
                    <Link to='/admin/usuario'> <li className="hover:text-white cursor-pointer">Usuarios</li></Link>
                    <Link to='/admin/empleado'><li className="hover:text-white cursor-pointer">Empleados</li></Link>
                  </ul>
                )}
              </li>

              {/* Servicios */}
              <li>
                <button
                  onClick={() => toggleMenu("servicios")}
                  className="flex items-center justify-between w-full hover:bg-[#161b22] p-4 rounded-xl transition-all"
                >
                  <div className="flex items-center space-x-5">
                    <svg
                      className="w-7 h-7 text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L7 21h10l-2.75-4m1.5-13a3.25 3.25 0 11-6.5 0 3.25 3.25 0 016.5 0zM4 10h16M4 14h16" />
                    </svg>
                    <span>Servicios</span>
                  </div>
                  <svg
                    className={`w-6 h-6 transition-transform ${openMenus.servicios ? "rotate-90" : ""}`}
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
                    <Link to='/admin/servicios'><li className="hover:text-white cursor-pointer">Servicios</li></Link>
                    <Link to='/admin/agendamiento'><li className="hover:text-white cursor-pointer">Agendamiento</li></Link>
                    <Link to='/admin/horarios'><li className="hover:text-white cursor-pointer">Horarios</li></Link>
                  </ul>
                )}
              </li>

              {/* Compras */}
              <li>
                <button
                  onClick={() => toggleMenu("compras")}
                  className="flex items-center justify-between w-full hover:bg-[#161b22] p-4 rounded-xl transition-all"
                >
                  <div className="flex items-center space-x-5">
                    <svg
                      className="w-7 h-7 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2 5h14M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                    <span>Compras</span>
                  </div>
                  <svg
                    className={`w-6 h-6 transition-transform ${openMenus.compras ? "rotate-90" : ""}`}
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
                    <Link to='/admin/compras'><li className="hover:text-white cursor-pointer">Compras</li></Link>
                    <Link to='/admin/proveedores'><li className="hover:text-white cursor-pointer">Proveedores</li></Link>
                    <Link to='/admin/categoriaproducto'><li className="hover:text-white cursor-pointer">Categoría productos</li></Link>
                    <Link to='/admin/producto'><li className="hover:text-white cursor-pointer">Productos</li></Link>
                    <Link to='/admin/categoriainsumo'><li className="hover:text-white cursor-pointer">Categoría insumos</li></Link>
                    <Link to='/admin/insumo'><li className="hover:text-white cursor-pointer">Insumos</li></Link>
                  </ul>
                )}
              </li>

              {/* Ventas */}
              <li>
                <button
                  onClick={() => toggleMenu("ventas")}
                  className="flex items-center justify-between w-full hover:bg-[#161b22] p-4 rounded-xl transition-all"
                >
                  <div className="flex items-center space-x-5">
                    <svg
                      className="w-7 h-7 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2 5h14M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                    <span>Ventas</span>
                  </div>
                  <svg
                    className={`w-6 h-6 transition-transform ${openMenus.ventas ? "rotate-90" : ""}`}
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
                    <Link to='/admin/ventas'><li className="hover:text-white cursor-pointer">Ventas</li></Link>
                    <Link to='/admin/clientes'><li className="hover:text-white cursor-pointer">Clientes</li></Link>
                    <Link to='/admin/devoluciones'><li className="hover:text-white cursor-pointer">Devoluciones</li></Link>
                  </ul>
                )}
              </li>
            </ul>
          </div>
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
