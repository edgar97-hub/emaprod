import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FilterTipoProduccion } from "./../../../components/ReferencialesFilters/TipoProduccion/FilterTipoProduccion";
// IMPORTACIONES PARA TABLE MUI
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import FechaPicker from "../../../components/Fechas/FechaPicker";
import { FilterProductoProduccion } from "./../../../components/ReferencialesFilters/Producto/FilterProductoProduccion";
import { Checkbox, TextField, Typography } from "@mui/material";
import FechaPickerYear from "./../../../components/Fechas/FechaPickerYear";
import { FilterAllProductos } from "./../../../components/ReferencialesFilters/Producto/FilterAllProductos";
import { getFormulaProductoDetalleByProducto } from "../../helpers/formula_producto/getFormulaProductoDetalleByProducto";
import { RowEditDetalleProductosFinales } from "./../../components/componentes-lote-produccion/RowEditDetalleProductosFinales";
import { RowEditDetalleRequisicionProduccion } from "../../components/componentes-lote-produccion/RowEditDetalleRequisicionProduccion";
import { getMateriaPrimaById } from "./../../../helpers/Referenciales/producto/getMateriaPrimaById";
import { FilterAreaEncargada } from "./../../components/FilterAreaEncargada";
import { createProduccionLoteWithRequisiciones } from "./../../helpers/produccion_lote/createProduccionLoteWithRequisiciones";

// IMPROTACIONES PARA LINEA DE PROGRESION
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { FilterPresentacionFinal } from "../../../components/ReferencialesFilters/Producto/FilterPresentacionFinal";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const CrearProduccionLote = () => {

  function onValidate(e) {
    var t = e.value;
    e.value = t.indexOf(".") >= 0 ? t.slice(0, t.indexOf(".") + 3) : t;
    return e.value
  }

  function _parseInt(str) {
    if (str.canReqProdLot) {
      str.canReqDet = str.canReqProdLot;
    }

    if (str.canTotProgProdFin) {
      str.canReqDet = str.canTotProgProdFin;
    }
    str.canReqDet = parseFloat(str.canReqDet).toFixed(2);
    let index = str.canReqDet.toString().indexOf(".");
    let result = str.canReqDet.toString().substring(index + 1);
    //console.log("index: ",index, "result: ", result)
    let val =
      parseInt(result) >= 1 && str.simMed !== "KGM"
        ? Math.trunc(str.canReqDet) + 1
        : str.canReqDet;
    return val;
  }


  // ESTADO PARA LINEA DE PROGRESO
  const [showLinearProgress, setshowLinearProgress] = useState(false);

  // ESTADO DE KLG DISPONIBLES PARA LOTE PRODUCCION
  const [cantidadLoteProduccion, setcantidadLoteProduccion] = useState({
    totalUnidadesLoteProduccion: 0,
    klgTotalLoteProduccion: 0,
    klgDisponibleLoteProduccion: 0,
  });

  const {
    totalUnidadesLoteProduccion,
    klgTotalLoteProduccion,
    klgDisponibleLoteProduccion,
  } = cantidadLoteProduccion;

  // ESTADO PARA LOS DATOS DE PRODUCCION LOTE
  const [produccionLote, setproduccionLote] = useState({
    idProdt: 0, // producto intermedio
    idProdTip: 0, // tipo de produccion
    codLotProd: "", // codigo de lote
    klgLotProd: 1, // kilogramos del lote
    canLotProd: 1, // cantidad
    obsProd: "", // observaciones
    fecProdIniProg: "", // fecha de inicio programado
    fecProdFinProg: "", // fecha de fin programado
    fecVenLotProd: "", // fecha de vencimiento del lote
    reqDetProdc: [], // detalle requisicion de lote
    prodDetProdc: [], // detalle de productos finales esperados
  });

  const {
    idProdt,
    idProdTip,
    codLotProd,
    klgLotProd,
    canLotProd,
    obsProd,
    fecProdIniProg,
    fecProdFinProg,
    fecVenLotProd,
    reqDetProdc,
    prodDetProdc,
  } = produccionLote;

  // useeffect change cantidad lote produccion
  useEffect(() => {
    setcantidadLoteProduccion({
      ...cantidadLoteProduccion,
      klgLotProd: parseFloat(klgLotProd),
      klgDisponibleLoteProduccion: parseFloat(klgLotProd) * parseFloat(canLotProd),
    });
  }, [klgLotProd, canLotProd]);

  // STATE PARA CONTROLAR LA AGREGACION DE PRODUCTOS FINALES DEL LOTE
  const [productoLoteProduccion, setproductoLoteProduccion] = useState({
    idProdFin: 0,
    cantidadDeLote: 0.0,
    cantidadDeProducto: 0,
  });

  const { idProdFin, cantidadDeLote, cantidadDeProducto } =
    productoLoteProduccion;

  // STATE PARA CONTROLAR LOS PRODUCTOS ADITIVOS A LAS REQUISICIONES DEL LOTE
  const [productoRequisicionProduccion, setproductoRequisicionProduccion] =
    useState({
      idProdReq: 0,
      cantidadRequisicion: 0,
      idAre: 0,
      idAlm: 0,
    });

  const { idProdReq, cantidadRequisicion, idAre, idAlm } =
    productoRequisicionProduccion;

  // ESTADO PARA CONTROLAR EL FEEDBACK
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

  // ESTADO PARA BOTON CREAR
  const [disableButton, setdisableButton] = useState(false);

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate();
  const onNavigateBack = () => {
    navigate(-1);
  };

  // ******** DATOS DEL LOTE DE PRODUCCION ********
  // CONTROLADOR DE FORMULARIO
  const handledForm = ({ target }) => {
    const { name, value } = target;
    setproduccionLote({
      ...produccionLote,
      [name]: value,
    });
  };

  // EVENTO DE PRODUCTO
  const onAddProductoProduccion = ({ id }) => {
    setproduccionLote({
      ...produccionLote,
      idProdt: id,
    });
  };

  // EVENTO DE TIPO DE PRODUCCION
  const onAddTipoProduccion = ({ id, cod }) => {
    setproduccionLote({
      ...produccionLote,
      idProdTip: id,
      codTipProd: cod,
    });
  };

  // ENVENTO DE FECHA INICIO PROGRAMADO
  const onAddFechaInicioProgramado = (newFecha) => {
    setproduccionLote({ ...produccionLote, fecProdIniProg: newFecha });
  };
  // EVENTO DE FECHA FIN PROGRAMADO
  const onAddFechaFinProgramado = (newFecha) => {
    setproduccionLote({ ...produccionLote, fecProdFinProg: newFecha });
  };

  // EVENTO DE FECHA VENCIMIENTO LOTE
  const onAddFechaVencimientoLoteProduccion = (newFecha) => {
    setproduccionLote({ ...produccionLote, fecVenLotProd: newFecha });
  };

  // ******** EVENTOS DEL FILTRO DE PRODUCTO *********

  const onAddProductoFinalLoteProduccion = (value) => {
    setproductoLoteProduccion({
      ...productoLoteProduccion,
      idProdFin: value.id,
    });
  };

  const handleInputsProductosFinales = ({ target }) => {
    const { value, name } = target;

    setproductoLoteProduccion({
      ...productoLoteProduccion,
      [name]: value,
    });
  };

  // ******* MANEJADORES PARA EL ARREGLO DE REQUISICIONES DE LOTE DE PRODUCCION *******
  // MANEJADOR DE PRODUCTO
  const onAddProductoRequisicionLoteProduccion = (value) => {
    setproductoRequisicionProduccion({
      ...productoRequisicionProduccion,
      idProdReq: value.id,
    });
  };
  // MANEJADOR DE INPUTS REQUISICION
  const handleInputsProductosRequisicion = ({ target }) => {
    const { value, name } = target;
    setproductoRequisicionProduccion({
      ...productoRequisicionProduccion,
      [name]: value,
    });
  };

  // MAJEADOR PARA AGREGAR EL AREA AL FILTRO
  const handleAreaIdProductoRequisicion = ({ id }) => {
    setproductoRequisicionProduccion({
      ...productoRequisicionProduccion,
      idAre: id,
    });
  };

  // añadir un detalle
  const handleAddProductoRequisicionLote = async (e) => {
    e.preventDefault();

    if (idProdReq !== 0 && idAre !== 0 && cantidadRequisicion > 0.0) {
      const itemFound = reqDetProdc.find(
        (element) => element.idProd === idProdReq
      );
      if (itemFound) {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error:
            "Ya se agrego este producto a la requisicion",
        });
        handleClickFeeback();
      } else {
        // solo permitir agregaciones de area embalaje y encajonado
        if (idAre === 5 || idAre === 6) {
          const resultPeticion = await getMateriaPrimaById(idProdReq);
          const { message_error, description_error, result } = resultPeticion;

          if (message_error.length === 0) {
            const { id, codProd, desCla, desSubCla, nomProd, simMed } =
              result[0];
            // generamos nuestro detalle de formula
            const detalleFormulaProducto = {
              idProd: id,
              idAre: idAre, // area
              idAlm: 1, // almacen de orgien
              nomAlm: "Almacen Principal",
              codProd: codProd,
              desCla: desCla,
              desSubCla: desSubCla,
              nomProd: nomProd,
              simMed: simMed,
              canForProDet: 1,
              canReqProdLot: cantidadRequisicion, // cantidad
            };

            // seteamos el detalle en general de la formula
            const dataDetalle = [...reqDetProdc, detalleFormulaProducto];

            setproduccionLote({
              ...produccionLote,
              reqDetProdc: dataDetalle,
            });
          } else {
            setfeedbackMessages({
              style_message: "error",
              feedback_description_error: description_error,
            });
            handleClickFeeback();
          }
        } else {
          setfeedbackMessages({
            style_message: "warning",
            feedback_description_error:
              "Solo se adminte areas de envasado y encajonado",
          });
          handleClickFeeback();
        }
      }
    } else {
      let advertenciaDetalleRequisicion = "";
      if (idProdReq === 0) {
        advertenciaDetalleRequisicion +=
          "Debe elegir un envase, embalaje u otro material para agregar el detalle\n";
      }
      if (idAre === 0) {
        advertenciaDetalleRequisicion +=
          "Debe asignar un area para agregar el detalle\n";
      }
      if (cantidadRequisicion <= 0) {
        advertenciaDetalleRequisicion +=
          "Debe proporcionar una cantidad mayor a 0 para agregar el detalle\n";
      }

      // mostramos el feedback
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: advertenciaDetalleRequisicion,
      });
      handleClickFeeback();
    }
  };

  // eliminar un detalle
  const handleDeleteItemRequisicionProduccion = (idItem, index) => {
    // filtramos el elemento eliminado
    const dataDetalleRequisicionProduccion = reqDetProdc.filter((element) => {
      if (element.idProd === idItem && element.indexProdFin === index) {
        return false;
      } else {
        return true;
      }
    });

    // lo insertamos en el detalle
    setproduccionLote({
      ...produccionLote,
      reqDetProdc: dataDetalleRequisicionProduccion,
    });
  };

  // editar un detalle
  const handleEditItemRequisicionProduccion = ({ target }, idItem, index) => {
    const { value } = target;
    console.log("test " , value)
    const editFormDetalle = reqDetProdc.map((element) => {
      if (element.idProd === idItem && element.indexProdFin === index) {
        return {
          ...element,
          canReqProdLot: value,
        };
      } else {
        return element;
      }
    });
    setproduccionLote({
      ...produccionLote,
      reqDetProdc: editFormDetalle,
    });
  };

  // *********** MANEJADOR DE ACCIONES ARREGLO DE PRODUCTOS FINALES O SUBPRODUCTOS **********
  const handleAddProductoProduccionLote = async (e) => {
    e.preventDefault();

    if (idProdFin !== 0 && (cantidadDeLote > 0.0 || cantidadDeProducto > 0)) {

      const itemFound = prodDetProdc.find(
        (element) => element.idProdFin === idProdFin
      );

      if (itemFound) {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error: "Ya se agrego este producto a la orden",
        });
        handleClickFeeback();
        
      } else {
        //console.log("idPRODFIN: ",idProdFin);
        // buscamos su formulación de producto
        const resultPeticion = await getFormulaProductoDetalleByProducto(
          idProdFin
        );

        const { message_error, description_error, result } = resultPeticion;
        console.log(idProdFin)
        //return


        if (message_error.length === 0) {
          const { idProdFin, nomProd, simMed, reqDet } = result[0]; // obtenemos la requisicion
          let equivalenteKilogramos = 0;
          // buscamos la requisicion de materia prima
          console.log("Complete Element -> ",reqDet);

          //infinity en comino comino molido
          //
          
          reqDet.forEach((element) => {
            if (element.idAre === 2 || element.idAre === 7 ) {
              equivalenteKilogramos = parseFloat(element.canForProDet);
              console.log("elemento are:", element.desAre);
              console.log("elemento value: ", equivalenteKilogramos);
            }
          });

          // si se ingreso la cantidad de unidades esperadas
          let cantidadUnidades = 0;
          let cantidadklgLote = 0;
          if (parseFloat(cantidadDeLote) > 0.00000) {
            // obtenemos el numero de unidades que podemos obtener (redondeado al entero)
            //**********************************************************************************************no esta jalando bien cantidad de lote******************* */
            console.log("OP:: ",parseFloat(cantidadDeLote),"  /",equivalenteKilogramos);

            cantidadUnidades = 
              parseFloat(cantidadDeLote) /equivalenteKilogramos;
            
           cantidadklgLote = parseFloat(parseFloat(cantidadDeLote).toFixed(5)); // redondeado a las centenas
          } else {
            // simplemente le asignamos el valor de las unidades requeridas
            cantidadUnidades = Math.round(parseFloat(cantidadDeProducto));
            cantidadklgLote = parseFloat(
              (equivalenteKilogramos * parseFloat(cantidadDeProducto)).toFixed(
                5
              )
            );
          }

          // verificamos que la cantidad de klg no sobrepase lo permitido
          const cantidadTotalDelLoteProduccion = parseFloat(
            klgTotalLoteProduccion + cantidadklgLote
          );

          const cantidadTotalUnidadesDelLoteProduccion = parseInt(
            totalUnidadesLoteProduccion + cantidadUnidades
          );

          if (cantidadTotalDelLoteProduccion > klgDisponibleLoteProduccion) {
            setfeedbackMessages({
              style_message: "warning",
              feedback_description_error:
                "Asegurese de que la asignancion de kg de lote sea menor a lo permitido",
            });
            handleClickFeeback();
          } else {
            // actualizamos la cantidad disponible
            setcantidadLoteProduccion({
              ...cantidadLoteProduccion,
              klgTotalLoteProduccion: cantidadTotalDelLoteProduccion,
              totalUnidadesLoteProduccion:
                cantidadTotalUnidadesDelLoteProduccion,
            });

            // ahora recien formamos el detalle
            const nextIndex = prodDetProdc.length + 1;
            const detalleProductosFinales = [
              ...prodDetProdc,
              {
                idProdFin,
                index: nextIndex,
                nomProd,
                simMed,
                canUnd: cantidadUnidades,
                canKlg: cantidadklgLote,
              },
            ];

            // ahora formamos el detalle de las requisiciones, se usa el numero de unidades
            let detalleRequisicionesFormula = [];
            reqDet.forEach((element) => {
              if (element.idAre === 5 || element.idAre === 6) {
                detalleRequisicionesFormula.push({
                  ...element,
                  indexProdFin: nextIndex,
                  idProdFin: idProdFin,
                  canReqProdLot: parseFloat(
                    (
                      parseFloat(element.canForProDet) * cantidadUnidades
                    ).toFixed(5)
                  ), // la cantidad unitaria * cantidad de unidades * cantidad de lotes
                });
              } else {
                return;
              }
            });

            detalleRequisicionesFormula.map((obj) => {
              obj.canReqProdLot = _parseInt(obj);
            });

            const detalleRequisicion = [
              ...reqDetProdc,
              ...detalleRequisicionesFormula,
            ];

            // lo insertamos en el detalle
            setproduccionLote({
              ...produccionLote,
              prodDetProdc: detalleProductosFinales,
              reqDetProdc: detalleRequisicion,
            });
          }
        } else {
          setfeedbackMessages({
            style_message: "error",
            feedback_description_error: description_error,
          });
          handleClickFeeback();
        }
      }
    } else {
      let advertenciaPresentacionFinal = "";
      if (idProdFin === 0) {
        advertenciaPresentacionFinal +=
          "Se debe proporcionar una presentacion final para agregar a la orden\n";
      }
      if (cantidadDeLote <= 0.0 || cantidadDeProducto <= 0) {
        advertenciaPresentacionFinal +=
          "Se debe proporcionar una cantidad mayor a 0 para agregar a la orden\n";
      }

      // mostramos el mensaje de error
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: advertenciaPresentacionFinal,
      });
      handleClickFeeback();
    }
  };

  // ELIMINAR UN PRODUCTO FINAL Y SU REQUISICION
  const handleDeleteDetalleProducto = (idItem) => {
    let totalKlgProductoFinal = 0;
    let totalUnidadesProductoFinal = 0;
    // filtramos el elemento eliminado
    const dataDetalleProductoFinalProduccion = prodDetProdc.filter(
      (element) => {
        if (element.idProdFin !== idItem) {
          return true;
        } else {
          totalKlgProductoFinal = element.canKlg;
          totalUnidadesProductoFinal = element.canUnd;
          return false;
        }
      }
    );

    const dataDetalleRequisicionProduccion = reqDetProdc.filter((element) => {
      if (element.idProdFin !== idItem) {
        return true;
      } else {
        return false;
      }
    });

    // descontamos del total acumulado de klg
    setcantidadLoteProduccion({
      ...cantidadLoteProduccion,
      klgTotalLoteProduccion: parseFloat(
        klgTotalLoteProduccion - totalKlgProductoFinal
      ),
      totalUnidadesLoteProduccion: parseInt(
        totalUnidadesLoteProduccion - totalUnidadesProductoFinal
      ),
    });

    // lo insertamos en el detalle
    setproduccionLote({
      ...produccionLote,
      prodDetProdc: dataDetalleProductoFinalProduccion,
      reqDetProdc: dataDetalleRequisicionProduccion,
    });
  };

  // CREAR LOTE DE PRODUCCION
  const crearProduccionLote = async () => {

    //console.log(produccionLote)
    const resultPeticion = await createProduccionLoteWithRequisiciones(
      produccionLote
    );

    //console.log(resultPeticion)
    const { message_error, description_error, result } = resultPeticion;
    if (message_error.length === 0) {
      // regresamos a la anterior vista
      onNavigateBack();
    } else {
      // hubo error en la insercion
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }

    // habilitamos el boton de crear
    setdisableButton(false);
  };

  // SUBMIT FORMULARIO DE REQUISICION (M-D)
  const handleSubmitProduccionLote = (e) => {
    e.preventDefault();
    if (
      codLotProd.length === 0 ||
      idProdt === 0 ||
      idProdTip === 0 ||
      klgLotProd <= 0 ||
      canLotProd <= 0 ||
      fecProdIniProg.length === 0 ||
      fecProdFinProg.length === 0 ||
      fecVenLotProd.length === 0
    ) {
      let advertenciaOrdenProduccion = "";
      if (codLotProd.length === 0) {
        advertenciaOrdenProduccion +=
          "No se ha proporcionado el código de lote\n";
      }
      if (idProdt === 0) {
        advertenciaOrdenProduccion += "No se ha proporcionado el subproducto\n";
      }
      if (idProdTip === 0) {
        advertenciaOrdenProduccion +=
          "No se ha proporcionado el tipo de producción\n";
      }
      if (klgLotProd <= 0) {
        advertenciaOrdenProduccion +=
          "Se debe proporcionar un peso mayor a 0 para buscar la formula\n";
      }
      if (canLotProd <= 0) {
        advertenciaOrdenProduccion +=
          "Se debe proporcionar una cantidad mayor a 0\n";
      }
      if (fecVenLotProd.length === 0) {
        advertenciaOrdenProduccion +=
          "Se debe proporcionar una fecha de vencimiento del lote\n";
      }
      if (fecProdIniProg.length === 0) {
        advertenciaOrdenProduccion +=
          "Se debe proporcionar una fecha de inicio programado\n";
      }
      if (fecProdFinProg.length === 0) {
        advertenciaOrdenProduccion +=
          "Se debe proporcionar una fecha de fin programado\n";
      }

      // Mostramos el feedback
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: advertenciaOrdenProduccion,
      });
      handleClickFeeback();
    } else {
      let advertenciaSubProductos = "";
      // solo los lotes de subproductos no tienen detalle de presentaciones finales
      if (
        idProdTip !== 5 &&
        (prodDetProdc.length === 0 || reqDetProdc.length === 0)
      ) {
        advertenciaSubProductos +=
          "Solo los lotes de subproducto no pueden tener detalle de presentaciones finales\n";

        // Mostramos el feedback
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error: advertenciaSubProductos,
        });
        handleClickFeeback();
      } else {
        setdisableButton(true);
        // LLAMAMOS A LA FUNCION CREAR REQUISICION
        crearProduccionLote();
        // RESETEAMOS LOS VALORES
      }
    }
  };

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Crear Orden de Producción</h1>

        <div className="row mt-4 mx-4">
          {/* Datos de produccion */}
          <div className="card d-flex">
            <h6 className="card-header">Datos de Producción</h6>
            <div className="card-body">
              <form>
                <div className="mb-3 row">
                  {/* NUMERO DE LOTE */}
                  <div className="col-md-2">
                    <label htmlFor="nombre" className="form-label">
                      <b>Número de Lote</b>
                    </label>
                    <input
                      type="text"
                      name="codLotProd"
                      onChange={handledForm}
                      value={codLotProd}
                      className="form-control"
                    />
                  </div>
                  {/* PRODUCTO */}
                  <div className="col-md-6 me-4">
                    <label htmlFor="nombre" className="form-label">
                      <b>Producto Intermedio</b>
                    </label>
                    <FilterProductoProduccion
                      onNewInput={onAddProductoProduccion}
                    />
                  </div>

                  {/* CANTIDAD DE LOTE */}
                  <div className="col-md-2">
                    <label htmlFor="nombre" className="form-label">
                      <b>Peso de Lote</b>
                    </label>
                    <input
                      type="number"
                      name="canLotProd"
                      onChange={handledForm}
                      value={canLotProd}
                      className="form-control"
                    />
                  </div>
                    {/* KILOGRAMOS DE LOTE */}
                    <div className="col-md-1">
                    <label htmlFor="nombre" className="form-label">
                      <b>Cantidad</b>
                    </label>
                    <input
                      type="number"
                      name="klgLotProd"
                      onChange={handledForm}
                      value={klgLotProd}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>

                <div className="mb-3 row d-flex align-items-center">
                  {/* TIPO DE PRODUCCION */}
                  <div className="col-md-4">
                    <label htmlFor="nombre" className="form-label">
                      <b>Tipo de Producción</b>
                    </label>
                    <FilterTipoProduccion onNewInput={onAddTipoProduccion} />
                  </div>
                  <div className="col-md-6 me-6">
                    <label htmlFor="nombre" className="form-label">
                      <b>Fecha Vencimiento Lote</b>
                    </label>
                    <FechaPickerYear
                      onNewfecEntSto={onAddFechaVencimientoLoteProduccion}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* DATOS DE PROGRAMACION */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Datos de Programación</h6>
            <div className="card-body">
              <div className="mb-3 row">
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha de Inicio Programado</b>
                  </label>
                  <FechaPicker onNewfecEntSto={onAddFechaInicioProgramado} />
                </div>
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha de Fin Programado</b>
                  </label>
                  <FechaPicker onNewfecEntSto={onAddFechaFinProgramado} />
                </div>
                <div className="col-md-6">
                  <label htmlFor="nombre" className="form-label">
                    <b>Observaciones</b>
                  </label>
                  <textarea
                    value={obsProd}
                    name="obsProd"
                    onChange={handledForm}
                    className="form-control"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          {/* DATOS DE PRODUCTOS FINALES O LOTES DE SUBPRODUCTOS*/}
          <div className="card d-flex mt-4">
            <h6 className="card-header">
              Detalle Presentaciones Finales{" "}
              <b className="text text-danger">
                (No Aplica a Lotes de Subproducto)
              </b>
            </h6>
            <div className="card-body">
              <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR PRODUCTO */}
                <div className="col-md-5">
                  <label className="form-label">Presentación Final</label>
                  {/* <FilterAllProductos onNewInput={onProductoId} /> */}
                  <FilterPresentacionFinal
                    onNewInput={onAddProductoFinalLoteProduccion}
                  />
                </div>
                {/* KILOGRAMOS DE LOTE ASIGNADOS */}
                <div className="col-md-2">
                  <label className="form-label">Cantidad Lote (KG)</label>
                  <TextField
                    type="number"
                    autoComplete="off"
                    size="small"
                    name="cantidadDeLote"
                    onChange={handleInputsProductosFinales}
                  />
                </div>
                
                
                {/* CANTIDAD DE PRRODUCTOS FINALES ESPERADOS 
                <div className="col-md-2">
                  <label className="form-label">Cantidad Producto</label>
                  <TextField
                    type="number"
                    autoComplete="off"
                    size="small"
                    name="cantidadDeProducto"
                    onChange={handleInputsProductosFinales}
                  />
                </div>
              */}

                {/* BOTON AGREGAR PRODUCTO */}
                <div className="col-md-3 d-flex justify-content-end align-self-center ms-auto">
                  <button
                    onClick={handleAddProductoProduccionLote}
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
              {/* PRODUCTOS FINALES O SUBPRODUCTOS */}
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
                        <TableCell align="left" width={20}>
                          <b>Prod-Asociado</b>
                        </TableCell>
                        <TableCell align="left" width={200}>
                          <b>Nombre</b>
                        </TableCell>
                        <TableCell align="left" width={20}>
                          <b>U.M</b>
                        </TableCell>
                        <TableCell align="left" width={150}>
                          <b>Unidades</b>
                        </TableCell>
                        <TableCell align="left" width={150}>
                          <b>Peso Lote (kg)</b>
                        </TableCell>
                        <TableCell align="left" width={150}>
                          <b>Acciones</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {prodDetProdc.map((row, i) => {
                        return (
                          <RowEditDetalleProductosFinales
                            key={row.idProdFin}
                            detalle={row}
                            onDeleteItemProductoFinal={
                              handleDeleteDetalleProducto
                            }
                          />
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
              {/* DETALLES DE LA CANTIDAD */}
              <div className="mt-4 d-flex justify-content-end align-items-center">
                <p className="me-4 p-2 bg-dark-subtle">
                  <b>Total Unidades: </b>
                  {totalUnidadesLoteProduccion}
                </p>
                <p className="p-2 bg-danger-subtle">
                  <b>Total Peso: </b>
                  {klgTotalLoteProduccion} / {klgDisponibleLoteProduccion}
                </p>
              </div>
            </div>
          </div>
          {/* DATOS DEL DETALLE */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Detalle de las Requisiciones</h6>
            <div className="card-body">
              {/* AÑADIR PRODUCTOS ADICICONALES */}
              <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR PRODUCTO */}
                <div className="col-md-5">
                  <label className="form-label">
                    Envases, Embalajes u otros Materiales
                  </label>
                  {/* <FilterAllProductos onNewInput={onProductoId} /> */}
                  <FilterAllProductos
                    onNewInput={onAddProductoRequisicionLoteProduccion}
                  />
                </div>
                {/* AGREGAR AREA */}
                <div className="col-md-2">
                  <label className="form-label">Área Destino</label>
                  <FilterAreaEncargada
                    onNewInput={handleAreaIdProductoRequisicion}
                  />
                </div>
                {/* KILOGRAMOS DE LOTE ASIGNADOS */}
                <div className="col-md-2">
                  <label className="form-label">Cantidad</label>
                  <TextField
                    size="small"
                    type="number"
                    name="cantidadRequisicion"
                    onChange={handleInputsProductosRequisicion}
                  />
                </div>
                {/* BOTON AGREGAR PRODUCTO */}
                <div className="col-md-3 d-flex justify-content-end align-self-center ms-auto">
                  <button
                    onClick={handleAddProductoRequisicionLote}
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
              {/* DETALLE DE ENVASADO */}
              <div className="card text-bg-success d-flex mt-3">
                <h6 className="card-header">Detalle Envasado</h6>
                <div className="card-body">
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
                            <TableCell align="left" width={20}>
                              <b>Prod-Asociado</b>
                            </TableCell>
                            <TableCell align="left" width={230}>
                              <b>Nombre</b>
                            </TableCell>
                            <TableCell align="left" width={20}>
                              <b>U.M</b>
                            </TableCell>
                            <TableCell align="left" width={20}>
                              <b>Unidad</b>
                            </TableCell>
                            <TableCell align="left" width={120}>
                              <b>Total</b>
                            </TableCell>
                            <TableCell align="left" width={150}>
                              <b>Acciones</b>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reqDetProdc.map((row, i) => {

                            
                            if (row.idAre === 5) {
                              return (
                                <RowEditDetalleRequisicionProduccion
                                  key={`${row.idProd}-${i}`}
                                  detalle={row}
                                  type="number"
                                  onDeleteItemRequisicion={
                                    handleDeleteItemRequisicionProduccion
                                  }
                                  onChangeItemDetalle={
                                    handleEditItemRequisicionProduccion
                                  }
                                  onValidate={onValidate}

                                />
                              );
                            }
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </div>
              {/* DETALLE DE ENCAJONADO */}
              <div className="card text-bg-warning d-flex mt-3">
                <h6 className="card-header">Detalle Encajado</h6>
                <div className="card-body">
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
                            <TableCell align="left" width={20}>
                              <b>Prod-Asociado</b>
                            </TableCell>
                            <TableCell align="left" width={230}>
                              <b>Nombre</b>
                            </TableCell>
                            <TableCell align="left" width={20}>
                              <b>U.M</b>
                            </TableCell>
                            <TableCell align="left" width={20}>
                              <b>Unidad</b>
                            </TableCell>
                            <TableCell align="left" width={120}>
                              <b>Total</b>
                            </TableCell>
                            <TableCell align="left" width={150}>
                              <b>Acciones</b>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                        {reqDetProdc.map((row, i) => {
                            if (row.idAre === 6) {
                              return (
                                <RowEditDetalleRequisicionProduccion
                                  key={`${row.idProd}-${i}`}
                                  detalle={row}
                                  onDeleteItemRequisicion={handleDeleteItemRequisicionProduccion}
                                  onChangeItemDetalle={handleEditItemRequisicionProduccion}
                                  onValidate={onValidate}

                                />
                              );
                            }
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTONES DE CANCELAR Y GUARDAR */}
        <div className="btn-toolbar mt-4 ms-4">
          <button
            type="button"
            onClick={onNavigateBack}
            className="btn btn-secondary me-2"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={disableButton}
            onClick={handleSubmitProduccionLote}
            className="btn btn-primary"
          >
            Guardar
          </button>
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
          <Typography whiteSpace={"pre-line"}>
            {feedback_description_error}
          </Typography>
        </Alert>
      </Snackbar>

      {/* LINEAR PROGRESS */}
      {showLinearProgress && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      )}
    </>
  );
};
