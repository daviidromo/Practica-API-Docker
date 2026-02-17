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
          
          <div class="col-md-4">
            <label class="form-label fw-bold">Nombre</label>
            <input v-model="formulario.nombre" type="text" class="form-control" placeholder="Ej: ESO" required>
          </div>

          <div class="col-md-5">
            <label class="form-label fw-bold">Descripción</label>
            <input v-model="formulario.descripcion" type="text" class="form-control" placeholder="Escribe una breve descripción">
          </div>
          
          <div class="col-md-3 d-flex gap-2">
            <button type="submit" class="btn w-100 fw-bold" :class="editando ? 'btn-warning' : 'btn-success'">
              <span v-if="editando">Actualizar</span>
              <span v-else>Añadir</span>
            </button>
            
            <button v-if="editando" @click="limpiarTodo" type="button" class="btn btn-secondary">
              X
            </button>
          </div>
        </div>
      </form>
    </div>

    <h5 class="mb-3">Etapas registradas</h5>
    <table class="table table-striped table-hover border">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre de la Etapa</th>
          <th>Descripción</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in listaEtapas" :key="item.id">
          <td>{{ item.id || 'N/A' }}</td>
          <td>{{ item.nombre }}</td>
          <td>{{ item.descripcion }}</td>
          <td>
            <button @click="prepararEdicion(item)" class="btn btn-warning btn-sm me-2">
              Editar
            </button>
            <button @click="eliminarEtapa(item.id)" class="btn btn-danger btn-sm">
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
      listaEtapas: [], 
      editando: false,
      formulario: {
        id: null,
        nombre: '',
        descripcion: ''
      }
    };
  },
  
  async mounted() {
    // Al cargar la página, pedimos los datos
    await this.cargarDatos();
  },

  methods: {
    async cargarDatos() {
      // Intentamos traer los datos del servidor
      const resultado = await api.getAll('etapas');
      
      // Si el servidor nos devuelve algo, lo guardamos
      if (resultado) {
        this.listaEtapas = resultado;
      }
    },

    async guardar() {
      // Hacemos una copia de los datos para trabajar con ellos
      let datosAEnviar = { ...this.formulario };

      if (this.editando) {
        // --- MODO EDITAR ---
        // Mandamos la actualización al servidor (H8 CA2)
        await api.update('etapas', datosAEnviar.id, datosAEnviar);
      } else {
        // --- MODO CREAR ---
        // Calculamos el ID más alto para el nuevo registro
        let idMasAlto = 0;
        for (let i = 0; i < this.listaEtapas.length; i++) {
          let idActual = parseInt(this.listaEtapas[i].id);
          // Si el ID no es un número (como el "" que tenías), lo ignoramos
          if (!isNaN(idActual) && idActual > idMasAlto) {
            idMasAlto = idActual;
          }
        }
        
        // El nuevo ID es el más alto + 1
        datosAEnviar.id = (idMasAlto + 1).toString();
        
        await api.create('etapas', datosAEnviar);      
      }
      
      this.limpiarTodo();
      
      // Esperamos un poquito y recargamos la lista
      setTimeout(async () => { 
        await this.cargarDatos(); 
      }, 500);
    },

    prepararEdicion(etapa) {
      // Ponemos los datos de la fila en el formulario de arriba
      this.formulario = { ...etapa };
      this.editando = true;
    },

    limpiarTodo() {
      // Vaciamos el formulario y volvemos al modo "Crear"
      this.formulario = { id: null, nombre: '', descripcion: '' };
      this.editando = false;
    },

    async eliminarEtapa(id) {
      if (confirm('¿Quieres eliminar esta etapa?')) {
        // El sistema no permitirá borrar si hay cursos vinculados (H8 CA1)
        const exito = await api.delete('etapas', id);
        
        if (exito) {
          await this.cargarDatos();
        } else {
          alert("Error: No se puede borrar. Comprueba si hay cursos usando esta etapa.");
        }
      }
    }
  }
};
</script>