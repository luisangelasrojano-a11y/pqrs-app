package com.pqrs.pqrs.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.pqrs.pqrs.model.Pqrs;

public interface PqrsRepository extends MongoRepository<Pqrs, String> {

    List<Pqrs> findByUsuarioId(String usuarioId);

    // 🔥 NUEVO (por si luego quieres optimizar filtro)
    List<Pqrs> findByUsuarioIdAndEstado(String usuarioId, String estado);
}