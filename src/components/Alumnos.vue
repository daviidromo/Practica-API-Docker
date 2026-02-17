<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Gestión de Alumnos (H4)</h2>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">
        <span v-if="editando">Modificar los datos del Alumno</span>
        <span v-else>Dar de alta a un Alumno nuevo</span>
      </h5>
      
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          
          <div class="col-md-2">
            <label class="form-label fw-bold">Número NIA</label>
            <input v-model="formulario.nia" type="text" class="form-control" placeholder="Ej: 2024001" required :disabled="editando">
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Nombre</label>
            <input v-model="formulario.nombre" type="text" class="form-control" required>
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">Apellidos</label>
            <input v-model="formulario.apellidos" type="text" class="form-control" required>
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">Correo Electrónico</label>
            <input v-model="formulario.correo_electronico" type="email" class="form-control" required>
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Contacto Tutor</label>
            <input v-model="formulario.tutor_legal_contacto" type="text" class="form-control" placeholder="Teléfono o Email">
          </div>
          
          <div class="col-md-12 mt-3 d-flex justify-content-end gap-2">
            <button type="submit" class="btn fw-bold px-4" :class="editando ? 'btn-warning' : 'btn-success'">
              <span v-if="editando">Guardar Cambios</span>
              <span v-else>Crear Alumno</span>
            </button>
            
            <button v-if="editando" @click="limpiarFormulario" type="button" class="btn btn-secondary px-4">
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>

    <h5 class="mb-3">Lista de Alumnos en el Centro</h5>
    <table class="table table-striped table-hover border">
      <thead class="table-dark">
        <tr>
          <th>NIA</th>
          <th>Nombre y Apellidos</th>
          <th>Correo</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="alumno in listaDeAlumnos" :key="alumno.nia">
          <td>{{ alumno.nia }}</td>
          <td>{{ alumno.nombre }} {{ alumno.apellidos }}</td>
          <td>{{ alumno.correo_electronico }}</td>
          <td>
            <span v-if="alumno.estado_id == 1" class="badge bg-success">Activo</span>
            <span v-else class="badge bg-danger">Bloqueado</span>
          </td>
          <td>
            <button @click="prepararParaEditar(alumno)" class="btn btn-warning btn-sm me-2">
              Editar
            </button>
            
            <button @click="cambiarEstado(alumno)" class="btn btn-outline-dark btn-sm me-2">
              {{ alumno.estado_id == 1 ? 'Bloquear' : 'Activar' }}
            </button>

            <button @click="eliminar(alumno.nia)" class="btn btn-danger btn-sm">
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
      listaDeAlumnos: [], // Aquí guardamos lo que descargamos de la base de datos
      editando: false,    // Nos dice si estamos creando uno nuevo o editando uno viejo
      formulario: { 
        nia: '',      
        nombre: '', 
        apellidos: '',
        correo_electronico: '', 
        tutor_legal_contacto: '',
        curso_id: 1,      
        estado_id: 1 // Los alumnos nuevos siempre empiezan activos (Estado 1)
      }
    };
  },
  
  async mounted() {
    // Cuando se abre la página, cargamos los datos automáticamente
    await this.cargarAlumnos();
  },

  methods: {
    async cargarAlumnos() {
      // Pedimos todos los alumnos al servidor
      this.listaDeAlumnos = await api.getAll('alumnos');
    },

    async cambiarEstado(alumno) {
      // Si está en 1 lo pasamos a 2, y si está en 2 lo pasamos a 1
      let nuevoEstado = 0;
      if (alumno.estado_id == 1) {
        nuevoEstado = 2;
      } else {
        nuevoEstado = 1;
      }

      // Creamos una copia con el nuevo estado
      let alumnoModificado = { ...alumno, estado_id: nuevoEstado };
      
      // Lo mandamos a actualizar
      await api.update('alumnos', alumno.nia, alumnoModificado);
      
      // Refrescamos la lista para ver el cambio de color
      await this.cargarAlumnos();
    },

    async guardar() {
      // Si no han puesto nada en el contacto del tutor, ponemos un aviso
      if (this.formulario.tutor_legal_contacto == '') {
        this.formulario.tutor_legal_contacto = 'Sin contacto';
      }

      if (this.editando == true) {
        // Actualizamos el alumno que ya existe
        await api.update('alumnos', this.formulario.nia, this.formulario);
      } else {
        // Creamos uno nuevo
        await api.create('alumnos', this.formulario);      
      }
      
      this.limpiarFormulario();
      
      // Recargamos la lista después de un momento para que al servidor le dé tiempo
      setTimeout(async () => {
        await this.cargarAlumnos();
      }, 500);
    },

    prepararParaEditar(alumno) {
      // Copiamos los datos de la tabla al formulario de arriba
      this.formulario = { ...alumno };
      this.editando = true;
    },

    limpiarFormulario() {
      // Reseteamos todas las variables para dejar el formulario vacío
      this.formulario = { 
        nia: '', nombre: '', apellidos: '', correo_electronico: '', tutor_legal_contacto: '',
        curso_id: 1, estado_id: 1
      };
      this.editando = false;
    },

    async eliminar(nia) {
      // Preguntamos antes de borrar para no meter la pata
      let respuesta = confirm('¿Seguro que quieres borrar a este alumno?');
      if (respuesta == true) {
        await api.delete('alumnos', nia);
        await this.cargarAlumnos();
      }
    }
  }
};
</script>