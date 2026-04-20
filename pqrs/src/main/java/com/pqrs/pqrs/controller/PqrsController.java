package com.pqrs.pqrs.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

import com.pqrs.pqrs.model.Pqrs;
import com.pqrs.pqrs.model.Usuario;
import com.pqrs.pqrs.repository.PqrsRepository;
import com.pqrs.pqrs.repository.UsuarioRepository;

@RestController
@RequestMapping("/pqrs")
@CrossOrigin(origins = "*")
public class PqrsController {

    @Autowired
    private PqrsRepository repo;

    @Autowired
    private UsuarioRepository usuarioRepo;

    ///////////////////////
    // 🔥 CREAR PQRS
    ///////////////////////
    @PostMapping
    public ResponseEntity<Pqrs> crear(@RequestBody Pqrs pqrs) {

        pqrs.setFecha(new Date());

        if (pqrs.getEstado() == null) {
            pqrs.setEstado("PENDIENTE");
        }

        // 🔥 TRAER INFO USUARIO
        if (pqrs.getUsuarioId() != null) {
            Optional<Usuario> userOpt = usuarioRepo.findById(pqrs.getUsuarioId());

            if (userOpt.isPresent()) {
                Usuario user = userOpt.get();
                pqrs.setUsername(user.getUsername());
                pqrs.setNombre(user.getNombre());
            }
        }

        return ResponseEntity.ok(repo.save(pqrs));
    }

    ///////////////////////
    // 🔥 RESPONDER PQRS (ADMIN)
    ///////////////////////
    @PutMapping("/{id}/responder")
    public ResponseEntity<?> responder(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {

        Optional<Pqrs> pqrsOpt = repo.findById(id);

        if (pqrsOpt.isEmpty()) {
            return ResponseEntity.status(404).body("PQRS no encontrada");
        }

        String respuesta = body.get("respuesta");

        if (respuesta == null || respuesta.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("La respuesta no puede estar vacía");
        }

        Pqrs pqrs = pqrsOpt.get();

        pqrs.setRespuestaAdmin(respuesta);
        pqrs.setFechaRespuesta(new Date());

        // 🔥 OPCIONAL: al responder se marca como resuelto
        pqrs.setEstado("RESUELTO");

        return ResponseEntity.ok(repo.save(pqrs));
    }

    ///////////////////////
    // 🔥 LISTAR POR USUARIO
    ///////////////////////
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Pqrs>> listarPorUsuario(@PathVariable String usuarioId) {
        return ResponseEntity.ok(repo.findByUsuarioId(usuarioId));
    }

    ///////////////////////
    // 🔥 FILTRO POR ESTADO
    ///////////////////////
    @GetMapping("/usuario/{usuarioId}/estado")
    public ResponseEntity<List<Pqrs>> filtrarPorEstado(
            @PathVariable String usuarioId,
            @RequestParam String estado) {

        List<Pqrs> lista = repo.findByUsuarioId(usuarioId);

        List<Pqrs> filtradas = lista.stream()
                .filter(p -> p.getEstado().equalsIgnoreCase(estado))
                .toList();

        return ResponseEntity.ok(filtradas);
    }

    ///////////////////////
    // 🔥 EDITAR PQRS
    ///////////////////////
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable String id, @RequestBody Pqrs datos) {

        Optional<Pqrs> pqrsOpt = repo.findById(id);

        if (pqrsOpt.isEmpty()) {
            return ResponseEntity.status(404).body("PQRS no encontrada");
        }

        Pqrs pqrs = pqrsOpt.get();

        if (datos.getTipo() != null) pqrs.setTipo(datos.getTipo());
        if (datos.getDescripcion() != null) pqrs.setDescripcion(datos.getDescripcion());
        if (datos.getEstado() != null) pqrs.setEstado(datos.getEstado());

        return ResponseEntity.ok(repo.save(pqrs));
    }

    ///////////////////////
    // 🔥 ELIMINAR
    ///////////////////////
    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminar(@PathVariable String id) {
        repo.deleteById(id);
        return ResponseEntity.ok("PQRS eliminada");
    }

    ///////////////////////
    // 🔥 DASHBOARD USER
    ///////////////////////
    @GetMapping("/estadisticas/{usuarioId}")
    public ResponseEntity<Map<String, Object>> estadisticas(@PathVariable String usuarioId) {

        List<Pqrs> lista = repo.findByUsuarioId(usuarioId);

        long total = lista.size();
        long pendientes = lista.stream().filter(p -> "PENDIENTE".equalsIgnoreCase(p.getEstado())).count();
        long proceso = lista.stream().filter(p -> "PROCESO".equalsIgnoreCase(p.getEstado())).count();
        long resueltas = lista.stream().filter(p -> "RESUELTO".equalsIgnoreCase(p.getEstado())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("pendientes", pendientes);
        stats.put("proceso", proceso);
        stats.put("resueltas", resueltas);

        return ResponseEntity.ok(stats);
    }

    //////////////////////////////////////////////////////
    // 🔥 ADMIN PANEL
    //////////////////////////////////////////////////////

    ///////////////////////
    // 🔥 LISTAR TODAS
    ///////////////////////
    @GetMapping("/todas")
    public ResponseEntity<List<Pqrs>> listarTodas() {
        return ResponseEntity.ok(repo.findAll());
    }

    ///////////////////////
    // 🔥 CAMBIAR ESTADO
    ///////////////////////
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable String id,
            @RequestParam String estado) {

        Optional<Pqrs> pqrsOpt = repo.findById(id);

        if (pqrsOpt.isEmpty()) {
            return ResponseEntity.status(404).body("PQRS no encontrada");
        }

        Pqrs pqrs = pqrsOpt.get();
        pqrs.setEstado(estado);

        return ResponseEntity.ok(repo.save(pqrs));
    }

    ///////////////////////
    // 🔥 FILTRO GLOBAL
    ///////////////////////
    @GetMapping("/estado")
    public ResponseEntity<List<Pqrs>> filtrarGlobal(@RequestParam String estado) {
        List<Pqrs> lista = repo.findAll();

        List<Pqrs> filtradas = lista.stream()
                .filter(p -> p.getEstado().equalsIgnoreCase(estado))
                .toList();

        return ResponseEntity.ok(filtradas);
    }

    ///////////////////////
    // 🔥 DASHBOARD GLOBAL
    ///////////////////////
    @GetMapping("/estadisticas-global")
    public ResponseEntity<Map<String, Object>> estadisticasGlobal() {

        List<Pqrs> lista = repo.findAll();

        long total = lista.size();
        long pendientes = lista.stream().filter(p -> "PENDIENTE".equalsIgnoreCase(p.getEstado())).count();
        long proceso = lista.stream().filter(p -> "PROCESO".equalsIgnoreCase(p.getEstado())).count();
        long resueltas = lista.stream().filter(p -> "RESUELTO".equalsIgnoreCase(p.getEstado())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("pendientes", pendientes);
        stats.put("proceso", proceso);
        stats.put("resueltas", resueltas);

        return ResponseEntity.ok(stats);
    }
}