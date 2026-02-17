<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Gestión de Departamentos (H10)</h2>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">
        <span v-if="estoyEditando">Modificar Departamento</span>
        <span v-else>Crear nuevo Departamento</span>
      </h5>
      
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          
          <div class="col-md-9">
            <label class="form-label fw-bold">Nombre del Área (Ej: Informática)</label>
            <input v-model="formulario.nombre" type="text" class="form-control" placeholder="Escribe aquí el nombre..." required>
          </div>
          
          <div class="col-md-3 d-flex gap-2">
            <button type="submit" class="btn w-100 fw-bold" :class="estoyEditando ? 'btn-warning' : 'btn-success'">
              <span v-if="estoyEditando">Actualizar</span>
              <span v-else>Añadir</span>
            </button>
            
            <button v-if="estoyEditando" @click="limpiarPantalla" type="button" class="btn btn-secondary">
              X
            </button>
          </div>
        </div>
      </form>
    </div>

    <h5 class="mb-3">Departamentos actuales</h5>
    <table class="table table-striped table-hover border">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre del Departamento</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="dep in listaDeDepartamentos" :key="dep.id">
          <td>{{ dep.id }}</td>
          <td>{{ dep.nombre }}</td>
          <td>
            <button @click="prepararParaEditar(dep)" class="btn btn-warning btn-sm me-2">
              Editar
            </button>
            <button @click="borrar(dep.id)" class="btn btn-danger btn-sm">
              Borrar
            </button>
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
      listaDeDepartamentos: [], 
      estoyEditando: false,
      formulario: {
        id: null,
        nombre: ''
      }
    };
  },
  
  async mounted() {
    // Cargamos los datos al empezar
    await this.cargarDatos();
  },

  methods: {
    async cargarDatos() {
      // Pedimos la lista al servidor
      this.listaDeDepartamentos = await api.getAll('departamentos');
    },

    async guardar() {
      if (this.estoyEditando == true) {
        // Si estamos editando, actualizamos el que ya existe
        await api.update('departamentos', this.formulario.id, this.formulario);
      } else {
        // Si es nuevo, buscamos el ID más alto y le sumamos 1
        let elIdMasAlto = 0;
        for (let i = 0; i < this.listaDeDepartamentos.length; i++) {
          let idActual = parseInt(this.listaDeDepartamentos[i].id);
          if (idActual > elIdMasAlto) {
            elIdMasAlto = idActual;
          }
        }
        this.formulario.id = (elIdMasAlto + 1).toString();
        
        await api.create('departamentos', this.formulario);      
      }
      
      this.limpiarPantalla();
      
      // Esperamos un poco para que el servidor se actualice y recargamos la tabla
      setTimeout(async () => { 
        await this.cargarDatos(); 
      }, 500);
    },

    prepararParaEditar(objeto) {
      // Pasamos los datos de la fila al formulario de arriba
      this.formulario = { ...objeto };
      this.estoyEditando = true;
    },

    limpiarPantalla() {
      // Dejamos el formulario como nuevo
      this.formulario = { id: null, nombre: '' };
      this.estoyEditando = false;
    },

    async borrar(idABorrar) {
      if (confirm('¿Seguro que quieres eliminar este departamento?')) {
        let salioBien = await api.delete('departamentos', idABorrar);
        
        if (salioBien) {
          await this.cargarDatos();
        } else {
          // Si el servidor no deja borrarlo (porque tiene profes), avisamos
          alert("No se puede borrar porque hay profesores en este departamento.");
        }
      }
    }
  }
};
</script>