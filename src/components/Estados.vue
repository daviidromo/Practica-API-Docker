<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Configuración de Estados (H7)</h2>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">
        <span v-if="editando">Modificar este Estado</span>
        <span v-else>Crear un Estado nuevo</span>
      </h5>
      
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          
          <div class="col-md-4">
            <label class="form-label fw-bold">Nombre (Ej: Activo)</label>
            <input v-model="formulario.nombre" type="text" class="form-control" required>
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">¿Permite Acceso?</label>
            <select v-model="formulario.permite_acceso" class="form-select">
              <option :value="true">SÍ - Puede entrar</option>
              <option :value="false">NO - Acceso denegado</option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">Descripción</label>
            <input v-model="formulario.descripcion" type="text" class="form-control">
          </div>
          
          <div class="col-md-2 d-flex gap-2 justify-content-end">
            <button type="submit" class="btn fw-bold px-4" :class="editando ? 'btn-warning' : 'btn-success'">
              <span v-if="editando">Actualizar</span>
              <span v-else>Añadir</span>
            </button>
            <button v-if="editando" @click="limpiar" type="button" class="btn btn-secondary">X</button>
          </div>
        </div>
      </form>
    </div>

    <h5 class="mb-3">Estados definidos</h5>
    <table class="table table-striped table-hover border">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Estado</th>
          <th>Acceso</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="lista.length === 0">
          <td colspan="4" class="text-center">No hay datos o el servidor no responde</td>
        </tr>
        <tr v-for="estado in lista" :key="estado.id">
          <td>{{ estado.id }}</td>
          <td>{{ estado.nombre }}</td>
          <td>
            <span v-if="estado.permite_acceso" class="badge bg-success">Permitido</span>
            <span v-else class="badge bg-danger">Prohibido</span>
          </td>
          <td>
            <button @click="prepararEdicion(estado)" class="btn btn-warning btn-sm me-2">Editar</button>
            <button @click="eliminar(estado.id)" class="btn btn-danger btn-sm">Borrar</button>
          </td>
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
      lista: [],
      editando: false,
      formulario: { id: null, nombre: '', permite_acceso: true, descripcion: '' }
    };
  },
  async mounted() {
    await this.cargarLista();
  },
  methods: {
    async cargarLista() {
      try {
        // Usamos siempre 'estados_usuario'
        const res = await api.getAll('estados_usuario');
        this.lista = res || [];
      } catch (e) {
        console.error("Error al cargar:", e);
        this.lista = [];
      }
    },

    async guardar() {
      try {
        let datos = { ...this.formulario };

        if (this.editando) {
          // CAMBIADO: 'estados_usuario' en lugar de 'estados'
          await api.update('estados_usuario', datos.id, datos);
        } else {
          let maxId = 0;
          this.lista.forEach(item => {
            let idNum = parseInt(item.id);
            if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
          });
          datos.id = (maxId + 1).toString();
          
          // CAMBIADO: 'estados_usuario' en lugar de 'estados'
          await api.create('estados_usuario', datos);
        }
        this.limpiar();
        setTimeout(() => this.cargarLista(), 500);
      } catch (e) {
        alert("Error al guardar. Verifica que el nombre 'estados_usuario' sea el correcto.");
      }
    },

    prepararEdicion(datos) {
      this.formulario = { ...datos };
      this.editando = true;
    },

    limpiar() {
      this.formulario = { id: null, nombre: '', permite_acceso: true, descripcion: '' };
      this.editando = false;
    },

    async eliminar(id) {
      if (confirm('¿Borrar?')) {
        // CAMBIADO: 'estados_usuario' en lugar de 'estados'
        await api.delete('estados_usuario', id);
        await this.cargarLista();
      }
    }
  }
};
</script>