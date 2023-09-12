import React from 'react'
import { RowRequisicionDetalleLoteProduccion } from "../../../almacen/components/componentes-lote-produccion/RowRequisicionDetalleLoteProduccion";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const AtenderAgregaciones = ({
  prodLotReq
}) => {


  const onCreateSalidasStock = async (requisicion_detalle) => {
    // abrimos el loader
  {
    /**
       openLoader();
    const resultPeticion = await createSalidasStockAutomaticas(
      requisicion_detalle
    );

    const { message_error, description_error, result } = resultPeticion;
    if (message_error.length === 0) {
      obtenerDataProduccionRequisicionesDetalle();
      closeLoader();
      setfeedbackMessages({
        style_message: "success",
        feedback_description_error: "Se cumplio la requisicion exitosamente",
      });
      handleClickFeeback();
    } else {
      closeLoader();
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
     */
  }
  };

  const showAndSetDialogUpdateDetalleRequisicion = (item) => {
    //setItemSeleccionado(item);
    //setshowDialogUpdate(true);
  };


  return (
    <>

        <div className="card d-flex mt-4">
            <h6 className="card-header">Requisiciones</h6>
            <div className="card-body">
              {prodLotReq.map((element) => {

               {/**  
               if(user.idAre === 4 && element.idAre == 2){
                } */} 
                return (
                  <RowRequisicionLoteProduccion
                    key={element.id}
                    onCreateSalidasStock={onCreateSalidasStock}
                    onUpdateDetalleRequisicion={
                      showAndSetDialogUpdateDetalleRequisicion
                    }
                    requisicion={element}
                  />
                );
              })}
            </div>
          </div>
          
          </>
  )
}

export    { AtenderAgregaciones }

const RowRequisicionLoteProduccion = ({
  requisicion,
  onCreateSalidasStock,
  onUpdateDetalleRequisicion,
}) => {
  //console.log("REQUISICIONES:  ",requisicion);
  return (
    <div className="card d-flex mb-4">
      <h6 className="card-header">
        {requisicion.idAre === 5
          ? "Requisicion envasado"
          : requisicion.idAre === 6
          ? "Requisicion encajonado"
          : "Requisicion de materia prima"}
      </h6>
      <div className="card-body">
        <div className="mb-3 row">
          {/* AREA */}
          <div className="col-md-2">
            <label htmlFor="nombre" className="form-label">
              <b>Area encargada</b>
            </label>
            <input
              type="text"
              disabled={true}
              value={requisicion.desAre}
              className="form-control"
            />
          </div>
          {/* ESTADO DE REQUISICION */}
          <div className="col-md-2">
            <label htmlFor="nombre" className="form-label">
              <b>Estado requisIcion</b>
            </label>
            <div className="d-flex justify-content-center">
              <span
                className={
                  requisicion.idReqEst === 1
                    ? "badge text-bg-danger p-2"
                    : requisicion.idReqEst === 2
                    ? "badge text-bg-warning p-2"
                    : "badge text-bg-success p-2"
                }
              >
                {requisicion.desReqEst}
              </span>
            </div>
          </div>
          {/* FECHA PEDIDO */}
          <div className="col-md-3">
            <label htmlFor="nombre" className="form-label">
              <b>Fecha de pedido</b>
            </label>
            <input
              type="text"
              disabled={true}
              value={requisicion.fecPedReq}
              className="form-control"
            />
          </div>
          {/* FECHA ENTREGADO */}
          <div className="col-md-3">
            <label htmlFor="nombre" className="form-label">
              <b>Fecha de entregado</b>
            </label>
            <input
              type="text"
              disabled={true}
              value={
                requisicion.fecEntReq === null
                  ? "Aun no entregado"
                  : requisicion.fecEntReq
              }
              className="form-control"
            />
          </div>
        </div>

        {/* DETALLE DE MATERIA PRIMA */}
        <div
          className={`card ${
            requisicion.idAre === 5
              ? "text-bg-success"
              : requisicion.idAre === 6
              ? "text-bg-warning"
              : "text-bg-primary"
          } d-flex`}
        >
          <h6 className="card-header">Detalle</h6>
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
                      <TableCell align="left" width={200}>
                        <b>Nombre</b>
                      </TableCell>
                      <TableCell align="left" width={120}>
                        <b>Estado</b>
                      </TableCell>
                      <TableCell align="left" width={20}>
                        <b>U.M</b>
                      </TableCell>
                      <TableCell align="left" width={150}>
                        <b>Cantidad</b>
                      </TableCell>
                      <TableCell align="left" width={150}>
                        <b>Acciones</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requisicion.reqDet.map((row, i) => {
                      return (
                        <RowRequisicionDetalleLoteProduccion
                          key={row.id}
                          detalle={{ ...row, idAre: requisicion.idAre }}
                          onCreateSalidasStock={onCreateSalidasStock}
                          onUpdateDetalleRequisicion={
                            onUpdateDetalleRequisicion
                          }
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
    </div>
  );
};
