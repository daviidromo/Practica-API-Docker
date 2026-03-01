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
          
          <div class="col-md-3">
            <label class="form-label fw-bold">ID (Ej: MAT_DR)</label>
            <input v-model="formulario.id" type="text" class="form-control" placeholder="ID único" required :disabled="estoyEditando">
          </div>

          <div class="col-md-6">
            <label class="form-label fw-bold">Nombre del Área (Ej: Matemáticas)</label>
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
        id: '',
        nombre: '',
        zusuario: 'david.romo' // FUNDAMENTAL: Tu firma para que la API te deje guardar
      }
    };
  },
  
  async mounted() {
    await this.cargarDatos();
  },

  methods: {
    async cargarDatos() {
      this.listaDeDepartamentos = await api.getAll('departamentos');
    },

    async guardar() {
      let datosParaEnviar = { ...this.formulario };

      if (this.estoyEditando) {
        // Modo Editar
        await api.update('departamentos', datosParaEnviar.id, datosParaEnviar);
      } else {
        // Modo Crear: Ya no calculamos el ID, mandamos el que has escrito en la casilla
        await api.create('departamentos', datosParaEnviar);      
      }
      
      this.limpiarPantalla();
      
      setTimeout(async () => { 
        await this.cargarDatos(); 
      }, 500);
    },

    prepararParaEditar(objeto) {
      // Cargamos los datos, asegurando que no se pierda el zusuario
      this.formulario = { ...objeto, zusuario: 'david.romo' };
      this.estoyEditando = true;
    },

    limpiarPantalla() {
      // Vaciamos pero mantenemos la firma
      this.formulario = { id: '', nombre: '', zusuario: 'david.romo' };
      this.estoyEditando = false;
    },

    async borrar(idABorrar) {
      if (confirm('¿Seguro que quieres eliminar este departamento?')) {
        let salioBien = await api.delete('departamentos', idABorrar);
        
        if (salioBien) {
          await this.cargarDatos();
        } else {
          alert("No se puede borrar porque hay profesores en este departamento.");
        }
      }
    }
  }
};
</script>