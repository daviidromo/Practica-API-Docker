<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Gestión de Turnos (H9)</h2>
    
    <div class="card p-4 bg-light mb-5 shadow-sm">
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          
          <div class="col-md-3">
            <label class="form-label fw-bold">ID (Ej: D_DR)</label>
            <input v-model="formulario.id" type="text" class="form-control" required :disabled="editando">
          </div>
          
          <div class="col-md-6">
            <label class="form-label fw-bold">Nombre del Turno</label>
            <input v-model="formulario.nombre" type="text" class="form-control" placeholder="Ej: Diurno" required>
          </div>
          
          <div class="col-md-3 d-flex gap-2">
            <button type="submit" class="btn w-100 fw-bold" :class="editando ? 'btn-warning' : 'btn-success'">
              {{ editando ? 'Actualizar' : 'Añadir' }}
            </button>
            <button v-if="editando" @click="limpiar" type="button" class="btn btn-secondary">X</button>
          </div>
        </div>
      </form>
    </div>
    
    <table class="table table-striped border">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="turno in listaTurnos" :key="turno.id">
          <td>{{ turno.id }}</td>
          <td>{{ turno.nombre }}</td>
          <td>
            <button @click="prepararEdicion(turno)" class="btn btn-warning btn-sm me-2">Editar</button>
            <button @click="eliminar(turno.id)" class="btn btn-danger btn-sm">Borrar</button>
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
      formulario: { id: '', nombre: '', zusuario: 'david.romo' }
    };
  },

  async mounted() { 
    // Cargamos la lista de turnos al iniciar el componente
    await this.cargarTurnos(); 
  },

  methods: {
    async cargarTurnos() { 
      try {
        // Obtenemos los turnos desde la base de datos
        this.listaTurnos = await api.getAll('turnos') || []; 
      } catch (error) {
        alert("Fallo en la bbdd al cargar los turnos");
      }
    },

    async guardar() {
      // Recortamos la fecha de registro si existe para prevenir el error 500 del servidor
      if (this.formulario.zfecha) {
        this.formulario.zfecha = this.formulario.zfecha.substring(0, 10);
      }

      try {
        // Comprobamos si estamos editando o creando un registro nuevo
        if (this.editando) { 
          await api.update('turnos', this.formulario.id, this.formulario); 
        } else { 
          await api.create('turnos', this.formulario); 
        }
        
        // Limpiamos el formulario y refrescamos los datos de la tabla
        this.limpiar();
        setTimeout(async () => { await this.cargarTurnos(); }, 500);
      } catch (error) {
        alert("Fallo en la bbdd al intentar guardar el turno");
      }
    },

    prepararEdicion(turno) { 
      // Volcamos los datos del turno seleccionado en el formulario superior
      this.formulario = { ...turno, zusuario: 'david.romo' }; 
      this.editando = true; 
    },

    limpiar() { 
      // Vaciamos las variables del formulario a su estado original
      this.formulario = { id: '', nombre: '', zusuario: 'david.romo' }; 
      this.editando = false; 
    },

    async eliminar(id) {
      // Pedimos confirmación obligatoria al usuario antes del borrado
      if (confirm('¿Seguro que quieres borrar este turno?')) { 
        try {
          await api.delete('turnos', id); 
          await this.cargarTurnos(); 
        } catch (error) {
          alert("Fallo en la bbdd al intentar eliminar el turno");
        }
      }
    }
  }
};
</script>