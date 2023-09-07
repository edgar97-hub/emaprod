import React, { useState, useEffect } from "react";
// HOOKS
import { useForm } from "../../../hooks/useForm";
// IMPORTACIONES PARA TABLE MUI
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import { TextField } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
//IMPORTACIONES PARA DIALOG DELETE
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { getEntradasStock } from "./../../helpers/entradas-stock/getEntradasStock";
// FILTROS
import { FilterAllProductos } from "./../../../components/ReferencialesFilters/Producto/FilterAllProductos";
import { FilterMateriaPrima } from "./../../../components/ReferencialesFilters/Producto/FilterMateriaPrima";
import { FilterProveedor } from "./../../../components/ReferencialesFilters/Proveedor/FilterProveedor";
import { FilterAlmacen } from "./../../../components/ReferencialesFilters/Almacen/FilterAlmacen";
// FECHA PICKER
import FechaPickerDay from "./../../../components/Fechas/FechaPickerDay";
import FechaPickerMonth from "./../../../components/Fechas/FechaPickerMonth";
import ExportExcel from "../entradasStock/ExportExcel";

// CONFIGURACIONES DE ESTILOS
const label = { inputProps: { "aria-label": "Checkbox demo" } };
// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ListEntradaStock = () => {
  // ESTADOS PARA LOS FILTROS PERSONALIZADOS
  const [dataEntSto, setdataEntSto] = useState([]);
  const [dataEntStoTmp, setdataEntStoTmp] = useState([]);

  const [inputs, setInputs] = useState({
    producto: { label: "" },
    provedor: { label: "" },
    almacen: { label: "" },
    codigo: "",
    seleccion: false,
    ingresado: "",
    disponible: "",
  });

  // ESTADOS PARA FILTROS GENERALES DE FECHA
  const { fecEntIniSto, fecEntFinSto, formState, setFormState, onInputChange } =
    useForm({
      fecEntIniSto: "",
      fecEntFinSto: "",
    });

  // ESTADOS PARA LA PAGINACIÓN
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ESTADO PARA CONTROLAR EL FEEDBACK
  const [feedbackDelete, setfeedbackDelete] = useState(false);
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: "",
    feedback_description_error: "",
  });
  const { style_message, feedback_description_error } = feedbackMessages;

  // MANEJADORES DE FEEDBACK
  const handleClickFeeback = () => {
    setfeedbackDelete(true);
  };

  // MANEJADORES DE LA PAGINACION
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseFeedback = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setfeedbackDelete(false);
  };

  // Funcion para traer la data de las entradas
  const obtenerDataEntradaStock = async (body = {}) => {
    // hacer validaciones correpondientes
    const resultPeticion = await getEntradasStock(body);
    const { message_error, description_error, result } = resultPeticion;
    //console.log(result);
    if (message_error.length === 0) {
      setdataEntSto(result);
      setdataEntStoTmp(result);
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  // Manejadores de cambios
  const handleFormFilter = ({ target }) => {
    const { name, value } = target;
    setInputs({
      ...inputs,
      [name]: value,
    });
    //filter(value, name);
  };

  const onChangeProducto = (obj) => {
    setInputs({
      ...inputs,
      producto: obj,
    });
    //filter(label, "filterProducto");
  };

  const onChangeProveedor = (obj) => {
    setInputs({
      ...inputs,
      provedor: obj,
    });
    //filter(obj.label, "filterProveedor");
  };

  const onChangeAlmacen = (obj) => {
    //console.log(obj);
    setInputs({
      ...inputs,
      almacen: obj,
    });
    //filter(obj.label, "filterAlmacen");
  };

  const onChangeDate = (newDate) => {
    const dateFilter = newDate.split(" ");
    filter(dateFilter[0], "filterFechaEntrada");
  };

  const onChangeSeleccionado = (event, value) => {
    const valueFilter = value ? "1" : "0";
    filter(valueFilter, "filterEsSeleccion");
  };

  // Filtros generales que hacen nuevas consultas
  const onChangeDateStartData = (newDate) => {
    let dateFormat = newDate.split(" ")[0];
    setFormState({ ...formState, fecEntIniSto: dateFormat });
    // realizamos una promesa
    let body = {
      ...formState,
      fecEntIniSto: dateFormat,
    };
    obtenerDataEntradaStock(body);
  };

  const onChangeDateEndData = (newDate) => {
    let dateFormat = newDate.split(" ")[0];
    setFormState({ ...formState, fecEntFinSto: dateFormat });
    // realizamos una promesa
    let body = {
      ...formState,
      fecEntFinSto: dateFormat,
    };
    obtenerDataEntradaStock(body);
  };

  React.useEffect(() => {
    let resultSearch = [];
    console.log(dataEntSto);

    // codigo: "",
    // seleccion: "",
    // ingresado: "",
    // disponible: "",

    dataEntSto.map((data) => {
      if (
        (inputs.almacen.label.includes(data.nomAlm) ||
          inputs.almacen.label.length == 0) &&
        (inputs.provedor.label.includes(data.nomProv) ||
          inputs.provedor.label.length == 0) &&
        (inputs.producto.label.includes(data.nomProd) ||
          inputs.producto.label.length == 0) &&
        (data.codEntSto.includes(inputs.codigo) || inputs.codigo.length == 0) &&
        // inputs.seleccion == data.esSel &&
        (data.canTotEnt.includes(inputs.ingresado) ||
          inputs.ingresado.length == 0) &&
        (data.canTotDis.includes(inputs.disponible) ||
          inputs.disponible.length == 0)
      ) {
        resultSearch.push({ ...data });   
      }
    });
    setdataEntStoTmp(resultSearch);
  }, [inputs, dataEntSto]);

  function filter() {}
  // Funcion para filtrar la data
  const filter2 = (terminoBusqueda, name) => {
    let resultSearch = [];
    dataEntSto.map((data) => {
      if (
        (inputs.almacen.label.includes(data.nomAlm) ||
          inputs.almacen.label.length == 0) &&
        (inputs.provedor.label.includes(data.nomProv) ||
          inputs.provedor.label.length == 0)
      ) {
        resultSearch.push({ ...data });
      }
    });
    switch (name) {
      case "filterProducto":
        resultSearch = dataEntSto.filter((element) => {
          if (
            element.nomProd
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataEntStoTmp(resultSearch);
        break;
      case "filterProveedor":
        console.log(dataEntSto);
        resultSearch = dataEntSto.filter((element) => {
          if (
            element.nomProv
              ?.toString()
              ?.toLowerCase()
              ?.includes(terminoBusqueda?.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataEntStoTmp(resultSearch);
        break;
      case "filterAlmacen":
        resultSearch = dataEntSto.filter((element) => {
          if (
            element.nomAlm
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataEntStoTmp(resultSearch);
        break;
      case "filterCodigo":
        resultSearch = dataEntSto.filter((element) => {
          if (
            element.codEntSto
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataEntStoTmp(resultSearch);
        break;
      case "filterEsSeleccion":
        resultSearch = dataEntSto.filter((element) => {
          if (
            element.esSel
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataEntStoTmp(resultSearch);
        break;
      case "filterCantidadTotal":
        resultSearch = dataEntSto.filter((element) => {
          if (
            element.canTotEnt
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataEntStoTmp(resultSearch);
        break;
      case "filterCantidadDisponible":
        resultSearch = dataEntSto.filter((element) => {
          if (
            element.canTotDis
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataEntStoTmp(resultSearch);
        break;
      case "filterFechaEntrada":
        resultSearch = dataEntSto.filter((element) => {
          let aux = element.fecEntSto.split(" ");
          if (
            aux[0]
              .toString()
              .toLowerCase()
              .includes(terminoBusqueda.toLowerCase())
          ) {
            return true;
          } else {
            return false;
          }
        });
        setdataEntStoTmp(resultSearch);
        break;
      default:
        break;
    }
  };

  // RESET FILTERS
  const resetData = () => {
    setdataEntStoTmp(dataEntSto);
  };

  useEffect(() => {
    obtenerDataEntradaStock();
  }, []);

  return (
    <>
      <div className="container-fluid">
        {/* FILTROS Y EXPORTACION */}
        <div className="row d-flex mt-4">
          <div className="col-6">
            <div className="row">
              <div className="col-4">
                Desde
                <FechaPickerMonth onNewfecEntSto={onChangeDateStartData} />
              </div>
              <div className="col-4">
                Hasta
                <FechaPickerMonth onNewfecEntSto={onChangeDateEndData} />
              </div>
              <div className="col-2 d-flex align-items-end">
                <button onClick={resetData} className="btn btn-success">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-arrow-clockwise"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"
                    />
                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="col-6 d-flex justify-content-end align-items-center">
            <div className="row">
              {/* BOTON AGREGAR MATERIA PRIMA */}
              <div className="col-6">
                <Link
                  to={"/almacen/entradas-stock/crear"}
                  className="btn btn-primary d-inline-flex justify-content-end align-items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-plus-circle-fill me-2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                  </svg>
                  Agregar
                </Link>
              </div>
              <div className="col-3">
                {/* <button className="btn btn-success">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-file-earmark-excel-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64z" />
                  </svg>
                </button> */}
                <ExportExcel exelData={dataEntSto} />
              </div>
              <div className="col-3">
                {/* <button className="btn btn-danger">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-file-earmark-pdf-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.523 12.424c.14-.082.293-.162.459-.238a7.878 7.878 0 0 1-.45.606c-.28.337-.498.516-.635.572a.266.266 0 0 1-.035.012.282.282 0 0 1-.026-.044c-.056-.11-.054-.216.04-.36.106-.165.319-.354.647-.548zm2.455-1.647c-.119.025-.237.05-.356.078a21.148 21.148 0 0 0 .5-1.05 12.045 12.045 0 0 0 .51.858c-.217.032-.436.07-.654.114zm2.525.939a3.881 3.881 0 0 1-.435-.41c.228.005.434.022.612.054.317.057.466.147.518.209a.095.095 0 0 1 .026.064.436.436 0 0 1-.06.2.307.307 0 0 1-.094.124.107.107 0 0 1-.069.015c-.09-.003-.258-.066-.498-.256zM8.278 6.97c-.04.244-.108.524-.2.829a4.86 4.86 0 0 1-.089-.346c-.076-.353-.087-.63-.046-.822.038-.177.11-.248.196-.283a.517.517 0 0 1 .145-.04c.013.03.028.092.032.198.005.122-.007.277-.038.465z" />
                    <path
                      fillRule="evenodd"
                      d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3zM4.165 13.668c.09.18.23.343.438.419.207.075.412.04.58-.03.318-.13.635-.436.926-.786.333-.401.683-.927 1.021-1.51a11.651 11.651 0 0 1 1.997-.406c.3.383.61.713.91.95.28.22.603.403.934.417a.856.856 0 0 0 .51-.138c.155-.101.27-.247.354-.416.09-.181.145-.37.138-.563a.844.844 0 0 0-.2-.518c-.226-.27-.596-.4-.96-.465a5.76 5.76 0 0 0-1.335-.05 10.954 10.954 0 0 1-.98-1.686c.25-.66.437-1.284.52-1.794.036-.218.055-.426.048-.614a1.238 1.238 0 0 0-.127-.538.7.7 0 0 0-.477-.365c-.202-.043-.41 0-.601.077-.377.15-.576.47-.651.823-.073.34-.04.736.046 1.136.088.406.238.848.43 1.295a19.697 19.697 0 0 1-1.062 2.227 7.662 7.662 0 0 0-1.482.645c-.37.22-.699.48-.897.787-.21.326-.275.714-.08 1.103z"
                    />
                  </svg>
                </button> */}
              </div>
            </div>
          </div>
        </div>
        {/* TABLA DE RESULTADOS */}
        <div className="mt-4">
          <Paper>
            <TableContainer>
              <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        color: "rgba(96, 96, 96)",
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    <TableCell align="left" width={160}>
                      <b>Producto</b>
                      <FilterAllProductos
                        onNewInput={onChangeProducto}
                        inputs={inputs}
                      />
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Proveedor</b>
                      <FilterProveedor
                        onNewInput={onChangeProveedor}
                        inputs={inputs}
                      />
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <b>Almacen</b>
                      <FilterAlmacen
                        onNewInput={onChangeAlmacen}
                        inputs={inputs}
                      />
                    </TableCell>
                    <TableCell align="left" width={80}>
                      <b>Codigo</b>
                      <TextField
                        name="codigo"
                        onChange={handleFormFilter}
                        size="small"
                        value={inputs.codigo}
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: "black",
                            background: "white",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={20}>
                      <b>Seleccion</b>
                      <div className="d-flex justify-content-center">
                        <Checkbox
                          {...label}
                          name="seleccion"
                          value={inputs.seleccion}
                          defaultChecked={false}
                          onChange={onChangeSeleccionado}
                        />
                      </div>
                    </TableCell>
                    <TableCell align="left" width={50}>
                      <b>Ingresado</b>
                      <TextField
                        onChange={handleFormFilter}
                        type="number"
                        size="small"
                        name="ingresado"
                        value={inputs.ingresado}
                        InputProps={{
                          style: {
                            color: "black",
                            background: "white",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={50}>
                      <b>Disponible</b>
                      <TextField
                        onChange={handleFormFilter}
                        type="number"
                        size="small"
                        name="disponible"
                        value={inputs.disponible}
                        InputProps={{
                          style: {
                            color: "black",
                            background: "white",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Fecha de entrada</b>
                      {/**
                       <FechaPickerDay onNewfecEntSto={onChangeDate} />
                      */}
                    </TableCell>
                    <TableCell align="left" width={50}>
                      <b>Acciones</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataEntStoTmp
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.nomProd}
                        </TableCell>
                        <TableCell align="left">{row.nomProv}</TableCell>
                        <TableCell align="left">{row.nomAlm}</TableCell>
                        <TableCell align="left">{row.codEntSto}</TableCell>
                        <TableCell align="center">
                          {row.esSel === 1 ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              color="green"
                              className="bi bi-check-circle-fill"
                              viewBox="0 0 16 16"
                            >
                              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              color="red"
                              fill="currentColor"
                              className="bi bi-x-circle-fill"
                              viewBox="0 0 16 16"
                            >
                              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
                            </svg>
                          )}
                        </TableCell>
                        <TableCell align="left">{row.canTotEnt}</TableCell>
                        <TableCell align="left">{row.canTotDis}</TableCell>
                        <TableCell align="left">{row.fecEntSto}</TableCell>
                        <TableCell align="left">
                          <div className="btn-toolbar">
                            <Link
                              // onClick={() => {
                              //   showFormulaDetalle(i);
                              // }}
                              to={`/almacen/entradas-stock/view/${row.id}`}
                              className="btn btn-primary me-2 btn"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-eye-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                              </svg>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* PAGINACION DE LA TABLA */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={dataEntStoTmp.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </div>
      </div>

      {/* FEEDBACK */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={feedbackDelete}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={style_message}
          sx={{ width: "100%" }}
        >
          {feedback_description_error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ListEntradaStock;
