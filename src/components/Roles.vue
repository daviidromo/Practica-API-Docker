<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Gestión de Roles (H11)</h2>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">
        <span v-if="editando">Modificar permisos del Rol</span>
        <span v-else>Definir nuevo Rol de Usuario</span>
      </h5>
      
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          
          <div class="col-md-9">
            <label class="form-label fw-bold">Nombre del Rol (Ej: Administrador, TIC, Profesor)</label>
            <input v-model="formulario.nombre" type="text" class="form-control" placeholder="Escribe el nombre del rol..." required>
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

    <h5 class="mb-3">Roles configurados en Escarlatti-Gest</h5>
    <table class="table table-striped table-hover border">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre del Rol</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="rol in listaRoles" :key="rol.id">
          <td>{{ rol.id }}</td>
          <td>{{ rol.nombre }}</td>
          <td>
            <button @click="prepararEdicion(rol)" class="btn btn-warning btn-sm me-2">
              Editar
            </button>
            <button @click="eliminar(rol.id)" class="btn btn-danger btn-sm">
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
      listaRoles: [], 
      editando: false,
      formulario: {
        id: null,
        nombre: ''
      }
    };
  },
  
  async mounted() {
    // Cargamos los datos en cuanto se monta el componente
    await this.cargarRoles();
  },

  methods: {
    async cargarRoles() {
      // Pedimos los roles a la base de datos
      this.listaRoles = await api.getAll('roles');
    },

    async guardar() {
      if (this.editando) {
        // Si editando es true, actualizamos el rol existente
        await api.update('roles', this.formulario.id, this.formulario);
      } else {
        // Si es nuevo, buscamos el ID más alto para no repetir
        let idMaximo = 0;
        for (let i = 0; i < this.listaRoles.length; i++) {
          let actual = parseInt(this.listaRoles[i].id);
          if (actual > idMaximo) {
            idMaximo = actual;
          }
        }
        this.formulario.id = (idMaximo + 1).toString();
        
        // Guardamos el nuevo rol
        await api.create('roles', this.formulario);      
      }
      
      this.limpiar();
      // Refrescamos la tabla después de medio segundo
      setTimeout(async () => { await this.cargarRoles(); }, 500);
    },

    prepararEdicion(datosRol) {
      // Pasamos los datos de la tabla al formulario para editar
      this.formulario = { ...datosRol };
      this.editando = true;
    },

    limpiar() {
      // Vaciamos el formulario y quitamos el modo edición
      this.formulario = { id: null, nombre: '' };
      this.editando = false;
    },

    async eliminar(id) {
      let seguro = confirm('¿Quieres borrar este rol? Esto podría afectar al acceso de los usuarios.');
      if (seguro) {
        // Intentamos borrar el rol
        let exito = await api.delete('roles', id);
        
        if (exito) {
          await this.cargarRoles();
        } else {
          alert("No se puede eliminar el rol porque hay usuarios que lo tienen asignado actualmente.");
        }
      }
    }
  }
};
</script>