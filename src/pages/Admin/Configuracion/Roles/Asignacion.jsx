import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../../components/Buttons/Button";
import { rolService } from "../../../../service/roles.service";
import { permisoService } from '../../../../service/permisos.service';
import { rolPermisoService } from '../../../../service/asignacionPermiso';

const AsignarRol = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();

    const [rol, setRol] = useState({});
    const [permisos, setPermisos] = useState([]);
    const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);

    useEffect(() => {
  const cargarDatos = async () => {
    try {
      const permisosData = await permisoService.listarPermisos();
      const permisosAsignadosData = await rolPermisoService.listarPermisosPorRol(id);

      setPermisos(
        Array.isArray(permisosData) ? permisosData :
        Array.isArray(permisosData.permisos) ? permisosData.permisos : []
      );

      const permisosAsignados = permisosAsignadosData.data.map(p => p.Permiso_Id);
      setPermisosSeleccionados(permisosAsignados);
    } catch (error) {
      console.error("Error al cargar permisos:", error);
    }
  };

  cargarDatos();
}, [id]);


   const togglePermiso = (permisoId) => {
		setPermisosSeleccionados((prev) =>
			prev.includes(permisoId)
				? prev.filter((id) => id !== permisoId)
				: [...prev, permisoId]
		);
	};

    const handleSubmit = async (e) => {
            e.preventDefault();
    
            try {
                const payload = {
                    Rol_Id: id,
                    Permisos: permisosSeleccionados,
                };

                console.log(payload)

                await rolPermisoService.crearRolPermiso(payload);

                Swal.fire("¡Éxito!", "Permisos asignados correctamente", "success").then(() =>
                    navigate("/admin/roles")
                );
            } catch (error) {
                console.error("Error al asignar permisos:", error);
                Swal.fire("Error", "No se pudieron asignar los permisos", "error");
            }
};


    const handleCancel = () => {
        Swal.fire({
            title: "¿Cancelar?",
            text: "Los cambios no se guardarán.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, salir",
            cancelButtonText: "No",
            background: "#000",
			color: "#fff",
        }).then((result) => {
            if (result.isConfirmed) navigate("/admin/roles");
        });
    };

    return (
        <div className="flex">
            <div className="grow p-6">
                <h1 className="text-4xl font-bold mb-6 text-black">
                    Asignar Permisos a Rol: <span className="text-red-600">{rol.Nombre}</span>
                </h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                    <div className="md:col-span-2 m-7 bg-white shadow border-2 border-gray-200 rounded-lg p-5">
							<h3 className="text-2xl text-black font-bold mb-4">
								Seleccionar Permisos
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
								{permisos.map((permisos) => (
									<label key={permisos.Id} className="...">
										<input
										type="checkbox"
										checked={permisosSeleccionados.includes(permisos.Id)}
										onChange={() => togglePermiso(permisos.Id)}
										/>
										<span className="text-black">{permisos.Nombre}</span>
									</label>
									))}
							</div>
						</div>
					

                    <div className="flex gap-3">
                        <Button className="green" type="submit">
                            Guardar
                        </Button>
                        <Button className="red" onClick={handleCancel}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AsignarRol;
