import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getEstadoInicioProgramadoProduccion } from "./../../../helpers/Referenciales/produccion/getEstadoInicioProgramadoProduccion";

export const FilterEstadoInicioProgramadoProduccion = ({ onNewInput }) => {
  const [result, setResult] = useState([]);

  const obtenerDataEstadoInicioProgramadoProduccion = async () => {
    const resultPeticion = await getEstadoInicioProgramadoProduccion();
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.id,
        label: element.desProdIniProgEst,
        id: element.id,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataEstadoInicioProgramadoProduccion();
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
