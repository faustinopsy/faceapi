<?php

namespace App\usuarios;
require "../vendor/autoload.php";

use App\Database\Conexao;
use App\Model\Usuario;
use App\Controller\UsuarioController;

$conexao = Conexao::getConexao();
$usuario = new Usuario();


$body = json_decode(file_get_contents('php://input'), true);
switch($_SERVER["REQUEST_METHOD"]){
    case "POST"; 
        $usuario->setNome($body['nome']);
        $usuario->setRosto($body['rosto']);
        $users = new UsuarioController($usuario,$conexao);
        $resultado = $users->inserir();
        echo json_encode($resultado);
    break;
    case "GET";
            $users = new UsuarioController($usuario,$conexao);
            $resultado = $users->buscar();
            echo json_encode(["usuarios"=>$resultado]);
    break;
    case "DELETE";
        $id=isset($_GET['id'])?$_GET['id']:'';
        $usuario->setId($id);
        $users = new UsuarioController($usuario,$conexao);
        $resultado = $users->excluir();
        echo json_encode([$resultado]);
    break;
    
}