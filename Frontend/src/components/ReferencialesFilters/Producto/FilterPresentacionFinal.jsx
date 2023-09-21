import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getPresentacionFinal } from "../../../helpers/Referenciales/producto/getPresentacionFinal";

export const FilterPresentacionFinal = ({ onNewInput, finalProducts }) => {
  const [result, setResult] = useState([]);

  const obtenerDataProductos = async () => {

    if(finalProducts?.length){
      //console.log(finalProducts)
      //id: 101
      //label: "RD. TUCO SAZON SALSA MOLIDO BATAN X 70 GRS"
      //value: "211805"
      setResult(finalProducts);

    }else{
      const resultPeticion = await getPresentacionFinal();
      const formatSelect = resultPeticion.map((element) => {
        return {
          value: element.codProd2 === null ? "000000" : element.codProd2,
          label: element.nomProd,
          id: element.id,
        };
      });
      console.log(formatSelect)

      setResult(formatSelect);
    }
    
  };

  useEffect(() => {
      obtenerDataProductos();
  }, [finalProducts]);

  const handledChange = (event, value) => {
    onNewInput(value);
  };

  return (
    <>
      <Autocomplete
        options={result}
        disableClearable
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.id}>
              {option.label}
            </li>
          );
        }}
        onChange={handledChange}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </>
  );
};