package com.pqrs.pqrs.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pqrs.pqrs.dto.LoginRequest;
import com.pqrs.pqrs.model.Usuario;
import com.pqrs.pqrs.repository.UsuarioRepository;

@RestController
@RequestMapping("/test")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repo;

    // ✅ CREATE (REGISTRO)
    @PostMapping("/register")
public ResponseEntity<Usuario> crear(@RequestBody Usuario user) {

    // 🔥 ESTADO DEFAULT
    if (user.getEstado() == null) {
        user.setEstado("ACTIVO");
    }

    // 🔥 ROLE DEFAULT (CRÍTICO)
    if (user.getRole() == null) {
        user.setRole("USER");
    }

    Usuario nuevo = repo.save(user);
    return ResponseEntity.ok(nuevo);
    }

    // ✅ LOGIN
    @PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {

    // 🔥 VALIDAR INPUT
    if (request.getUsername() == null || request.getPassword() == null) {
        return ResponseEntity.badRequest().body("Datos incompletos");
    }

    Optional<Usuario> userOpt = repo.findByUsername(request.getUsername());

    if (userOpt.isEmpty()) {
        return ResponseEntity.status(404).body("Usuario no encontrado");
    }

    Usuario user = userOpt.get();

    // 🔥 VALIDAR PASSWORD SIN ROMPER
    if (user.getPassword() == null || !user.getPassword().equals(request.getPassword())) {
        return ResponseEntity.status(401).body("Contraseña incorrecta");
    }

    return ResponseEntity.ok(user);
    }

    // ✅ GET ALL
    @GetMapping("/listar")
    public ResponseEntity<List<Usuario>> listar() {
        return ResponseEntity.ok(repo.findAll());
    }

    // ✅ GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable String id) {
        Optional<Usuario> user = repo.findById(id);

        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.status(404).body("Usuario no encontrado");
        }
    }

    // ✅ UPDATE (MEJORADO 🔥)
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizar(@PathVariable String id, @RequestBody Usuario datos) {

        Optional<Usuario> userOpt = repo.findById(id);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Usuario no encontrado");
        }

        Usuario user = userOpt.get();

        // 🔥 SOLO ACTUALIZA LO NECESARIO
        if (datos.getNombre() != null) user.setNombre(datos.getNombre());
        if (datos.getUsername() != null) user.setUsername(datos.getUsername());
        if (datos.getPassword() != null && !datos.getPassword().isEmpty()) {
            user.setPassword(datos.getPassword());
        }

        return ResponseEntity.ok(repo.save(user));
    }

    // ✅ CAMBIAR ESTADO USUARIO (ACTIVO / INACTIVO)
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable String id, @RequestParam String estado) {

        Optional<Usuario> userOpt = repo.findById(id);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Usuario no encontrado");
        }

        Usuario user = userOpt.get();
        user.setEstado(estado);

        return ResponseEntity.ok(repo.save(user));
    }

    // ✅ DELETE
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<String> eliminar(@PathVariable String id) {
        repo.deleteById(id);
        return ResponseEntity.ok("Usuario eliminado");
    }
}