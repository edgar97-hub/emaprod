import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getProductosProduccion } from "./../../../helpers/Referenciales/producto/getProductosProduccion";

export const FilterProductoProduccion = ({ onNewInput }) => {
  const [result, setResult] = useState([]);

  const obtenerDataProductoProduccion = async () => {
    const resultPeticion = await getProductosProduccion();
    const formatSelect = resultPeticion?.map((element) => {
      return {
        value: element.codProd2,
        label: element.nomProd,
        id: element.id,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataProductoProduccion();
  }, []);

  const handledChange = (event, value) => {
    onNewInput(value);
  };

  return (
    <>
      <Autocomplete
        options={result}
        disableClearable
        getOptionLabel={(option) => option.label}
        onChange={handledChange}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </>
  );
};
