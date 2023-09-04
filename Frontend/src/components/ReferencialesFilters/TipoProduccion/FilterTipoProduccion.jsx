import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getTiposProduccion } from "./../../../helpers/Referenciales/tipo_produccion/getTiposProduccion";

export const FilterTipoProduccion = ({ onNewInput }) => {
  const [result, setResult] = useState([]);

  const obtenerDataTipoProduccion = async () => {
    const resultPeticion = await getTiposProduccion();
    const formatSelect = resultPeticion?.map((element) => {
      return {
        value: element.id,
        label: element.desProdTip,
        id: element.id,
        cod: element.codTipProd,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataTipoProduccion();
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
