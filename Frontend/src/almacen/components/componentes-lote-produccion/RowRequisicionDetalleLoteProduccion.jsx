import React, { useState } from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

export const RowRequisicionDetalleLoteProduccion = ({
  detalle,
  onCreateSalidasStock,
  onUpdateDetalleRequisicion,
}) => {
  /**         CHANGE FOR ME, THIS OP OINDICATE THE FIX  */
  /***************************************************************************************** */
  if (detalle.idAre === 6 || detalle.idAre === 5) {
    //console.log("ROW REQUISICIONES DETALLE: ", detalle);
    const canReqDetFloat = parseFloat(detalle.canReqDet);
    const canReqDetRedondeado = Math.ceil(canReqDetFloat);
    detalle.canReqDet = canReqDetRedondeado.toString();
  }
  /***************************************************************************************** */
  return (
    <TableRow>
      <TableCell>{detalle.nomProd}</TableCell>
      <TableCell>
        <span
          className={
            detalle.idReqDetEst === 1
              ? "badge text-bg-danger p-2"
              : "badge text-bg-success p-2"
          }
        >
          {detalle.desReqDetEst}
        </span>
      </TableCell>
      <TableCell>{detalle.simMed}</TableCell>
      <TableCell>{"detalle.canReqDet"}</TableCell>
      <TableCell>
        <div className="btn-toolbar">
         {onUpdateDetalleRequisicion && 
         <button
         onClick={() => {
           onUpdateDetalleRequisicion(detalle);
         }}
         disabled={detalle.idReqDetEst !== 1 ? true : false}
         className="btn btn-danger me-2"
       >
         <svg
           xmlns="http://www.w3.org/2000/svg"
           width="16"
           height="16"
           fill="currentColor"
           className="bi bi-pencil-fill"
           viewBox="0 0 16 16"
         >
           <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
         </svg>
       </button>

         } 

          <button
            disabled={detalle.idReqDetEst !== 1 ? true : false}
            className="btn btn-success me-2"
            onClick={() => {
              onCreateSalidasStock(detalle);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-check-lg"
              viewBox="0 0 16 16"
            >
              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
            </svg>
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
};
