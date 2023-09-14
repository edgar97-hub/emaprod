import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import FechaPicker from "../../../components/Fechas/FechaPicker";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { getProduccionLoteWithDevolucionesById } from "./../../../produccion/helpers/produccion_lote/getProduccionLoteWithDevolucionesById";
import { RowDetalleDevolucionLoteProduccion } from "./../../components/componentes-devoluciones/RowDetalleDevolucionLoteProduccion";
import { FilterAllProductos } from "./../../../components/ReferencialesFilters/Producto/FilterAllProductos";
import { TextField } from "@mui/material";
import { getMateriaPrimaById } from "./../../../helpers/Referenciales/producto/getMateriaPrimaById";
import { RowDetalleDevolucionLoteProduccionEdit } from "../../components/componentes-devoluciones/RowDetalleDevolucionLoteProduccionEdit";
import { createDevolucionesLoteProduccion } from "./../../helpers/devoluciones-lote-produccion/createDevolucionesLoteProduccion";
import { getProduccionWhitProductosFinales } from "./../../helpers/producto-produccion/getProduccionWhitProductosFinales";
import { getFormulaProductoDetalleByProducto } from "../../../../src/produccion/helpers/formula_producto/getFormulaProductoDetalleByProducto";
import { _parseInt } from "../../../utils/functions/FormatDate";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const AgregarDevolucion = () => {
  const location = useLocation();
  const { idLotProdc = "" } = queryString.parse(location.search);

  // ESTADOS PARA LA DATA DE DEVOLUCIONES
  const [devolucionesProduccionLote, setdevolucionesProduccionLote] = useState({
    id: 0,
    canLotProd: 0,
    codLotProd: "",
    desEstPro: "",
    desProdTip: "",
    fecVenLotProd: "",
    idProdEst: 0,
    idProdTip: 0,
    idProdt: 0,
    klgLotProd: "",
    nomProd: "",
    detDev: [],
  });

  const {
    id,
    canLotProd,
    codLotProd,
    desEstPro,
    desProdTip,
    fecVenLotProd,
    klgLotProd,
    nomProd,
    detDev,
    numop,
  } = devolucionesProduccionLote;

  const [detalleProductosDevueltos, setdetalleProductosDevueltos] = useState(
    []
  );

  // STATES PARA AGREGAR PRODUCTOS
  const [productoDevuelto, setproductoDevuelto] = useState({
    idProdDev: 0,
    cantidadDevuelta: 0.0,
    idProdDevMot: 0,
  });

  const { idProdDev, cantidadDevuelta } = productoDevuelto;

  // ************ ESTADO PARA CONTROLAR EL FEEDBACK **************
  const [feedbackCreate, setfeedbackCreate] = useState(false);
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: "",
    feedback_description_error: "",
  });
  const { style_message, feedback_description_error } = feedbackMessages;

  // MANEJADORES DE FEEDBACK
  const handleClickFeeback = () => {
    setfeedbackCreate(true);
  };

  const handleCloseFeedback = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setfeedbackCreate(false);
  };

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate();
  const onNavigateBack = () => {
    navigate(-1);
  };

  const [disableButton, setdisableButton] = useState(false);

  const onAddProductoDevuelto = (value) => {
    setproductoDevuelto({
      ...productoDevuelto,
      idProdDev: value.id,
    });
  };

  // MANEJADOR DE MOTIVO DE DEVOLUCION
  const onAddMotivoDevolucion = (value) => {
    setproductoDevuelto({
      ...productoDevuelto,
      idProdDevMot: value.id,
    });
  };

  // MANEJADOR DE CANTIDAD
  const handledFormCantidadDevuelta = ({ target }) => {
    const { name, value } = target;
    setproductoDevuelto({
      ...productoDevuelto,
      [name]: value,
    });
  };

  const handleAddProductoDevuelto = async (e) => {
    e.preventDefault();
    if (idProdDev !== 0 && cantidadDevuelta > 0.0) {
      const itemFound = detalleProductosDevueltos.find(
        (element) => element.idProdt === idProdDev
      );

      //return

      if (itemFound) {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error: "Ya se agrego este producto al detalle",
        });
        handleClickFeeback();
      } else {
        const resultPeticion = await getMateriaPrimaById(idProdDev);
        //console.log(resultPeticion)

        const { message_error, description_error, result } = resultPeticion;
        if (message_error.length === 0) {
          const {
            id: idProd,
            codProd,
            desCla,
            desSubCla,
            nomProd,
            simMed,
            idMed,
          } = result[0];
          // generamos nuestro detalle
          const detalle = {
            idProdc: id, // lote de produccion asociado
            idProdt: idProd, // producto
            idProdDevMot: 1, // motivo de devolucion
            codProd: codProd, // codigo de producto
            desCla: desCla, // clase del producto
            desSubCla: desSubCla, // subclase del producto
            nomProd: nomProd, // nombre del producto
            idMed: idMed,
            simMed: simMed, // medida del producto
            canProdDev: cantidadDevuelta, // cantidad devuelta
          };
          //console.log(detalle);

          // seteamos el detalle
          const dataDetalle = [...detalleProductosDevueltos, detalle];
          setdetalleProductosDevueltos(dataDetalle);
        } else {
          setfeedbackMessages({
            style_message: "error",
            feedback_description_error: description_error,
          });
          handleClickFeeback();
        }
      }
    } else {
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: "Asegurese de llenar los datos requeridos",
      });
      handleClickFeeback();
    }
  };

  // ACCION PARA EDITAR CAMPOS EN DETALLE DE PRODUCTO DEVUELTO
  const handleChangeInputProductoDevuelto = async ({ target }, idItem) => {
    const { value } = target;
    const editFormDetalle = detalleProductosDevueltos.map((element) => {
      if (element.idProdt === idItem) {
        return {
          ...element,
          canProdDev: value,
        };
      } else {
        return element;
      }
    });
    setdetalleProductosDevueltos(editFormDetalle);
  };

  // ACCION PARA CAMBIAR EL MOTIVO DEL DETALLE DE UN PRODUCTO DEVUELTO
  const handleChangeMotivoDevolucionProductoDevuelto = async (
    idProdDevMot,
    idItem
  ) => {
    const editFormDetalle = detalleProductosDevueltos.map((element) => {
      if (element.idProdt === idItem) {
        return {
          ...element,
          idProdDevMot: idProdDevMot,
        };
      } else {
        return element;
      }
    });

    setdetalleProductosDevueltos(editFormDetalle);
  };

  // ACCION PARA ELIMINA DEL DETALLE UN PRODUCTO DEVUELTO
  const handleDeleteProductoDevuelto = async (idItem) => {
    console.log(idItem);
    // filtramos el elemento eliminado
    const dataDetalleProductosDevueltos = detalleProductosDevueltos.filter(
      (element) => {
        if (element.idProdt !== idItem) {
          return true;
        } else {
          return false;
        }
      }
    );

    // establecemos el detalle
    setdetalleProductosDevueltos(dataDetalleProductosDevueltos);
  };

  async function handleAddProductoProduccionLote(
    detalleRequisiciones,
    idProdFin,
    cantidadDeProducto
  ) {
    // var productoLoteProduccion = { idProdFin : 1}
    if (idProdFin !== 0) {
      const resultPeticion = await getFormulaProductoDetalleByProducto(
        idProdFin
      );
      const { message_error, description_error, result } = resultPeticion;
      //console.log(result);
      //return

      if (message_error.length === 0) {
        const { idProdFin, nomProd, simMed, reqDet } = result[0];
        let equivalenteKilogramos = 0;
        //buscamos la requisicion de materia prima
        //console.log("Complete Element -> ",reqDet);

        reqDet.forEach((element) => {
          if (element.idAre === 2 || element.idAre === 7) {
            equivalenteKilogramos = parseFloat(element.canForProDet);
            //console.log("elemento are:", element.desAre);
            //console.log("elemento value: ", equivalenteKilogramos);
          }
        });

        let cantidadUnidades = 0;
        let cantidadklgLote = 0;
        //if (parseFloat(productoLoteProduccion.cantidadDeLote) > 0.0) {

        //cantidadUnidades =
        //  parseFloat(productoLoteProduccion.cantidadDeLote) /
        //  equivalenteKilogramos;
        //cantidadklgLote = parseFloat(
        //  productoLoteProduccion.cantidadDeLote
        // ).toFixed(2);

        //} else {
        cantidadUnidades = Math.round(parseFloat(cantidadDeProducto));
        cantidadklgLote = parseFloat(
          (equivalenteKilogramos * parseFloat(cantidadDeProducto)).toFixed(2)
        );

        //const cantidadTotalDelLoteProduccion = parseFloat(
        //  klgTotalLoteProduccion + cantidadklgLote
        //);

        //const cantidadTotalUnidadesDelLoteProduccion = parseInt(
        //  totalUnidadesLoteProduccion + cantidadUnidades
        //);

        //setcantidadLoteProduccion({
        //  ...cantidadLoteProduccion,
        //  klgTotalLoteProduccion: cantidadTotalDelLoteProduccion,
        //  totalUnidadesLoteProduccion:
        //    cantidadTotalUnidadesDelLoteProduccion,
        //});

        //const nextIndex = produccionLote.prodDetProdc.length + 1;
        //const detalleProductosFinales = [
        //  ...produccionLote.prodDetProdc,
        //  {
        //    idProdFin,
        //    index: nextIndex,
        //    nomProd,
        //    simMed,
        //    canUnd: cantidadUnidades,
        //    canKlg: cantidadklgLote,
        //  },
        //];

        reqDet.forEach((element) => {
          if (element.idAre === 5 || element.idAre === 6) {
            detalleRequisiciones.push({
              ...element,
              //indexProdFin: nextIndex,
              idProdFin: idProdFin,
              idProdAgrMot: 1,
              cantidadUnidades,
              cantidadklgLote,
              canReqProdLot: parseFloat(
                (parseFloat(element.canForProDet) * cantidadUnidades).toFixed(2)
              ),
            });
          } else {
            return;
          }
        });

        //console.log(detalleRequisicionesFormula)
        detalleRequisiciones.map((obj) => {
          obj.canReqProdLot = _parseInt(obj);
        });
      }
    }

    return detalleRequisiciones;
  }

  async function getProductToDev(idLotProdc) {
    const resultPeticion = await getProduccionWhitProductosFinales(idLotProdc);
    const { message_error, description_error, result } = resultPeticion;
    var products = result[0].proFinProdDet;
    //var productsAutocomplete = products.filter((obj) => !obj.isAgregation);
    //console.log(result[0])

    var copyProducts = products.reduce((accumulator, currentValue) => {
      if (accumulator.some((obj) => obj.idProdt === currentValue.idProdt)) {
        accumulator.map((obj) => {
          if (obj.idProdt === currentValue.idProdt) {
            obj.canTotProgProdFin =
              parseFloat(obj.canTotProgProdFin) +
              parseFloat(currentValue.canTotProgProdFin);
            obj.canTotProgProdFin = parseFloat(obj.canTotProgProdFin).toFixed(
              2
            );

            obj.canTotIngProdFin =
              parseFloat(obj.canTotIngProdFin) +
              parseFloat(currentValue.canTotIngProdFin);
            obj.canTotIngProdFin = parseFloat(obj.canTotIngProdFin).toFixed(2);
            currentValue.total = obj.canTotProgProdFin;

            var ss =
              parseFloat(obj.canTotProgProdFin) -
              parseFloat(obj.canTotIngProdFin);

            if (ss > 0) {
              obj.cantDev =
                parseFloat(obj.canTotProgProdFin) -
                parseFloat(obj.canTotIngProdFin);
              obj.cantDev = obj.cantDev.toFixed(2);
            } else {
              obj.cantDev = 0;
            }
          }
        });
      } else {
        currentValue.cantDev =
          parseFloat(currentValue.canTotProgProdFin) -
          parseFloat(currentValue.canTotIngProdFin);
        accumulator.push(currentValue);
      }
      return accumulator;
    }, []);

    return copyProducts;
  }

  function getDev() {}
  const traerDatosProduccionLoteWithDevoluciones = async () => {
    if (idLotProdc.length !== 0) {
      const resultPeticion = await getProduccionLoteWithDevolucionesById(
        idLotProdc
      );
      var productos = await getProductToDev(idLotProdc);
      console.log(resultPeticion);

      //canProdDev: "1"
      //codProd: null
      //desCla: "Envase y Embalaje"
      //desSubCla: undefined
      //idMed: 7
      //idProdDevMot: 1
      //idProdc: 44
      //idProdt: 244
      //nomProd: "DISPLAY - EL VERDE SAZONADOR MOLIDO GIGANTE BATAN X 42 SBS"
      //simMed: "UND"

      var devoluciones = [];
      await Promise.all(
        productos.map(async (obj) => {
          // if(obj.id == 69){
          var nomProdFin = obj.nomProd;
          var detalleRequisiciones = [];
          detalleRequisiciones = await handleAddProductoProduccionLote(
            detalleRequisiciones,
            obj.idProdt,
            obj.cantDev
          );
          //console.log(detalleRequisiciones)
          detalleRequisiciones.map((obj) => {
            devoluciones.push({
              nomProdFin: nomProdFin,
              canProdDev: obj.canReqProdLot,
              codProd: "",
              desCla: obj.desAre,
              desSubCla: "",
              idMed: 7,
              idProdDevMot: 1,
              idProdc: idLotProdc,
              idProdt: obj.idProd,
              nomProd: obj.nomProd,
              simMed: obj.simMed,
            });
          });

          //}
        })
      );

      var devoluciones = devoluciones.reduce((accumulator, currentValue) => {
        if (accumulator.some((obj) => obj.idProdt == currentValue.idProdt)) {
          accumulator.map((obj) => {
            if (obj.idProdt == currentValue.idProdt) {
              obj.canProdDev =
                parseFloat(obj.canProdDev) +
                parseFloat(currentValue.canProdDev);
              obj.canProdDev = parseFloat(obj.canProdDev).toFixed(2);
            }
          });
        } else {
          currentValue.canProdDev = parseFloat(currentValue.canProdDev).toFixed(
            2
          );
          accumulator.push(currentValue);
        }
        return accumulator;
      }, []);

      const { message_error, description_error, result } = resultPeticion;
      // console.log( result[0])

      result[0].detDev = result[0].detDev.reduce(
        (accumulator, currentValue) => {
          if (accumulator.some((obj) => obj.idProdt == currentValue.idProdt)) {
            accumulator.map((obj) => {
              if (obj.idProdt == currentValue.idProdt) {
                obj.canProdDev =
                  parseFloat(obj.canProdDev) +
                  parseFloat(currentValue.canProdDev);
                obj.canProdDev = parseFloat(obj.canProdDev).toFixed(2);
              }
            });
          } else {
            currentValue.canProdDev = parseFloat(
              currentValue.canProdDev
            ).toFixed(2);
            accumulator.push(currentValue);
          }
          return accumulator;
        },
        []
      );

      var total = 0;
      result[0].detDev.map((obj) => {
        total = parseFloat(total) + parseFloat(obj.canProdDev);
        obj.acumulado = total;
        function getVal() {
          var cantDev = 0;
          devoluciones.map((prod) => {
            if (prod.idProdt == obj.idProdt) {
              obj.cantDev = prod.canProdDev;
            }
          });
          return cantDev;
        }
        getVal();
      });

      devoluciones.map((obj) => {
        result[0].detDev.map((prod) => {
          if (prod.idProdt == obj.idProdt) {
            obj.canProdDev = (
              parseFloat(obj.canProdDev) - parseFloat(prod.canProdDev)
            ).toFixed(2);
          }
        });
      });
      console.log(productos);

      console.log(result[0].detDev);

      const dataDetalle = [...detalleProductosDevueltos, ...devoluciones];
      setdetalleProductosDevueltos(dataDetalle);
      // console.log(devoluciones)

      if (message_error.length === 0) {
        setdevolucionesProduccionLote(result[0]);
      } else {
        setfeedbackMessages({
          style_message: "error",
          feedback_description_error: description_error,
        });
        handleClickFeeback();
      }
    }
  };

  const crearDevolucionesLoteProduccion = async () => {
    var productos = detalleProductosDevueltos?.filter(
      (obj) => parseFloat(obj.canProdDev) > 0
    );
    //console.log(productos)
    //return
    const resultPeticion = await createDevolucionesLoteProduccion(productos);

    //console.log(resultPeticion);
    //return

    const { message_error, description_error } = resultPeticion;

    if (message_error.length === 0) {
      // regresamos a la anterior vista
      onNavigateBack();
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
    setdisableButton(false);
  };

  const handleSubmitDevolucionesLoteProduccion = (e) => {
    e.preventDefault();
    if (detalleProductosDevueltos.length === 0) {
      // MANEJAMOS FORMULARIOS INCOMPLETOS
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: "No has agregado items al detalle",
      });
      handleClickFeeback();
    } else {
      const validMotivoDevolucion = detalleProductosDevueltos.find(
        (element) => element.idProdDevMot === 0
      );

      if (validMotivoDevolucion) {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error:
            "Asegurese de asignar el motivo de la devolucion para cada item",
        });
        handleClickFeeback();
      } else {
        setdisableButton(true);
        // crear devolucion
        crearDevolucionesLoteProduccion();
      }
    }
  };

  useEffect(() => {
    traerDatosProduccionLoteWithDevoluciones();
  }, []);

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Registrar devoluciones</h1>
        <div className="row mt-4 mx-4">
          {/* Datos de produccion */}
          <div className="card d-flex">
            <h6 className="card-header">Datos de produccion</h6>
            <div className="card-body">
              <div className="mb-3 row">
                {/* NUMERO DE LOTE */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Numero de Lote</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={codLotProd}
                    className="form-control"
                  />
                </div>

                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Numero OP</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={numop}
                    className="form-control"
                  />
                </div>

                {/* PRODUCTO */}
                <div className="col-md-4 me-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Producto</b>
                  </label>
                  <input
                    disabled={true}
                    type="text"
                    value={nomProd}
                    className="form-control"
                  />
                </div>
                {/* KILOGRAMOS DE LOTE */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Peso de Lote</b>
                  </label>
                  <input
                    type="number"
                    disabled={true}
                    value={klgLotProd}
                    className="form-control"
                  />
                </div>
                {/* CANTIDAD DE LOTE */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad</b>
                  </label>
                  <input
                    type="number"
                    disabled={true}
                    value={canLotProd}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="mb-3 row d-flex align-items-center">
                {/* TIPO DE PRODUCCION */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Tipo de produccion</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={desProdTip}
                    className="form-control"
                  />
                </div>
                {/* ESTADO DE PRODUCCION */}
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Estado de produccion</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={desEstPro}
                    className="form-control"
                  />
                </div>
                {/* FECHA DE VENCIMIENTO */}
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha vencimiento lote</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={fecVenLotProd}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DEVOLUCIONES ASOCIADAS AL LOTE DE PRODUCCION */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Devoluciones registradas</h6>
            <div className="card-body">
              <div className="mb-3 row">
                <Paper>
                  <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow
                          sx={{
                            "& th": {
                              color: "rgba(96, 96, 96)",
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                        >
                          <TableCell align="left" width={200}>
                            <b>Nombre</b>
                          </TableCell>
                          <TableCell align="left" width={20}>
                            <b>U.M</b>
                          </TableCell>
                          <TableCell align="left" width={150}>
                            <b>Almacen destino</b>
                          </TableCell>
                          <TableCell align="left" width={150}>
                            <b>Motivo devolucion</b>
                          </TableCell>
                          <TableCell align="left" width={20}>
                            <b>Cantidad devuelta</b>
                          </TableCell>

                          {/**
                           <TableCell align="left" width={20}>
                            <b>Acumulado</b>
                          </TableCell>
                          */}

                          <TableCell align="left" width={20}>
                            <b>Cantidad estimada a devolver</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detDev.map((row, i) => (
                          <RowDetalleDevolucionLoteProduccion
                            key={row.id}
                            detalle={row}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </div>
            </div>
          </div>

          {/* AGREGAR PRODUCTOS AL DETALLE  */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Detalle de devoluciones</h6>
            <div className="card-body">
              <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR PRODUCTO */}
                <div className="col-md-5">
                  <label className="form-label">Producto devuelto</label>
                  <FilterAllProductos
                    onNewInput={onAddProductoDevuelto}
                    productos={devolucionesProduccionLote.requisiciones}
                  />
                </div>
                {/* CANTIDAD DE PRRODUCTOS FINALES ESPERADOS */}
                <div className="col-md-2">
                  <label className="form-label">Cantidad producto</label>
                  <TextField
                    type="number"
                    autoComplete="off"
                    size="small"
                    name="cantidadDevuelta"
                    onChange={handledFormCantidadDevuelta}
                  />
                </div>
                {/* BOTON AGREGAR PRODUCTO */}
                <div className="col-md-3 d-flex justify-content-end align-self-center ms-auto">
                  <button
                    onClick={handleAddProductoDevuelto}
                    className="btn btn-primary"
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
                  </button>
                </div>
              </form>
              <div>
                <Paper>
                  <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow
                          sx={{
                            "& th": {
                              color: "rgba(96, 96, 96)",
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                        >
                          {/**
                            <TableCell align="left" width={20}>
                            <b>Prod Fin</b>
                          </TableCell>
                          */}
                          <TableCell align="left" width={200}>
                            <b>Nombre</b>
                          </TableCell>
                          <TableCell align="left" width={100}>
                            <b>Clase</b>
                          </TableCell>
                          <TableCell align="left" width={20}>
                            <b>U.M</b>
                          </TableCell>
                          <TableCell align="left" width={170}>
                            <b>Motivo devolucion</b>
                          </TableCell>
                          <TableCell align="left" width={120}>
                            <b>Cantidad</b>
                          </TableCell>

                          <TableCell align="left" width={120}>
                            <b>Acciones</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detalleProductosDevueltos.map((row, i) => {
                          return (
                            <RowDetalleDevolucionLoteProduccionEdit
                              key={row.idProdt}
                              detalle={row}
                              onChangeInputDetalle={
                                handleChangeInputProductoDevuelto
                              }
                              onChangeMotivoDevolucion={
                                handleChangeMotivoDevolucionProductoDevuelto
                              }
                              onDeleteItemDetalle={handleDeleteProductoDevuelto}
                            />
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </div>
            </div>
          </div>
          {/* BOTONES DE CANCELAR Y GUARDAR */}
          <div className="btn-toolbar mt-4">
            <button
              type="button"
              onClick={onNavigateBack}
              className="btn btn-secondary me-2"
            >
              Volver
            </button>
            <button
              type="submit"
              //disabled={disableButton}
              onClick={handleSubmitDevolucionesLoteProduccion}
              className="btn btn-primary"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
      {/* FEEDBACK AGREGAR MATERIA PRIMA */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={feedbackCreate}
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
