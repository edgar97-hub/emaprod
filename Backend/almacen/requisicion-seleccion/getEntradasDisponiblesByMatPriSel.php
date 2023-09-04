<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idMatPri = $data["idMatPri"]; // ID DE LA MATERIA PRIMA

    if ($pdo) {
        $sql =
            "SELECT
            es.id,
            es.idAlm,
            a.nomAlm,
            es.codEntSto,
            es.refNumIngEntSto,
            DATE(es.fecEntSto) AS fecEntSto,
            es.canTotDis,
            es.canPorSel,
            es.canSel 
        FROM entrada_stock AS es
        JOIN almacen a ON a.id = es.idAlm 
        WHERE idProd = ? AND canPorSel <> 0.00 AND es.esSel = ?
        ORDER BY es.refNumIngEntSto DESC
        ";
        //Preparamos la consulta
        $stmt = $pdo->prepare($sql);

        $idEntStoEst = 1; // ESTADO DISPONIBLE DE LAS ENTRADAS
        $esSel = 1;

        $stmt->bindParam(1, $idMatPri, PDO::PARAM_INT);
        $stmt->bindParam(2, $esSel, PDO::PARAM_BOOL);

        // Comprobamos la respuesta
        try {
            $stmt->execute();

            // Recorremos los resultados
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($result, $row);
            }
        } catch (Exception $e) {
            $message_error = "ERROR INTERNO SERVER";
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
