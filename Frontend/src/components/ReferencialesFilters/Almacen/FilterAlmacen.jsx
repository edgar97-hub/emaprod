import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getAlmacenes } from "./../../../helpers/Referenciales/almacen/getAlmacenes";

export const FilterAlmacen = ({ onNewInput, disabled }) => {
  const [result, setResult] = useState([]);

  const getDataAlmacenes = async () => {
    const resultPeticion = await getAlmacenes();
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.codAlm,
        label: `${element.nomAlm}`,
        id: element.id,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    getDataAlmacenes();
  }, []);

  const handledChange = (event, value) => {
    onNewInput(value);
  };

  return (
    <>
      <Autocomplete
        disabled={disabled}
        options={result}
        disableClearable
        getOptionLabel={(option) => option.label}
        onChange={handledChange}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </>
  );
};
