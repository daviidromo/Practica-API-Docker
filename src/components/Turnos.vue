<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Gestión de Turnos (H9)</h2>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">
        <span v-if="editando">Modificar nombre del Turno</span>
        <span v-else>Crear nuevo Turno (Mañana, Tarde...)</span>
      </h5>
      
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          
          <div class="col-md-9">
            <label class="form-label fw-bold">Nombre del Turno</label>
            <input v-model="formulario.nombre" type="text" class="form-control" placeholder="Ej: Mañana" required>
          </div>
          
          <div class="col-md-3 d-flex gap-2">
            <button type="submit" class="btn w-100 fw-bold" :class="editando ? 'btn-warning' : 'btn-success'">
              <span v-if="editando">Actualizar</span>
              <span v-else>Añadir</span>
            </button>
            
            <button v-if="editando" @click="limpiar" type="button" class="btn btn-secondary">
              X
            </button>
          </div>
        </div>
      </form>
    </div>

    <h5 class="mb-3">Turnos registrados</h5>
    <table class="table table-striped table-hover border">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre del Turno</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="turno in listaTurnos" :key="turno.id">
          <td>{{ turno.id }}</td>
          <td>{{ turno.nombre }}</td>
          <td>
            <button @click="prepararEdicion(turno)" class="btn btn-warning btn-sm me-2">
              Editar
            </button>

            <button @click="eliminar(turno.id)" class="btn btn-danger btn-sm">
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
      listaTurnos: [], 
      editando: false,
      formulario: {
        id: null,
        nombre: ''
      }
    };
  },
  
  async mounted() {
    // Cargamos los turnos nada más entrar
    await this.cargarTurnos();
  },

  methods: {
    async cargarTurnos() {
      this.listaTurnos = await api.getAll('turnos');
    },

    async guardar() {
      if (this.editando) {
        // Si estamos editando, actualizamos el nombre
        await api.update('turnos', this.formulario.id, this.formulario);
      } else {
        // Si es nuevo, buscamos el ID más alto para sumar 1
        let idMasAlto = 0;
        for (let i = 0; i < this.listaTurnos.length; i++) {
          let idActual = parseInt(this.listaTurnos[i].id);
          if (idActual > idMasAlto) {
            idMasAlto = idActual;
          }
        }
        this.formulario.id = (idMasAlto + 1).toString();
        
        await api.create('turnos', this.formulario);      
      }
      
      this.limpiar();
      // Refrescamos la lista después de un pequeño tiempo
      setTimeout(async () => { await this.cargarTurnos(); }, 500);
    },

    prepararEdicion(turno) {
      this.formulario = { ...turno };
      this.editando = true;
    },

    limpiar() {
      this.formulario = { id: null, nombre: '' };
      this.editando = false;
    },

    async eliminar(id) {
      if (confirm('¿Seguro que quieres borrar este turno?')) {
        // Intentamos borrar (CA1: El servidor fallará si hay cursos usándolo) 
        let exito = await api.delete('turnos', id);
        
        if (exito) {
          await this.cargarTurnos();
        } else {
          // Si no se puede borrar por tener cursos activos 
          alert("No se puede borrar el turno porque hay cursos asignados a este horario.");
        }
      }
    }
  }
};
</script>