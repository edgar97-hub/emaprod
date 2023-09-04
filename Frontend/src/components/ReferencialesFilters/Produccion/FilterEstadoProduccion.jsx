import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getEstadosProduccion } from "./../../../helpers/Referenciales/produccion/getEstadosProduccion";

export const FilterEstadoProduccion = ({ onNewInput }) => {
  const [result, setResult] = useState([]);

  const obtenerDataEstadosProduccion = async () => {
    const resultPeticion = await getEstadosProduccion();
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.id,
        label: element.desEstPro,
        id: element.id,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataEstadosProduccion();
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
