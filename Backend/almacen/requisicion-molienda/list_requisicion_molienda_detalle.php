<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $fechasMes = getStartEndDateNow();
    $fechaInicio = $fechasMes[0]; // inicio del mes
    $fechaFin = $fechasMes[1]; // fin del mes

    if (isset($data)) {
        if (!empty($data["fecReqMolIni"])) {
            $fechaInicio = $data["fecReqMolIni"];
        }
        if (!empty($data["fecReqMolFin"])) {
            $fechaFin = $data["fecReqMolFin"];
        }
    }

    $data_requsicion_molienda = [];

    if ($pdo) {
        $sql =
            "SELECT
            r.id,
            r.idProdc,
            r.idReqEst,
            r.idProdt,
            r.idAre,
            a.desAre,
            pc.codLotProd,
            pc.idProdTip,
            pct.desProdTip,
            pc.klgLotProd,
            pc.canLotProd,
            re.desReqEst,
            p.nomProd,
            r.fecPedReq, 
            r.codReq
            FROM requisicion r
            JOIN producto as p on p.id = r.idProdt
            RIGHT JOIN produccion pc  on pc.id = r.idProdc
            JOIN produccion_tipo pct on pct.id = pc.idProdTip
            JOIN area a on a.id = r.idAre
            JOIN requisicion_estado as re on re.id = r.idReqEst
            WHERE r.idAre = ?  
            #DATE(r.fecPedReq) BETWEEN '$fechaInicio' AND '$fechaFin'
            ORDER BY r.fecPedReq DESC
            ";

        $sql =
            "SELECT
            r.id,
            r.idProdc,
            r.idReqEst,
            r.idProdt,
            r.idAre,
            a.desAre,
            '' AS codLotProd,
            '' AS idProdTip,
            'POLVOS' AS desProdTip,
            '' AS klgLotProd,
            r.cantProg AS canLotProd,
            re.desReqEst,
            p.nomProd,
            r.fecPedReq, 
            r.codReq
            FROM requisicion r
            JOIN producto as p on p.id = r.idProdt
            JOIN area a on a.id = r.idAre
            JOIN requisicion_estado as re on re.id = r.idReqEst
            WHERE r.idAre = ? and
            DATE(r.fecPedReq) BETWEEN '$fechaInicio' AND '$fechaFin'
            ORDER BY r.fecPedReq DESC
            ";


        //die(json_encode($fechaInicio));

        try {

            //die(json_encode("test"));

            $idAre = 2; // AREA DE MOLIENDA
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $idAre, PDO::PARAM_INT);
            $stmt->execute();
            $sql_detalle = "";

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $idReq = $row["id"];
                $row["reqDet"] = [];

                $sql_detalle =
                    "SELECT
                rd.id,
                rd.idProdt,
                rd.idReq,
                rd.idReqDetEst,
                p.nomProd,
                p.codProd,
                rde.desReqDetEst,
                rd.canReqDet
                FROM requisicion_detalle rd
                JOIN producto as p on p.id = rd.idProdt
                JOIN requisicion_detalle_estado as rde on rde.id = rd.idReqDetEst
                WHERE rd.idReq = ?
                ";

                try {
                    $stmt_detalle = $pdo->prepare($sql_detalle);
                    $stmt_detalle->bindParam(1, $idReq, PDO::PARAM_INT);
                    $stmt_detalle->execute();
                } catch (Exception $e) {
                    $message_error = "ERROR INTERNO SERVER";
                    $description_error = $e->getMessage();
                }
                while ($row_detalle = $stmt_detalle->fetch(PDO::FETCH_ASSOC)) {
                    array_push($row["reqDet"], $row_detalle);
                }
                //AÑADIMOS TODA LA DATA FOrATEADA
                array_push($data_requsicion_molienda, $row);
            }
            // DESCOMENTAR PARA VER LA DATA
            //print_r($data_requsicion_molienda);

            $result = $data_requsicion_molienda;
        } catch (Exception $e) {
            $message_error = "ERROR INTERNO SERVER";
            $description_error = $e->getMessage();
        }
    } else {
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
    }
    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
