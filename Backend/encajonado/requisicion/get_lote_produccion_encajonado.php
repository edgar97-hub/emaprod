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

        $añoActual = date("Y");

        // LAS CONDICIONES PARA OBTENER LOS LOTES DISPONIBLES PARA REQUISICION MOLIENDA SON
        /*
        - Se deben mostrar todos los tipos de lote produccion
        - Se deben mostrar los lotes de produccion que su proceso de molienda hayan terminado
        - Se deben mostrar los lotes de produccion que su proceso de iniciado haya comenzado
        - Se deben mostrar los lotes de produccion que su proceso de envasado haya terminado
        - No se mostraran lotes de produccion que su proceso de encajonado haya terminado
        - No se mostraran lotes de produccion que su proceso haya terminado
        */

        $sql =
            "SELECT
            pd.id,
            pd.idProdt,
            p.nomProd,
            pd.codLotProd,
            DATE(pd.fecProdIni) AS fecProdIni
        FROM produccion pd
        JOIN producto p ON pd.idProdt = p.id
        WHERE idProdEst = ? OR idProdEst = ? OR idProdEst = ?
        ORDER BY pd.fecProdIni DESC";

        try {
            $idProdEstIni = 1; // es un lote de produccion iniciado
            $idProdEstMolTer = 2; // es un lote de produccion que su proceso de molienda ha terminado
            $idProdEstEnvTer = 4; // es un lote de produccion que su proceso de envasado ha termiando

            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $idProdEstIni, PDO::PARAM_INT);
            $stmt->bindParam(2, $idProdEstMolTer, PDO::PARAM_INT);
            $stmt->bindParam(3, $idProdEstEnvTer, PDO::PARAM_INT);
            $stmt->execute(); // ejecutamos
            // Recorremos los resultados
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
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
