<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == 'DELETE') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if (isset($data["id"])) {

        $idProveedor = $data["id"];

        if ($pdo) {
            $sql =
                "DELETE
            FROM proveedor
            WHERE id = :id;
            ";
            //Preparamos la consulta
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':id', $idProveedor, PDO::PARAM_INT); //ID

            // Comprobamos la respuesta
            try {
                if (!$stmt->execute()) {
                    $message_error = "No se pudo realizar la eliminacion";
                    $description_error = "No se pudo eliminar, por favor verifique que existe el id ingresado";
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
    } else {
        $message_error = "No se proporciono el id del proveedor";
        $description_error = "No se proporciono el id del proveedor ";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
