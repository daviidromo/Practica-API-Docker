<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow-sm border-0 mt-5">
          <div class="card-header bg-primary text-white text-center py-3">
            <h4 class="mb-0">Acceso a Escarlatti-Gest</h4>
          </div>
          <div class="card-body p-4">
            <form @submit.prevent="iniciarSesion">
              <div class="mb-3">
                <label class="form-label fw-bold">Usuario (Login)</label>
                <input v-model="formulario.login" type="text" class="form-control" placeholder="Ej: romo.admin" required>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">Contraseña</label>
                <input v-model="formulario.password" type="password" class="form-control" required>
              </div>
              <div class="mb-4">
                <label class="form-label fw-bold">Zusuario</label>
                <input v-model="formulario.zusuario" type="text" class="form-control" placeholder="Ej: david.romo" required>
              </div>
              <button type="submit" class="btn btn-primary w-100 fw-bold">Entrar al Sistema</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  data() {
    return {
      formulario: { login: '', password: '', zusuario: '' },
      intentosFallidos: {} 
    };
  },
  methods: {
    async iniciarSesion() {
      const loginActual = this.formulario.login;
      // Guardamos zusuario para las peticiones de la API
      localStorage.setItem('zusuario_guardado', this.formulario.zusuario);

      try {
        let todosLosUsuarios = await api.getAll('usuarios') || [];
        let usuarioVerificar = todosLosUsuarios.find(u => u.login === loginActual);

        // Verificamos si la cuenta está bloqueada o de baja
        if (usuarioVerificar && usuarioVerificar.estado_id !== 'ACT_DR') {
           let motivo = usuarioVerificar.estado_id === 'BAJA_DR' ? 'se encuentra de BAJA' : 'está BLOQUEADA por seguridad';
           alert(`ACCESO DENEGADO: La cuenta '${loginActual}' ${motivo}.`);
           return; 
        }

        const respuesta = await fetch('http://44.207.19.239:3000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.formulario)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
           if (!this.intentosFallidos[loginActual]) this.intentosFallidos[loginActual] = 0;
           this.intentosFallidos[loginActual]++;

           if (this.intentosFallidos[loginActual] >= 3) {
             await this.bloquearCuentaSeguridad(loginActual);
             alert(`ATENCIÓN: Cuenta '${loginActual}' bloqueada por seguridad tras 3 intentos fallidos.`);
             return;
           }
           alert(`Credenciales incorrectas. Te quedan ${3 - this.intentosFallidos[loginActual]} intentos.`);
           return; 
        }

        // GUARDAMOS DATOS DE SESIÓN
        localStorage.setItem('usuario_login', loginActual);
        localStorage.setItem('rol_id', usuarioVerificar.rol_id); 

        this.intentosFallidos[loginActual] = 0;
        this.$emit('acceso-concedido', datos);

      } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor.");
      }
    },

    async bloquearCuentaSeguridad(login) {
      try {
        let todos = await api.getAll('usuarios') || [];
        let u = todos.find(x => x.login === login);
        if (u) {
          u.estado_id = 'BLOQ_DR';
          if (u.zfecha) u.zfecha = u.zfecha.substring(0, 10);
          u.zusuario = localStorage.getItem('zusuario_guardado');
          await api.update('usuarios', login, u);
        }
      } catch (e) { console.error("Fallo al bloquear usuario", e); }
    }
  }
};
</script>