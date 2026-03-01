<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Gestión de Credenciales (Usuarios)</h2>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">
        <span v-if="esEdicion">Modificar Usuario: {{ formulario.login }}</span>
        <span v-else>Crear Nuevo Usuario (Login)</span>
      </h5>
      
      <form @submit.prevent="guardarUsuario">
        <div class="row g-3 align-items-end">
          
          <div class="col-md-2">
            <label class="form-label fw-bold">Login</label>
            <input v-model="formulario.login" type="text" class="form-control" required :disabled="esEdicion">
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Contraseña</label>
            <input v-model="formulario.password_hash" type="text" class="form-control" placeholder="Clave" required>
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Rol</label>
            <select v-model="formulario.rol_id" class="form-select" required>
              <option value="" disabled>Selecciona...</option>
              <option v-for="rol in listaRoles" :key="rol.id" :value="rol.id">{{ rol.nombre }}</option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">DNI / NIA</label>
            <input v-model="formulario.ref_identidad_fk" type="text" class="form-control" required>
          </div>

          <div v-if="esEdicion" class="col-md-2">
            <label class="form-label fw-bold text-danger">Estado</label>
            <select v-model="formulario.estado_id" class="form-select border-danger">
              <option value="ACT_DR">Activo</option>
              <option value="BAJA_DR">De Baja</option>
              <option value="BLOQ_DR">Bloqueado</option>
            </select>
          </div>
          
          <div class="col-md-2 d-flex gap-2">
            <button type="submit" class="btn w-100 fw-bold" :class="esEdicion ? 'btn-warning' : 'btn-success'">
              {{ esEdicion ? 'Actualizar' : 'Crear' }}
            </button>
            <button v-if="esEdicion" @click="limpiarFormulario" type="button" class="btn btn-secondary">X</button>
          </div>
        </div>
      </form>
    </div>

    <h5 class="mb-3">Cuentas Registradas</h5>
    <table class="table table-striped table-hover border text-center">
      <thead class="table-dark">
        <tr>
          <th>Login</th>
          <th>DNI / NIA</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="usuario in listaUsuarios" :key="usuario.login">
          <td>{{ usuario.login }}</td>
          <td>{{ usuario.ref_identidad_fk }}</td>
          <td><span class="badge bg-primary">{{ usuario.rol_id }}</span></td>
          <td>
            <span v-if="usuario.estado_id === 'ACT_DR'" class="badge bg-success">Activo</span>
            <span v-else-if="usuario.estado_id === 'BAJA_DR'" class="badge bg-danger">Baja</span> 
            <span v-else class="badge bg-warning text-dark">Bloqueado</span>
          </td>
          <td>
            <button @click="prepararEdicion(usuario)" class="btn btn-sm btn-warning me-2">Editar</button>
            <button @click="borrarUsuario(usuario.login)" class="btn btn-sm btn-danger">Borrar</button>
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
      listaUsuarios: [],
      listaRoles: [],
      esEdicion: false,
      formulario: {
        login: '', password_hash: '', rol_id: '', ref_identidad_fk: '',
        estado_id: 'ACT_DR', zusuario: 'david.romo'
      }
    };
  },
  async mounted() {
    await this.cargarDatos();
  },
  methods: {
    async cargarDatos() {
      this.listaUsuarios = await api.getAll('usuarios') || [];
      this.listaRoles = await api.getAll('roles') || [];
    },
    prepararEdicion(usuario) {
      this.formulario = { ...usuario, password_hash: '' };
      this.esEdicion = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    limpiarFormulario() {
      this.formulario = { login: '', password_hash: '', rol_id: '', ref_identidad_fk: '', estado_id: 'ACT_DR', zusuario: 'david.romo' };
      this.esEdicion = false;
    },
    async guardarUsuario() {
      let datosParaEnviar = { ...this.formulario };
      // Limpieza de fechas para evitar Error 500
      if (datosParaEnviar.zfecha) datosParaEnviar.zfecha = datosParaEnviar.zfecha.substring(0, 10);
      if (datosParaEnviar.ultimo_acceso) datosParaEnviar.ultimo_acceso = datosParaEnviar.ultimo_acceso.substring(0, 10);

      try {
        if (this.esEdicion) {
          await api.update('usuarios', datosParaEnviar.login, datosParaEnviar);
          // Sincronización con Alumnos si el rol es ALUM_DR
          if (datosParaEnviar.rol_id === 'ALUM_DR') {
            let todosAlumnos = await api.getAll('alumnos') || [];
            let alumnoVinculado = todosAlumnos.find(a => a.nia === datosParaEnviar.ref_identidad_fk);
            if (alumnoVinculado) {
              alumnoVinculado.estado_id = datosParaEnviar.estado_id;
              if (alumnoVinculado.zfecha) alumnoVinculado.zfecha = alumnoVinculado.zfecha.substring(0, 10);
              await api.update('alumnos', alumnoVinculado.nia, alumnoVinculado);
            }
          }
        } else {
          await api.create('usuarios', datosParaEnviar);
        }
        this.limpiarFormulario();
        await this.cargarDatos();
      } catch (error) {
        console.error(error);
      }
    },
    async borrarUsuario(login) {
      if (confirm('¿Borrar cuenta?')) { await api.delete('usuarios', login); await this.cargarDatos(); }
    }
  }
};
</script>