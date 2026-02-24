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
export default {
  data() {
    return {
      // ESTO ES LO QUE ENVIAMOS AL SERVIDOR. 
      // Tiene que coincidir exactamente con lo que te pedía el alert.
      formulario: {
        login: '',     
        password: '',
        zusuario: '' 
      }
    };
  },
  methods: {
    async iniciarSesion() {
      try {
        const respuesta = await fetch('http://100.27.173.196:3000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Convertimos el formulario a JSON y lo enviamos
          body: JSON.stringify(this.formulario)
        });

        const datos = await respuesta.json();

        // Si la respuesta del servidor no es OK (ej: 401 Unauthorized)
        if (!respuesta.ok) {
           let mensajeAlerta = datos.error || "Error al intentar acceder";
           
           // Si el servidor nos da un motivo (ej: usuario bloqueado), lo añadimos al mensaje
           if (datos.motivo) {
             mensajeAlerta += " - " + datos.motivo;
           }
           
           console.error("Fallo de autenticación:", datos);
           alert(mensajeAlerta);
           return; // Cortamos aquí para que no intente entrar
        }

        // Si llegamos aquí, el login fue un éxito. Guardamos el zusuario en memoria.
        localStorage.setItem('zusuario_guardado', this.formulario.zusuario);

        // Le decimos a App.vue que nos deje pasar y le damos los datos del usuario
        this.$emit('acceso-concedido', datos);

      } catch (error) {
        console.error("Fallo grave de red:", error);
        alert("No se ha podido conectar con el servidor. Verifica tu conexión a internet o si la IP ha cambiado.");
      }
    }
  }
};
</script>