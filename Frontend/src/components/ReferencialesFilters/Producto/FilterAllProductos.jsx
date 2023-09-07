import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getAllProductos } from "./../../../helpers/Referenciales/producto/getAllProductos";
import { useAuth } from "../../../hooks/useAuth";

export const FilterAllProductos = ({ onNewInput, inputs,productos }) => {
  const [result, setResult] = useState([]);
  const [value, setValue] = useState({
    label:""
  });

  const { user } = useAuth();
  const obtenerDataProductos = async () => {
    const resultPeticion = await getAllProductos(user);
    var formatSelect = resultPeticion.map((element) => {
      return {
        value: element.codProd2 === null ? "000000" : element.codProd2,
        label: element.nomProd,
        id: element.id,
      };
    });
   //console.log(productos)

    if(productos?.length){
      productos = productos.map((obj)=> obj.idProdt)
      //console.log(productos )
      //resultPeticion.map((obj)=>{
      //  if(obj.nomProd == "AJI COLORADO PANCA PICANTE MOLIDO GIGANTE BATAN X 42 SBS"){
      //    console.log(obj)
      //  }
      //
      //})
      formatSelect = formatSelect.filter((obj)=> productos.includes(obj.id))
      //console.log(formatSelect)
      setResult(formatSelect);
    }else{
    setResult(formatSelect);

    }

    
  };

  useEffect(() => {
    obtenerDataProductos();
  }, [productos]);

  useEffect(() => {


    if(inputs?.producto){
      //console.log(inputs?.producto)
      setValue(inputs?.producto)
    }
  }, [inputs]);


  const handledChange = (event, value) => {
    setValue(value)
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
        value={value}
        onInputChange={(event, value, reason) => {
          if (reason == "input" && value == "") {
            onNewInput({ label: value });
          }
        }}
        onChange={handledChange}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </>
  );
};
