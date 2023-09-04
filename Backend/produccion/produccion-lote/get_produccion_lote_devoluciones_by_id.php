<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($pdo) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $idLotProdc = $data["id"];

        $sql =
            "SELECT
        pd.id,
        pd.idProdt,
        p.nomProd,
        pd.idProdEst,
        pe.desEstPro,
        pd.idProdTip,
        pt.desProdTip,
        pd.codLotProd,
        pd.klgLotProd,
        pd.canLotProd,
        pd.fecVenLotProd
    FROM produccion pd
    JOIN producto as p ON p.id = pd.idProdt
    JOIN produccion_estado as pe ON pe.id = pd.idProdEst
    JOIN produccion_tipo as pt ON pt.id = pd.idProdTip 
    WHERE pd.id = ?";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $idLotProdc, PDO::PARAM_INT);
            $stmt->execute(); // ejecutamos
            // Recorremos los resultados
            $sql_detalle_devoluciones_lote_produccion = "";
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $row["detDev"] = [];
                $sql_detalle_devoluciones_lote_produccion =
                    "SELECT 
                pdv.id,
                pdv.idProdc,
                pdv.idProdt,
                p.nomProd,
                me.simMed,
                pdv.idAlm,
                al.nomAlm,
                pdv.idProdDevMot,
                pdm.desProdDevMot,
                pdv.canProdDev
                FROM produccion_devolucion as pdv
                JOIN producto as p ON p.id = pdv.idProdt
                JOIN medida as me ON me.id = p.idMed
                JOIN almacen as al ON al.id = pdv.idAlm
                JOIN produccion_devolucion_motivo as pdm ON pdm.id = pdv.idProdDevMot
                WHERE pdv.idProdc = ?";

                try {
                    $stmt_detalle_devoluciones_lote_produccion = $pdo->prepare($sql_detalle_devoluciones_lote_produccion);
                    $stmt_detalle_devoluciones_lote_produccion->bindParam(1, $idLotProdc, PDO::PARAM_INT);
                    $stmt_detalle_devoluciones_lote_produccion->execute();

                    while ($row_detalle_agregacion_lote_produccion = $stmt_detalle_devoluciones_lote_produccion->fetch(PDO::FETCH_ASSOC)) {
                        array_push($row["detDev"], $row_detalle_agregacion_lote_produccion);
                    }
                } catch (PDOException $e) {
                    $message_error = "ERROR INTERNO EN LA CONSULTA DE AGREGACIONES";
                    $description_error = $e->getMessage();
                }
                array_push($result, $row);
            }
        } catch (PDOException $e) {
            $message_error = "ERROR INTERNO EN LA CONSULTA DE ENTRADAS";
            $description_error = $e->getMessage();
        }
    } else {
        // No se pudo realizar la conexion a la base de datos
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
