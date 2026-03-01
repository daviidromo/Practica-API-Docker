<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Reportar Incidencia</h2>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">Informar de una nueva avería</h5>
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          <div class="col-md-3">
            <label class="form-label fw-bold">Espacio Afectado</label>
            <select v-model="formulario.espacio_id" class="form-select" required>
              <option value="" disabled>Selecciona...</option>
              <option v-for="e in listaEspacios" :key="e.id" :value="e.id">{{ e.nombre }}</option>
            </select>
          </div>
          
          <div class="col-md-3">
            <label class="form-label fw-bold">Tu Login</label>
            <input v-model="formulario.usuario_login" type="text" class="form-control" readonly disabled>
          </div>

          <div class="col-md-4">
            <label class="form-label fw-bold">Descripción del Problema</label>
            <input v-model="formulario.descripcion_problema" type="text" class="form-control" required>
          </div>
          <div class="col-md-2 d-flex justify-content-end">
            <button type="submit" class="btn btn-danger fw-bold w-100">Reportar</button>
          </div>
        </div>
      </form>
    </div>

    <div v-if="mensajeBloqueo" class="alert alert-warning border-warning shadow-sm mb-4">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <strong>Aviso de Seguridad:</strong> {{ mensajeBloqueo }}
    </div>

    <h5 class="mb-3">Mis Incidencias Reportadas</h5>
    <table class="table table-striped table-hover border text-center">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Espacio</th>
          <th>Descripción</th>
          <th>Estado</th>
          <th>Solución Técnica</th>
          <th>F. Resolución</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="incidencia in listaMisIncidencias" :key="incidencia.id">
          <td>{{ incidencia.id }}</td>
          <td><span class="badge bg-secondary">{{ incidencia.espacio_id }}</span></td>
          <td class="text-start">{{ incidencia.descripcion_problema }}</td>
          <td>
            <span v-if="incidencia.estado_incidencia_id === 'ABIERTA_DR'" class="badge bg-danger">ABIERTA</span>
            <span v-else-if="incidencia.estado_incidencia_id === 'PROCESO_DR'" class="badge bg-warning text-dark">EN PROCESO</span>
            <span v-else-if="incidencia.estado_incidencia_id === 'RESUEL_DR'" class="badge bg-success">RESUELTA</span>
            <span v-else class="badge bg-info">{{ incidencia.estado_incidencia_id }}</span>
          </td>
          <td>{{ incidencia.comentarios_resolucion || 'Pendiente de revisión' }}</td>
          <td><span class="badge bg-light text-dark border">{{ formatearFecha(incidencia.fecha_resolucion) || 'Pendiente' }}</span></td>
        </tr>
        <tr v-if="listaMisIncidencias.length === 0">
          <td colspan="6" class="text-center">No has reportado ninguna incidencia todavía.</td>
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
      listaIncidenciasTotales: [], 
      listaEspacios: [], 
      listaUsuarios: [], 
      listaAlumnos: [],
      mensajeBloqueo: '',
      // Extraemos el usuario logueado de la memoria del navegador
      loginUsuario: localStorage.getItem('usuario_login') || '',
      formulario: { 
        descripcion_problema: '', 
        espacio_id: '', 
        usuario_login: localStorage.getItem('usuario_login') || '', 
        estado_incidencia_id: 'ABIERTA_DR', 
        zusuario: 'david.romo' 
      }
    };
  },
  computed: {
    // CAMBIO: Filtramos para que devuelva solo las del login del usuario activo
    listaMisIncidencias() {
      if (!this.loginUsuario) return [];
      return this.listaIncidenciasTotales.filter(inc => inc.usuario_login === this.loginUsuario);
    }
  },
  async mounted() { 
    await this.cargarTodo(); 
    this.formulario.usuario_login = this.loginUsuario;
  },
  methods: {
    async cargarTodo() {
      this.listaIncidenciasTotales = await api.getAll('incidencias') || [];
      this.listaEspacios = await api.getAll('espacios') || [];
      this.listaUsuarios = await api.getAll('usuarios') || [];
      this.listaAlumnos = await api.getAll('alumnos') || [];
    },
    formatearFecha(f) {
      if (!f) return '';
      if (f.includes('T') || f.includes('-')) {
        let p = f.substring(0, 10).split('-');
        if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
      }
      return f;
    },
    async guardar() {
      this.mensajeBloqueo = '';
      
      // Aseguramos que el login que se envía sea estrictamente el conectado
      this.formulario.usuario_login = this.loginUsuario;

      const u = this.listaUsuarios.find(x => x.login === this.loginUsuario);

      if (u && u.rol_id === 'ALUM_DR') {
        const alumno = this.listaAlumnos.find(a => a.nia === u.ref_identidad_fk);
        if (alumno && alumno.estado_id !== 'ACT_DR') {
          this.mensajeBloqueo = `Acceso denegado: No tienes permisos por estar en estado ${alumno.estado_id}.`;
          alert("Los alumnos bloqueados o de baja no pueden crear incidencias.");
          return;
        }
      }

      await api.create('incidencias', this.formulario);
      
      // Limpiamos los campos del formulario tras guardar con éxito
      this.formulario.descripcion_problema = '';
      this.formulario.espacio_id = '';
      
      setTimeout(async () => { await this.cargarTodo(); }, 500);
    }
  }
};
</script>