<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Configuración de Estados (H7)</h2>
    <div class="card p-4 bg-light mb-5 shadow-sm">
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          <div class="col-md-2">
            <label class="form-label fw-bold">ID (Ej: ACT_DR)</label>
            <input v-model="formulario.id" type="text" class="form-control" required :disabled="editando">
          </div>
          <div class="col-md-3">
            <label class="form-label fw-bold">Nombre</label>
            <input v-model="formulario.nombre" type="text" class="form-control" required>
          </div>
          <div class="col-md-3">
            <label class="form-label fw-bold">¿Permite Acceso?</label>
            <select v-model="formulario.permite_acceso" class="form-select">
              <option :value="true">SÍ</option>
              <option :value="false">NO</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label fw-bold">Descripción</label>
            <input v-model="formulario.descripcion" type="text" class="form-control">
          </div>
          <div class="col-md-2 d-flex gap-2">
            <button type="submit" class="btn w-100 fw-bold" :class="editando ? 'btn-warning' : 'btn-success'">
              {{ editando ? 'Actualizar' : 'Añadir' }}
            </button>
            <button v-if="editando" @click="limpiar" type="button" class="btn btn-secondary">X</button>
          </div>
        </div>
      </form>
    </div>
    <table class="table table-striped border text-center">
      <thead class="table-dark">
        <tr><th>ID</th><th>Nombre</th><th>Acceso</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        <tr v-for="estado in lista" :key="estado.id">
          <td>{{ estado.id }}</td><td>{{ estado.nombre }}</td>
          <td><span :class="estado.permite_acceso ? 'badge bg-success' : 'badge bg-danger'">{{ estado.permite_acceso ? 'SÍ' : 'NO' }}</span></td>
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
      lista: [], editando: false,
      formulario: { id: '', nombre: '', permite_acceso: true, descripcion: '', zusuario: 'david.romo' }
    };
  },
  async mounted() { await this.cargarLista(); },
  methods: {
    async cargarLista() { this.lista = await api.getAll('estados_usuario') || []; },
    async guardar() {
      if (this.editando) { await api.update('estados_usuario', this.formulario.id, this.formulario); }
      else { await api.create('estados_usuario', this.formulario); }
      this.limpiar();
      setTimeout(() => this.cargarLista(), 500);
    },
    prepararEdicion(datos) { this.formulario = { ...datos, zusuario: 'david.romo' }; this.editando = true; },
    limpiar() { this.formulario = { id: '', nombre: '', permite_acceso: true, descripcion: '', zusuario: 'david.romo' }; this.editando = false; },
    async eliminar(id) { if (confirm('¿Borrar?')) { await api.delete('estados_usuario', id); await this.cargarLista(); } }
  }
};
</script>