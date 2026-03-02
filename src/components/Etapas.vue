<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Gestión de Etapas Educativas (H8)</h2>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">
        <span v-if="editando">Modificar esta Etapa</span>
        <span v-else>Crear una Etapa nueva</span>
      </h5>
      
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          
          <div class="col-md-3">
            <label class="form-label fw-bold">ID (Ej: ESO_DR)</label>
            <input v-model="formulario.id" type="text" class="form-control" required :disabled="editando">
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">Nombre</label>
            <input v-model="formulario.nombre" type="text" class="form-control" placeholder="Ej: ESO" required>
          </div>

          <div class="col-md-4">
            <label class="form-label fw-bold">Descripción</label>
            <input v-model="formulario.descripcion" type="text" class="form-control">
          </div>
          
          <div class="col-md-2 d-flex gap-2">
            <button type="submit" class="btn w-100 fw-bold" :class="editando ? 'btn-warning' : 'btn-success'">
              {{ editando ? 'Actualizar' : 'Registrar' }}
            </button>
            <button v-if="editando" @click="limpiarTodo" type="button" class="btn btn-secondary">X</button>
          </div>
        </div>
      </form>
    </div>

    <h5 class="mb-3">Etapas Definidas</h5>
    <table class="table table-striped table-hover border text-center">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in listaEtapas" :key="item.id">
          <td><span class="badge bg-secondary">{{ item.id }}</span></td>
          <td>{{ item.nombre }}</td>
          <td>{{ item.descripcion }}</td>
          <td>
            <button @click="prepararEdicion(item)" class="btn btn-warning btn-sm me-2">Editar</button>
            <button @click="eliminarEtapa(item.id)" class="btn btn-danger btn-sm">Borrar</button>
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
      listaEtapas: [], 
      listaCursos: [], 
      editando: false,
      formulario: { id: '', nombre: '', descripcion: '', zusuario: 'david.romo' }
    };
  },

  async mounted() { 
    // al cargar la pantalla traemos los datos de la bbdd
    await this.cargarDatos(); 
  },

  methods: {
    async cargarDatos() { 
      try {
        // obtenemos etapas y cursos para las validaciones
        this.listaEtapas = await api.getAll('etapas') || []; 
        this.listaCursos = await api.getAll('cursos') || [];
      } catch (error) {
        alert("Fallo en la bbdd al cargar las listas");
      }
    },

    async guardar() {
      // preparamos los datos y limpiamos la fecha para evitar el error 500
      let datos = { ...this.formulario };
      if (datos.zfecha) {
        datos.zfecha = datos.zfecha.substring(0, 10);
      }

      try {
        if (this.editando) {
          // actualizamos la etapa existente
          await api.update('etapas', datos.id, datos);
        } else {
          // creamos una etapa nueva
          await api.create('etapas', datos);      
        }
        
        this.limpiarTodo();
        await this.cargarDatos();
      } catch (error) {
        alert("Fallo en la bbdd al intentar guardar la etapa");
      }
    },

    prepararEdicion(etapa) {
      // volcamos los datos de la tabla al formulario
      this.formulario = { ...etapa, zusuario: 'david.romo' };
      this.editando = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    limpiarTodo() {
      // reseteamos el formulario a su estado inicial
      this.formulario = { id: '', nombre: '', descripcion: '', zusuario: 'david.romo' };
      this.editando = false;
    },

    async eliminarEtapa(id) {
      // comprobamos que no existan cursos vinculados antes de borrar
      const tieneCursos = this.listaCursos.some(curso => curso.etapa_id === id);

      if (tieneCursos) {
        alert(`No se puede eliminar la etapa '${id}' porque existen cursos asociados a ella.`);
        return;
      }

      if (confirm(`¿Estás seguro de que deseas eliminar la etapa ${id}?`)) {
        try {
          // borramos el registro de la bbdd
          await api.delete('etapas', id);
          await this.cargarDatos();
        } catch (error) {
          alert("Fallo en la bbdd al intentar borrar la etapa");
        }
      }
    }
  }
};
</script>