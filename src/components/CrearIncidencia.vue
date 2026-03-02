<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Reportar Incidencia</h2>

    <div v-if="incidenciasRecientesResueltas.length > 0" class="mb-5">
      <div v-for="alerta in incidenciasRecientesResueltas" :key="alerta.id" class="alert alert-success alert-dismissible shadow-sm border-success mb-3" role="alert">
        <h5 class="alert-heading fw-bold">Incidencia Resuelta (ID: {{ alerta.id }})</h5>
        <p>Tu avería reportada en el espacio <strong>{{ alerta.espacio_id }}</strong> ha sido solucionada por el equipo técnico.</p>
        <hr>
        <p class="mb-0"><strong>Solución técnica:</strong> {{ alerta.comentarios_resolucion }}</p>
        <button type="button" class="btn-close" @click="marcarComoLeida(alerta.id)" aria-label="Close"></button>
      </div>
    </div>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">Informar de una nueva avería</h5>
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          <div class="col-md-3">
            <label class="form-label fw-bold">Espacio Afectado</label>
            <select v-model="formulario.espacio_id" class="form-select" required>
              <option value="" disabled>Selecciona...</option>
              <option v-for="espacio in listaEspacios" :key="espacio.id" :value="espacio.id">
                {{ espacio.nombre }}
              </option>
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
      loginUsuario: localStorage.getItem('usuario_login') || '',
      
      // cargamos las alertas que el usuario ya cerro
      alertasOcultas: JSON.parse(localStorage.getItem('alertas_ocultas')) || [],
      
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
    listaMisIncidencias() {
      if (!this.loginUsuario) return [];
      return this.listaIncidenciasTotales.filter(incidencia => incidencia.usuario_login === this.loginUsuario);
    },
    // busca incidencias resueltas que aun no se hayan descartado
    incidenciasRecientesResueltas() {
      return this.listaMisIncidencias.filter(incidencia => 
        incidencia.estado_incidencia_id === 'RESUEL_DR' && 
        !this.alertasOcultas.includes(incidencia.id)
      );
    }
  },

  async mounted() { 
    await this.cargarTodo(); 
    this.formulario.usuario_login = this.loginUsuario;
  },

  methods: {
    async cargarTodo() {
      try {
        this.listaIncidenciasTotales = await api.getAll('incidencias') || [];
        this.listaEspacios = await api.getAll('espacios') || [];
        this.listaUsuarios = await api.getAll('usuarios') || [];
        this.listaAlumnos = await api.getAll('alumnos') || [];
      } catch (error) {
        alert("Fallo en la bbdd al cargar los datos");
      }
    },
    
    // esconde la alerta y guarda su id en la memoria del navegador
    marcarComoLeida(id_incidencia) {
      this.alertasOcultas.push(id_incidencia);
      localStorage.setItem('alertas_ocultas', JSON.stringify(this.alertasOcultas));
    },

    formatearFecha(fechaOriginal) {
      if (!fechaOriginal) return '';
      if (fechaOriginal.includes('T') || fechaOriginal.includes('-')) {
        let partes = fechaOriginal.substring(0, 10).split('-');
        if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      return fechaOriginal;
    },
    
    async guardar() {
      this.mensajeBloqueo = '';
      this.formulario.usuario_login = this.loginUsuario;

      const usuarioActual = this.listaUsuarios.find(usuario => usuario.login === this.loginUsuario);

      // revisamos si el alumno tiene permisos para reportar averias
      if (usuarioActual && usuarioActual.rol_id === 'ALUM_DR') {
        const alumnoRevisar = this.listaAlumnos.find(alumno => alumno.nia === usuarioActual.ref_identidad_fk);
        if (alumnoRevisar && alumnoRevisar.estado_id !== 'ACT_DR') {
          this.mensajeBloqueo = `Acceso denegado: No tienes permisos por estar en estado ${alumnoRevisar.estado_id}.`;
          alert("Fallo de permisos: cuenta inactiva");
          return;
        }
      }

      try {
        await api.create('incidencias', this.formulario);
        
        this.formulario.descripcion_problema = '';
        this.formulario.espacio_id = '';
        
        setTimeout(async () => { await this.cargarTodo(); }, 500);
      } catch (error) {
        alert("Fallo en la bbdd al insertar la incidencia");
      }
    }
  }
};
</script>