package com.pqrs.pqrs.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.pqrs.pqrs.model.Usuario;

public interface UsuarioRepository extends MongoRepository<Usuario, String> {

    Optional<Usuario> findByUsername(String username);
}