<?php
namespace App\Controller;
use PDO;
class UsuarioController{
    private $usuario;
    private $conecta;

    public function __construct($usuario,$conexao){
        $this->usuario=$usuario;
        $this->conecta=$conexao;
    }
    public function inserir() {
        try {
            $stmt = $this->conecta->prepare("INSERT INTO usuarios (nome, rosto) VALUES (:nome, :rosto)");
            $nome = $this->usuario->getNome();
            $rosto = $this->usuario->getRosto();
            $stmt->bindParam(':nome', $nome);
            $stmt->bindParam(':rosto', $rosto);
            $stmt->execute();
            return ['status' => true, 'id' => $this->conecta->lastInsertId()];
        } catch (\PDOException $e) {
            return ['status' => false, 'error' => $e->getMessage()];
        }
    }
    
    public function buscar(){
        $stmt = $this->conecta->prepare("SELECT * FROM usuarios");
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    public function excluir(){
        try {
        $stmt = $this->conecta->prepare("DELETE FROM usuarios where id=:id");
        $id = $this->usuario->getId();
        $stmt->bindParam(':id', $id);
        $stmt->execute();
            return ['status' => true];
        } catch (\PDOException $e) {
            return ['status' => false, 'error' => $e->getMessage()];
        }
    }
    
}