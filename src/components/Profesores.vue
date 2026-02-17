<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Gestión de Profesores (H3)</h2>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">
        <span v-if="esEdicion">Editar Profesor</span>
        <span v-else>Alta de Nuevo Profesor</span>
      </h5>
      
      <form @submit.prevent="guardarProfesor">
        <div class="row g-3 align-items-end">
          
          <div class="col-md-2">
            <label class="form-label fw-bold">DNI/NIE</label>
            <input v-model="datosFormulario.dni_nie" type="text" class="form-control" placeholder="DNI" required :disabled="esEdicion">
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Nombre</label>
            <input v-model="datosFormulario.nombre" type="text" class="form-control" required>
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">Apellidos</label>
            <input v-model="datosFormulario.apellidos" type="text" class="form-control" required>
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">Correo Institucional</label>
            <input v-model="datosFormulario.correo_institucional" type="email" class="form-control" required>
          </div>
          
          <div class="col-md-2 d-flex gap-2">
            <button type="submit" class="btn w-100 fw-bold" :class="esEdicion ? 'btn-warning' : 'btn-success'">
              <span v-if="esEdicion">Actualizar</span>
              <span v-else>Crear</span>
            </button>
            
            <button v-if="esEdicion" @click="cancelar" type="button" class="btn btn-secondary">
              X
            </button>
          </div>
        </div>
      </form>
    </div>

    <h5 class="mb-3">Listado Actual</h5>
    <table class="table table-striped table-hover border">
      <thead class="table-dark">
        <tr>
          <th>DNI</th>
          <th>Nombre</th>
          <th>Apellidos</th>
          <th>Correo Institucional</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="profe in listaProfesores" :key="profe.dni_nie">
          <td>{{ profe.dni_nie }}</td>
          <td>{{ profe.nombre }}</td>
          <td>{{ profe.apellidos }}</td>
          <td>{{ profe.correo_institucional }}</td>
          <td>
            <button @click="cargarDatosEnFormulario(profe)" class="btn btn-warning btn-sm me-2">
              Editar
            </button>
            <button @click="borrarProfesor(profe.dni_nie)" class="btn btn-danger btn-sm">
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
      listaProfesores: [], // Aquí guardamos los datos que vienen del servidor
      esEdicion: false,    // Variable para saber si estamos editando
      datosFormulario: { 
        dni_nie: '', 
        nombre: '', 
        apellidos: '',
        correo_institucional: '',
        departamento_id: 1, // Valor obligatorio fijo
        rol_id: 2,          // Valor obligatorio fijo
        password_hash: '1234' // Valor obligatorio fijo
      }
    };
  },
  
  async mounted() {
    // Nada más cargar la página, pedimos la lista
    await this.cargarTodo();
  },

  methods: {
    async cargarTodo() {
      this.listaProfesores = await api.getAll('profesores');
    },

    async guardarProfesor() {
      if (this.esEdicion === true) {
        // --- MODO EDITAR ---
        await api.update('profesores', this.datosFormulario.dni_nie, this.datosFormulario);
      } else {
        // --- MODO CREAR ---
        await api.create('profesores', this.datosFormulario);      
      }
      
      this.cancelar(); // Limpiamos el formulario
      
      // Esperamos un poco y recargamos la lista
      setTimeout(async () => {
           await this.cargarTodo();
      }, 500);
    },

    cargarDatosEnFormulario(profe) {
      // Copiamos los datos del profesor seleccionado al formulario de arriba
      this.datosFormulario = { ...profe };
      this.esEdicion = true; // Activamos modo edición
    },

    cancelar() {
      // Dejamos el formulario limpio y volvemos a modo crear
      this.datosFormulario = { 
        dni_nie: '', nombre: '', apellidos: '', correo_institucional: '',
        departamento_id: 1, rol_id: 2, password_hash: '1234'
      };
      this.esEdicion = false;
    },

    async borrarProfesor(dni) {
      let confirmacion = confirm('¿Seguro que quieres eliminar este profesor?');
      
      if (confirmacion) {
        // Intentamos borrar
        let resultado = await api.delete('profesores', dni);
        
        if (resultado === true) {
          // Si se borró bien, recargamos la lista
          await this.cargarTodo();
        } else {
          // Si falló (probablemente por tener reservas), mostramos aviso
          alert("NO SE PUEDE ELIMINAR:\nEste profesor tiene reservas o cursos activos.\nDebes borrarlos primero.");
        }
      }
    }
  }
};
</script>