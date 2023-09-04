<?php

require('../../common/conexion.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($pdo) {
        $sql =
            "SELECT
        M.id,
        M.idMed,
        ME.simMed,
        M.nomProd,
        M.codProd2,
        M.esMatPri,
        M.esProFin,
        M.esProProd
        FROM producto M
        LEFT JOIN medida ME ON M.idMed = ME.id
        WHERE M.esProFin = ?
        ";
        // Preparamos la consulta
        $stmt = $pdo->prepare($sql);
        $esProFin = 1; // filtramos los productos presentaciones finales
        $stmt->bindParam(1, $esProFin, PDO::PARAM_BOOL);
        // Ejecutamos la consulta
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

// Si se pudo realizar la conexion a la base de datos

// Programa terminado
