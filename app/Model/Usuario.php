<?php
namespace App\Model;
class Usuario{
    private int $id;
    private string $nome;
    private string $rosto;

    /**
     * Get the value of id
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * Set the value of id
     */
    public function setId(int $id): self
    {
        $this->id = $id;

        return $this;
    }

    /**
     * Get the value of nome
     */
    public function getNome(): string
    {
        return $this->nome;
    }

    /**
     * Set the value of nome
     */
    public function setNome(string $nome): self
    {
        $this->nome = $nome;

        return $this;
    }

    /**
     * Get the value of rosto
     */
    public function getRosto(): string
    {
        return $this->rosto;
    }

    /**
     * Set the value of rosto
     */
    public function setRosto(string $rosto): self
    {
        $this->rosto = $rosto;

        return $this;
    }
}