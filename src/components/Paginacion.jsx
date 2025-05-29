import * as React from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

export default function BasicPagination({ count, page, onChange }) {
  return (
    <Stack spacing={2}>
      <Pagination 
        count={count}          // total páginas dinámico
        page={page}            // página actual controlada
        onChange={onChange}    // función para actualizar página
        color="secondary" 
      />
    </Stack>
  );
}
