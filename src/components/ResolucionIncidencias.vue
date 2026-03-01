<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-warning mb-4">Resolución Técnica de Incidencias</h2>

    <div v-if="estoyEditando" class="card p-4 border-warning mb-5 shadow-sm">
      <h5 class="mb-3">Resolviendo avería en {{ formulario.espacio_id }} reportada por {{ formulario.usuario_login }}</h5>
      <p class="text-muted mb-4"><strong>Problema:</strong> {{ formulario.descripcion_problema }}</p>

      <form @submit.prevent="guardarResolucion">
        <div class="row g-3 align-items-end">

          <div class="col-md-3">
            <label class="form-label fw-bold">Cambiar Estado</label>
            <select v-model="formulario.estado_incidencia_id" class="form-select" required>
              <option v-for="estado in listaEstadosIncidencia" :key="estado.id" :value="estado.id">
                {{ estado.nombre }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">Responsable TIC</label>
            <select v-if="rolUsuario === 'ADMIN_DR'" v-model="formulario.responsable_resolucion_id" class="form-select">
              <option value="">-- Sin asignar --</option>
              <option v-for="usuario in usuariosTic" :key="usuario.login" :value="usuario.login">
                {{ usuario.login }}
              </option>
            </select>
            <input v-else v-model="formulario.responsable_resolucion_id" type="text" class="form-control" readonly disabled>
          </div>

          <div class="col-md-6">
            <label class="form-label fw-bold">Comentarios de Resolución (Obligatorio si Resuelves)</label>
            <input v-model="formulario.comentarios_resolucion" type="text" class="form-control" placeholder="Ej: Se ha reparado el cable de red">
          </div>
          
          <div class="col-md-12 mt-3 d-flex justify-content-end gap-2">
            <button type="submit" class="btn btn-warning fw-bold px-4">Guardar Cambios</button>
            <button @click="cancelar" type="button" class="btn btn-secondary px-4">Cancelar</button>
          </div>
        </div>
      </form>
    </div>

    <h5 class="mb-3">Visión Global del Centro</h5>
    <table class="table table-striped table-hover border text-center">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Espacio</th>
          <th class="text-start">Descripción</th>
          <th>Reportador</th>
          <th>Estado</th>
          <th>TIC Asignado</th>
          <th>F. Resolución</th>
          <th>Fecha Reporte</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="incidencia in listaIncidencias" :key="incidencia.id">
          <td>{{ incidencia.id }}</td>
          <td><span class="badge bg-secondary">{{ incidencia.espacio_id }}</span></td>
          <td class="text-start">{{ incidencia.descripcion_problema }}</td>
          <td><strong>{{ incidencia.usuario_login }}</strong></td>
          <td>
            <span v-if="incidencia.estado_incidencia_id === 'ABIERTA_DR'" class="badge bg-danger">ABIERTA</span>
            <span v-else-if="incidencia.estado_incidencia_id === 'PROCESO_DR'" class="badge bg-warning text-dark">EN PROCESO</span>
            <span v-else-if="incidencia.estado_incidencia_id === 'RESUEL_DR'" class="badge bg-success">RESUELTA</span>
            <span v-else class="badge bg-info">{{ incidencia.estado_incidencia_id }}</span>
          </td>
          <td>{{ incidencia.responsable_resolucion_id || '-' }}</td>
          <td><span class="badge bg-light text-dark border">{{ formatearFecha(incidencia.fecha_resolucion) || 'Pendiente' }}</span></td>
          <td><span class="badge bg-light text-dark border">{{ formatearFecha(incidencia.zfecha) || 'Desconocida' }}</span></td>
          <td>
            <button @click="cargarDatos(incidencia)" class="btn btn-warning btn-sm me-1">Gestionar</button>
            <button v-if="rolUsuario === 'ADMIN_DR'" @click="borrar(incidencia.id)" class="btn btn-dark btn-sm">Borrar</button>
          </td>
        </tr>
        <tr v-if="listaIncidencias.length === 0">
          <td colspan="9" class="text-center py-3">No hay averías activas en el sistema.</td>
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
      listaIncidencias: [],
      listaUsuarios: [],
      listaEstadosIncidencia: [],
      estoyEditando: false,
      loginUsuario: localStorage.getItem('usuario_login') || '',
      rolUsuario: localStorage.getItem('rol_id') || '',
      formulario: {}
    };
  },
  
  computed: {
    // Filtramos la lista de usuarios para que el Admin solo pueda asignar incidencias a perfiles TIC (o a sí mismo)
    usuariosTic() {
      return this.listaUsuarios.filter(u => u.rol_id === 'TIC_DR' || u.rol_id === 'ADMIN_DR');
    }
  },

  async mounted() {
    await this.cargarTodo();
  },

  methods: {
    async cargarTodo() {
      this.listaIncidencias = await api.getAll('incidencias') || [];
      this.listaUsuarios = await api.getAll('usuarios') || [];
      this.listaEstadosIncidencia = await api.getAll('estados_incidencia') || [];
    },

    formatearFecha(fechaOriginal) {
      if (!fechaOriginal) return '';
      if (fechaOriginal.includes('T') || fechaOriginal.includes('-')) {
        let p = fechaOriginal.substring(0, 10).split('-');
        if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
      }
      return fechaOriginal;
    },

    async guardarResolucion() {
      let esResuelta = this.formulario.estado_incidencia_id === 'RESUEL_DR';

      if (esResuelta) {
        if (!this.formulario.comentarios_resolucion || this.formulario.comentarios_resolucion.trim() === '') {
          alert("Error: No puedes marcar una incidencia como RESUELTA sin escribir cómo la has solucionado.");
          return;
        }
        // Si no tiene responsable asignado al resolverla, forzamos el login del usuario actual
        if (!this.formulario.responsable_resolucion_id) {
          this.formulario.responsable_resolucion_id = this.loginUsuario;
        }
      }

      let datosParaEnviar = { ...this.formulario };
      
      if (datosParaEnviar.responsable_resolucion_id === '') datosParaEnviar.responsable_resolucion_id = null;
      if (datosParaEnviar.comentarios_resolucion === '') datosParaEnviar.comentarios_resolucion = null;

      // AUTOGENERAR FECHA DE RESOLUCIÓN SI ESTÁ RESUELTA
      if (esResuelta) {
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        datosParaEnviar.fecha_resolucion = `${año}-${mes}-${dia}`;
      } else {
        // Si la vuelven a poner EN PROCESO, quitamos la fecha de resolución
        datosParaEnviar.fecha_resolucion = null;
      }

      // Limpieza de zfecha para evitar Error 500
      if (datosParaEnviar.zfecha) datosParaEnviar.zfecha = datosParaEnviar.zfecha.substring(0, 10);

      await api.update('incidencias', datosParaEnviar.id, datosParaEnviar);
      
      this.cancelar(); 
      setTimeout(async () => { await this.cargarTodo(); }, 500);
    },

    cargarDatos(incidencia) {
      this.formulario = { ...incidencia, zusuario: 'david.romo' };
      
      // Auto-asignamos el login del TIC que abre la incidencia si nadie la tenía asignada aún
      if (this.rolUsuario === 'TIC_DR' && !this.formulario.responsable_resolucion_id) {
        this.formulario.responsable_resolucion_id = this.loginUsuario;
      } else if (!this.formulario.responsable_resolucion_id) {
        this.formulario.responsable_resolucion_id = '';
      }

      if (!this.formulario.comentarios_resolucion) this.formulario.comentarios_resolucion = '';
      this.estoyEditando = true; 
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    cancelar() {
      this.formulario = {};
      this.estoyEditando = false;
    },

    async borrar(id) {
      // Doble validación de seguridad por si acaso
      if (this.rolUsuario !== 'ADMIN_DR') {
        alert("Operación denegada. Solo los administradores pueden borrar registros históricos.");
        return;
      }

      if (confirm('Atención: ¿Quieres borrar definitivamente esta incidencia de la base de datos?')) {
        await api.delete('incidencias', id);
        await this.cargarTodo();
      }
    }
  }
};
</script>