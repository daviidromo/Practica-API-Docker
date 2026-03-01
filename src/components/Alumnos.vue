<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Gestión de Alumnos</h2>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">
        <span v-if="estoyEditando">Modificar Alumno (NIA: {{ formulario.nia }})</span>
        <span v-else>Alta de Nuevo Alumno</span>
      </h5>
      
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          <div class="col-md-2">
            <label class="form-label fw-bold">NIA</label>
            <input v-model="formulario.nia" type="text" class="form-control" placeholder="Ej: 22222222D" required :disabled="estoyEditando">
          </div>
          <div class="col-md-3">
            <label class="form-label fw-bold">Nombre</label>
            <input v-model="formulario.nombre" type="text" class="form-control" required>
          </div>
          <div class="col-md-4">
            <label class="form-label fw-bold">Apellidos</label>
            <input v-model="formulario.apellidos" type="text" class="form-control" required>
          </div>
          <div class="col-md-3">
            <label class="form-label fw-bold">Curso ID</label>
            <select v-model="formulario.curso_id" class="form-select" required>
              <option value="" disabled>Selecciona un curso...</option>
              <option v-for="curso in listaCursos" :key="curso.id" :value="curso.id">{{ curso.nombre || curso.id }}</option>
            </select>
          </div>
          <div class="col-md-4 mt-3">
            <label class="form-label fw-bold">Correo Electrónico</label>
            <input v-model="formulario.correo_electronico" type="email" class="form-control" placeholder="alumno@ies.es" required>
          </div>
          <div class="col-md-3 mt-3">
            <label class="form-label fw-bold">Teléfono Tutor</label>
            <input v-model="formulario.tutor_legal_contacto" type="text" class="form-control" required>
          </div>
          <div class="col-md-2 mt-3">
            <label class="form-label fw-bold">Estado</label>
            <select v-model="formulario.estado_id" class="form-select" required>
              <option value="ACT_DR">Activo</option>
              <option value="BAJA_DR">De Baja</option>
              <option value="BLOQ_DR">Bloqueado</option>
            </select>
          </div>
          <div class="col-md-3 mt-3 d-flex justify-content-end gap-2">
            <button type="submit" class="btn fw-bold px-4 w-100" :class="estoyEditando ? 'btn-warning' : 'btn-success'">
              {{ estoyEditando ? 'Actualizar' : 'Registrar Alumno' }}
            </button>
            <button v-if="estoyEditando" @click="cancelar" type="button" class="btn btn-secondary px-3">X</button>
          </div>
        </div>
      </form>
    </div>

    <div class="mb-3 w-50">
      <input v-model="textoBuscador" type="text" class="form-control border-primary" placeholder="Buscar por NIA, Apellido o Curso...">
    </div>

    <table class="table table-striped table-hover border">
      <thead class="table-dark">
        <tr>
          <th>NIA</th>
          <th>Nombre y Apellidos</th>
          <th>Curso</th>
          <th>Correo</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="alumno in alumnosFiltrados" :key="alumno.nia">
          <td><span class="badge bg-secondary">{{ alumno.nia }}</span></td>
          <td>{{ alumno.nombre }} {{ alumno.apellidos }}</td>
          <td>{{ alumno.curso_id }}</td>
          <td>{{ alumno.correo_electronico }}</td>
          <td>
            <span v-if="alumno.estado_id === 'ACT_DR'" class="badge bg-success">Activo</span>
            <span v-else-if="alumno.estado_id === 'BAJA_DR'" class="badge bg-danger">De Baja</span>
            <span v-else-if="alumno.estado_id === 'BLOQ_DR'" class="badge bg-warning text-dark">Bloqueado</span>
            <span v-else class="badge bg-secondary">{{ alumno.estado_id }}</span>
          </td>
          <td>
            <button @click="cargarDatos(alumno)" class="btn btn-warning btn-sm me-2">Editar</button>
            <button @click="borrar(alumno.nia)" class="btn btn-danger btn-sm">Borrar</button>
          </td>
        </tr>
        <tr v-if="alumnosFiltrados.length === 0">
          <td colspan="6" class="text-center">No se han encontrado alumnos.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  data() {
    return {
      listaAlumnos: [], listaCursos: [], estoyEditando: false, textoBuscador: '',
      formulario: { nia: '', nombre: '', apellidos: '', curso_id: '', correo_electronico: '', tutor_legal_contacto: '', estado_id: 'ACT_DR', zusuario: 'david.romo' }
    };
  },
  computed: {
    alumnosFiltrados() {
      if (!this.textoBuscador) return this.listaAlumnos;
      const b = this.textoBuscador.toLowerCase();
      return this.listaAlumnos.filter(a => 
        String(a.nia).toLowerCase().includes(b) || 
        a.apellidos.toLowerCase().includes(b) || 
        String(a.curso_id).toLowerCase().includes(b)
      );
    }
  },
  async mounted() { await this.cargarTodo(); },
  methods: {
    async cargarTodo() {
      this.listaAlumnos = await api.getAll('alumnos') || [];
      this.listaCursos = await api.getAll('cursos') || [];
    },
    async guardar() {
      let datosParaEnviar = { ...this.formulario };
      if (datosParaEnviar.zfecha) datosParaEnviar.zfecha = datosParaEnviar.zfecha.substring(0, 10);

      try {
        if (this.estoyEditando) {
          // 1. Actualizamos al Alumno
          await api.update('alumnos', datosParaEnviar.nia, datosParaEnviar);

          // 2. SINCRONIZACIÓN: Buscamos su usuario para cambiarle el estado también
          let todosUsuarios = await api.getAll('usuarios') || [];
          let usuarioVinculado = todosUsuarios.find(u => u.ref_identidad_fk === datosParaEnviar.nia);
          
          if (usuarioVinculado) {
            usuarioVinculado.estado_id = datosParaEnviar.estado_id;
            // Limpieza de fechas para evitar Error 500 en Usuarios
            if (usuarioVinculado.zfecha) usuarioVinculado.zfecha = usuarioVinculado.zfecha.substring(0, 10);
            if (usuarioVinculado.ultimo_acceso) usuarioVinculado.ultimo_acceso = usuarioVinculado.ultimo_acceso.substring(0, 10);
            
            await api.update('usuarios', usuarioVinculado.login, usuarioVinculado);
          }
        } else {
          // ALTA NUEVA (se mantiene igual)
          await api.create('alumnos', datosParaEnviar);
          let loginGen = `${datosParaEnviar.nombre.toLowerCase()}.${datosParaEnviar.apellidos.toLowerCase().replace(/\s/g, '')}`;
          await api.create('usuarios', { 
            login: loginGen, password_hash: '1234', rol_id: 'ALUM_DR', 
            ref_identidad_fk: datosParaEnviar.nia, estado_id: 'ACT_DR', zusuario: 'david.romo' 
          });
        }
        this.cancelar();
        setTimeout(async () => { await this.cargarTodo(); }, 500);
      } catch (error) {
        console.error("Error en la sincronización:", error);
      }
    },
    
    cargarDatos(alumno) { this.formulario = { ...alumno, zusuario: 'david.romo' }; this.estoyEditando = true; window.scrollTo({ top: 0, behavior: 'smooth' }); },
    cancelar() { this.formulario = { nia: '', nombre: '', apellidos: '', curso_id: '', correo_electronico: '', tutor_legal_contacto: '', estado_id: 'ACT_DR', zusuario: 'david.romo' }; this.estoyEditando = false; },
    async borrar(nia) { if (confirm('¿Seguro que quieres borrar a este alumno?')) { await api.delete('alumnos', nia); await this.cargarTodo(); } }
  }
};
</script>