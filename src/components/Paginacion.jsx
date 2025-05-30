import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import PropTypes from "prop-types";
import * as React from "react";

export default function BasicPagination({ count, page, onChange }) {
	return (
		<Stack spacing={2}>
			<Pagination
				count={count}
				page={page}
				onChange={onChange}
				color="secondary"
			/>
		</Stack>
	);
}

BasicPagination.propTypes = {
	count: PropTypes.number.isRequired,
	page: PropTypes.number.isRequired,
	onChange: PropTypes.func.isRequired,
};
