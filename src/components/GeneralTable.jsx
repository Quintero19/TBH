import React from "react";
import Button from "./Buttons/Button";
import BasicPagination from "./Paginacion";

const GeneralTable = ({ columns, data, onAdd, onView, onEdit, onDelete }) => {
  return (
    <div className="p-9">
      <h1 className="text-3xl font-bold mb-4">Gestión de Datos</h1>

      <div className="p-4 bg-white rounded-lg mb-4 shadow-md">
        <div className="flex items-center w-full gap-2">
          <form className="flex items-center gap-2 bg-white border rounded-[40px] p-2 shadow-md w-[30%] h-[45px]">
            <input
              type="text"
              placeholder="Buscar..."
              className="p-2 border-none focus:ring-0 outline-none flex-1 h-[30px]"
            />
            <Button className="blue_a" icon="fa-search" />
          </form>

          <Button className="green" icon="fa-plus" onClick={onAdd}>
            Agregar
          </Button>
        </div>

        <div className="mt-4 border-t-4 border-black pt-4">
          <table className="min-w-full border border-gray-300 rounded-lg shadow-md overflow-hidden">
            <thead>
              <tr className="bg-black text-white">
                {columns.map((col) => (
                  <th key={col.accessor} className="p-2 border border-gray-300">
                    {col.header}
                  </th>
                ))}
                <th className="p-2 border border-gray-300 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((row, index) => (
                  <tr key={index}>
                    {columns.map((col) => (
                      <td key={col.accessor} className="p-2 border border-gray-300">
                        {col.accessor === "estado" ? (
                          <div className="flex justify-center gap-2">
                            <label className="switch">
                              <input
                                type="checkbox"
                                checked={row[col.accessor]}
                                onChange={() => {}}
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>
                        ) : (
                          row[col.accessor]
                        )}
                      </td>
                    ))}
                    <td className="p-2 border border-gray-300 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          className="blue_b"
                          icon="fa-eye"
                          onClick={() => onView(row)}
                        />
                        <Button
                          className="orange_b"
                          icon="fa-pencil"
                          onClick={() => onEdit(row)}
                        />
                        <Button
                          className="red"
                          icon="fa-trash"
                          onClick={() => onDelete(row)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="p-4 text-center">
                    No hay datos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pagination mt-4">
        <center><BasicPagination /></center>
      </div>
    </div>
  );
};

export default GeneralTable;
