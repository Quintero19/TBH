import PropTypes from "prop-types";
import React from "react";
import { FaEye, FaPencilAlt, FaPlus, FaTrash } from "react-icons/fa";
import Button from "./Buttons/Button";
import BasicPagination from "./Paginacion";

const GeneralTable = ({
	title,
	columns,
	data,
	onAdd,
	onView,
	onEdit,
	onDelete,
	onToggleEstado,
	idAccessor = "id",
	stateAccessor = "Estado",
	searchTerm = "",
	onSearchChange,
	currentPage,
	totalPages,
	onPageChange,
	canEdit,
	canDelete,
	...rest
}) => {
	return (
		<div className="p-9 w-full">
			<h1 className="text-5xl font-bold mb-4 text-black">{title}</h1>

			<div className="p-4 bg-white rounded-lg mb-4 shadow-md">
				<div className="flex items-center w-full gap-2">
					<form
						className="flex items-center gap-2 bg-white border rounded-[40px] p-2 shadow-md w-[30%] h-[45px]"
						onSubmit={(e) => e.preventDefault()}
					>
						<input
							type="text"
							placeholder="Buscar..."
							className="p-2 border-none focus:ring-0 outline-none flex-1 h-[30px]"
							value={searchTerm}
							onChange={onSearchChange}
						/>
					</form>

					<Button className="green" onClick={onAdd}>
						<div className="flex items-center gap-2">
							<FaPlus />
							Agregar
						</div>
					</Button>

					{title === "Productos" && (
						<div className="flex justify-end flex-1">
							<div className="flex space-x-2">
								<Button className="green" onClick={rest.goTallas}>
									{" "}
									Tallas
								</Button>
								<Button className="green" onClick={rest.goTamanos}>
									{" "}
									Tamaños
								</Button>
							</div>
						</div>
					)}

					{(title === "Tallas" || title === "Tamaños") && (
						<div className="flex justify-end flex-1">
							<div className="flex space-x-2">
								<Button className="red" onClick={rest.return}>
									{" "}
									Volver a Productos
								</Button>
							</div>
						</div>
					)}
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
								<th className="p-2 border border-gray-300 text-center">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody>
							{data.length > 0 ? (
								data.map((row) => (
									<tr key={row[idAccessor]}>
										{columns.map((col) => (
											<td
												key={col.accessor}
												className="p-2 border border-gray-300"
											>
												{col.accessor === stateAccessor ? (
													<div className="flex justify-center">
														<label className="switch">
															<input
																type="checkbox"
																checked={row[stateAccessor]}
																onChange={() => onToggleEstado(row[idAccessor])}
															/>
															<span className="slider round" />
														</label>
													</div>
												) : (
													row[col.accessor]
												)}
											</td>
										))}
										<td className="p-2 border border-gray-300 text-center">
											<div className="flex justify-center gap-2">
												<Button className="blue_b" onClick={() => onView(row)}>
													<FaEye />
												</Button>

												{(canEdit ? canEdit(row) : true) && (
													<Button
														className="orange_b"
														onClick={() => onEdit(row)}
													>
														<FaPencilAlt />
													</Button>
												)}

												{(canDelete ? canDelete(row) : true) && (
													<Button className="red" onClick={() => onDelete(row)}>
														<FaTrash />
													</Button>
												)}
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

			{/* Paginación funcional */}
			<div className="pagination mt-4">
				<center>
					<BasicPagination
						count={totalPages}
						page={currentPage}
						onChange={onPageChange}
					/>
				</center>
			</div>
		</div>
	);
};

GeneralTable.propTypes = {
	title: PropTypes.string.isRequired,
	columns: PropTypes.arrayOf(
		PropTypes.shape({
			header: PropTypes.string.isRequired,
			accessor: PropTypes.string.isRequired,
		}),
	).isRequired,
	data: PropTypes.arrayOf(PropTypes.object).isRequired,
	onAdd: PropTypes.func.isRequired,
	onView: PropTypes.func.isRequired,
	onEdit: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
	onToggleEstado: PropTypes.func.isRequired,
	idAccessor: PropTypes.string,
	stateAccessor: PropTypes.string,
	searchTerm: PropTypes.string,
	onSearchChange: PropTypes.func.isRequired,
	currentPage: PropTypes.number.isRequired,
	totalPages: PropTypes.number.isRequired,
	onPageChange: PropTypes.func.isRequired,
	canEdit: PropTypes.func,
	canDelete: PropTypes.func,
};

GeneralTable.defaultProps = {
	idAccessor: "id",
	stateAccessor: "Estado",
	searchTerm: "",
};

export default GeneralTable;
