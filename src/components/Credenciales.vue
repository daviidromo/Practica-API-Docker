<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Gestión de Credenciales y Seguridad (H2)</h2>

    <div class="alert alert-info shadow-sm">
      <strong>Reglas de acceso del sistema:</strong>
      <ul class="mb-0">
        <li>¿Puede Reservar Aula? Solo Profesor y Administrador.</li>
        <li>¿Puede Crear Incidencia? Todos los usuarios.</li>
        <li>¿Puede Resolver Incidencia? Solo TIC y Administrador.</li>
        <li>¿Puede Borrar un Curso? Solo Administrador.</li>
      </ul>
    </div>

    <div class="card p-4 bg-light mb-5 shadow-sm" v-if="usuarioSeleccionado">
      <h5 class="mb-3">Cambiar contraseña de: {{ usuarioSeleccionado.nombre }}</h5>
      
      <form @submit.prevent="actualizarAcceso">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label fw-bold">Correo Electrónico</label>
            <input v-model="usuarioSeleccionado.email" type="text" class="form-control" disabled>
          </div>
          <div class="col-md-4">
            <label class="form-label fw-bold">Nueva Contraseña</label>
            <input v-model="nuevaPassword" type="password" class="form-control" placeholder="Escribe la nueva clave..." required>
          </div>
          <div class="col-md-4 d-flex gap-2">
            <button type="submit" class="btn btn-warning w-100 fw-bold">Actualizar Credenciales</button>
            <button @click="usuarioSeleccionado = null" type="button" class="btn btn-secondary">X</button>
          </div>
        </div>
      </form>
    </div>

    <h5 class="mb-3">Usuarios con acceso al sistema</h5>
    <table class="table table-striped table-hover border">
      <thead class="table-dark">
        <tr>
          <th>Nombre</th>
          <th>Correo / Usuario</th>
          <th>Rol asignado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="usuario in listaCuentas" :key="usuario.email">
          <td>{{ usuario.nombre }}</td>
          <td>{{ usuario.email }}</td>
          <td>
            <span class="badge bg-primary">{{ usuario.rol_nombre }}</span>
          </td>
          <td>
            <button @click="elegirUsuario(usuario)" class="btn btn-sm btn-outline-primary">
              Gestionar Acceso
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
      listaCuentas: [],
      usuarioSeleccionado: null,
      nuevaPassword: ''
    };
  },
  async mounted() {
    await this.cargarCuentas();
  },
  methods: {
    async cargarCuentas() {
      // Cargamos profesores y alumnos para ver quién tiene cuenta
      let profes = await api.getAll('profesores');
      let alumnos = await api.getAll('alumnos');
      let temp = [];

      // Metemos a los profes en la lista de gestión
      for (let i = 0; i < profes.length; i++) {
        temp.push({
          nombre: profes[i].nombre + " " + profes[i].apellidos,
          email: profes[i].correo_institucional,
          rol_nombre: profes[i].rol_id == 1 ? 'Administrador' : 'Profesor',
          id_original: profes[i].dni_nie,
          tipo: 'profesores'
        });
      }

      // Metemos a los alumnos
      for (let j = 0; j < alumnos.length; j++) {
        temp.push({
          nombre: alumnos[j].nombre + " " + alumnos[j].apellidos,
          email: alumnos[j].correo_electronico,
          rol_nombre: 'Alumno',
          id_original: alumnos[j].nia,
          tipo: 'alumnos'
        });
      }

      this.listaCuentas = temp;
    },

    elegirUsuario(u) {
      this.usuarioSeleccionado = { ...u };
      this.nuevaPassword = '';
    },

    async actualizarAcceso() {
      // Preparamos el objeto para actualizar solo la contraseña
      let datos = { password_hash: this.nuevaPassword };
      
      // Llamamos a la API según si es profe o alumno
      await api.update(this.usuarioSeleccionado.tipo, this.usuarioSeleccionado.id_original, datos);
      
      alert("Credenciales actualizadas correctamente para " + this.usuarioSeleccionado.nombre);
      this.usuarioSeleccionado = null;
      await this.cargarCuentas();
    }
  }
};
</script>