<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Gestión de Roles (H11)</h2>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          <div class="col-md-3">
            <label class="form-label fw-bold">ID (Ej: ADMIN_DR)</label>
            <input v-model="formulario.id" type="text" class="form-control" required :disabled="editando">
          </div>
          <div class="col-md-6">
            <label class="form-label fw-bold">Nombre del Rol</label>
            <input v-model="formulario.nombre" type="text" class="form-control" required>
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
        <tr><th>ID</th><th>Nombre</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        <tr v-for="rol in listaRoles" :key="rol.id">
          <td>{{ rol.id }}</td><td>{{ rol.nombre }}</td>
          <td>
            <button @click="prepararEdicion(rol)" class="btn btn-warning btn-sm me-2">Editar</button>
            <button @click="eliminar(rol.id)" class="btn btn-danger btn-sm">Borrar</button>
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
      listaRoles: [], 
      editando: false,
      formulario: { id: '', nombre: '', zusuario: 'david.romo' }
    };
  },

  async mounted() { 
    // Cargamos los datos al iniciar la pantalla
    await this.cargarRoles(); 
  },

  methods: {
    async cargarRoles() { 
      try {
        // Obtenemos la lista de roles desde la base de datos
        this.listaRoles = await api.getAll('roles') || []; 
      } catch (error) {
        alert("Fallo en la bbdd al cargar los roles");
      }
    },

    async guardar() {
      // Recortamos la fecha si existe para evitar el error 500 al actualizar
      if (this.formulario.zfecha) {
        this.formulario.zfecha = this.formulario.zfecha.substring(0, 10);
      }

      try {
        // Evaluamos si actualizamos un registro o creamos uno nuevo
        if (this.editando) { 
          await api.update('roles', this.formulario.id, this.formulario); 
        } else { 
          await api.create('roles', this.formulario); 
        }
        
        // Limpiamos el formulario y recargamos los datos tras medio segundo
        this.limpiar();
        setTimeout(async () => { await this.cargarRoles(); }, 500);
      } catch (error) {
        alert("Fallo en la bbdd al intentar guardar el rol");
      }
    },

    prepararEdicion(rol) { 
      // Cargamos el rol seleccionado en las casillas
      this.formulario = { ...rol, zusuario: 'david.romo' }; 
      this.editando = true; 
    },

    limpiar() { 
      // Devolvemos las variables a su estado vacío original
      this.formulario = { id: '', nombre: '', zusuario: 'david.romo' }; 
      this.editando = false; 
    },

    async eliminar(id) {
      // Pedimos confirmación obligatoria antes de ejecutar el borrado
      if (confirm('¿Seguro que quieres borrar este rol?')) { 
        try {
          await api.delete('roles', id); 
          await this.cargarRoles(); 
        } catch (error) {
          alert("Fallo en la bbdd al intentar borrar el rol");
        }
      }
    }
  }
};
</script>