<script setup>
// Importaciones limpias y directas. 
// El nombre que pones aquí es la etiqueta que usarás en el <template>
import Acceso from './components/Acceso.vue';
import Profesores from './components/Profesores.vue';
import Alumnos from './components/Alumnos.vue';
import Cursos from './components/Cursos.vue';
import Espacios from './components/Espacios.vue';
import Etapas from './components/Etapas.vue';
import Estados from './components/Estados.vue';
import Turnos from './components/Turnos.vue';
import Departamentos from './components/Departamentos.vue';
import Roles from './components/Roles.vue';
import Credenciales from './components/Credenciales.vue'; 
import Reservas from './components/Reservas.vue';
import CrearIncidencia from './components/CrearIncidencia.vue';
import ResolucionIncidencias from './components/ResolucionIncidencias.vue';
import Horarios from './components/Horarios.vue';
</script>

<template>
  <div class="min-vh-100 bg-light">
    
    <Acceso v-if="usuarioActual === null" @acceso-concedido="gestionarEntrada" />

    <div v-else>
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary px-4 shadow">
        <a class="navbar-brand fw-bold" href="#">Escarlatti-Gest</a>
        
        <div class="ms-auto d-flex align-items-center gap-3">
          <span class="text-white fw-bold">
            Hola, {{ usuarioActual.nombre }} {{ usuarioActual.apellidos }} ({{ usuarioActual.rol }})
          </span>
          <button @click="cerrarSesion" class="btn btn-outline-light btn-sm fw-bold">Cerrar Sesión</button>
        </div>
      </nav>

      <div class="bg-white p-3 shadow-sm mb-4 d-flex flex-wrap gap-2 justify-content-center border-bottom">
        
        <button @click="pantallaSeleccionada = 'incidencias'" class="btn" :class="pantallaSeleccionada === 'incidencias' ? 'btn-primary' : 'btn-outline-primary'">
          Crear Incidencia
        </button>

        <button @click="pantallaSeleccionada = 'reservas'" class="btn" :class="pantallaSeleccionada === 'reservas' ? 'btn-primary' : 'btn-outline-primary'">
          Reserva de Espacios
        </button>

        <button v-if="esTic || esAdmin" @click="pantallaSeleccionada = 'resolver'" class="btn" :class="pantallaSeleccionada === 'resolver' ? 'btn-primary' : 'btn-outline-primary'">
          Resolución Incidencias
        </button>

        <template v-if="esAdmin">
          <span class="ms-3 border-start border-2 border-secondary ps-3 my-auto fw-bold text-secondary">Mantenimiento:</span>
          <button @click="pantallaSeleccionada = 'credenciales'" class="btn btn-sm" :class="pantallaSeleccionada === 'credenciales' ? 'btn-dark' : 'btn-outline-dark'">Credenciales</button>
          <button @click="pantallaSeleccionada = 'profesores'" class="btn btn-sm" :class="pantallaSeleccionada === 'profesores' ? 'btn-dark' : 'btn-outline-dark'">Profesores</button>
          <button @click="pantallaSeleccionada = 'alumnos'" class="btn btn-sm" :class="pantallaSeleccionada === 'alumnos' ? 'btn-dark' : 'btn-outline-dark'">Alumnos</button>
          <button @click="pantallaSeleccionada = 'cursos'" class="btn btn-sm" :class="pantallaSeleccionada === 'cursos' ? 'btn-dark' : 'btn-outline-dark'">Cursos</button>
          <button @click="pantallaSeleccionada = 'espacios'" class="btn btn-sm" :class="pantallaSeleccionada === 'espacios' ? 'btn-dark' : 'btn-outline-dark'">Espacios</button>
          <button @click="pantallaSeleccionada = 'estados'" class="btn btn-sm" :class="pantallaSeleccionada === 'estados' ? 'btn-dark' : 'btn-outline-dark'">Estados</button>
          <button @click="pantallaSeleccionada = 'etapas'" class="btn btn-sm" :class="pantallaSeleccionada === 'etapas' ? 'btn-dark' : 'btn-outline-dark'">Etapas</button>
          <button @click="pantallaSeleccionada = 'turnos'" class="btn btn-sm" :class="pantallaSeleccionada === 'turnos' ? 'btn-dark' : 'btn-outline-dark'">Turnos</button>
          <button @click="pantallaSeleccionada = 'departamentos'" class="btn btn-sm" :class="pantallaSeleccionada === 'departamentos' ? 'btn-dark' : 'btn-outline-dark'">Deptos</button>
          <button @click="pantallaSeleccionada = 'roles'" class="btn btn-sm" :class="pantallaSeleccionada === 'roles' ? 'btn-dark' : 'btn-outline-dark'">Roles</button>
          <button @click="pantallaSeleccionada = 'horarios'" class="btn btn-sm" :class="pantallaSeleccionada === 'horarios' ? 'btn-dark' : 'btn-outline-dark'">Horarios</button>
        </template>
      </div>

      <main class="py-4">
        <CrearIncidencia v-if="pantallaSeleccionada === 'incidencias'" />       
        <Reservas v-if="pantallaSeleccionada === 'reservas'" />
        
        <ResolucionIncidencias v-if="pantallaSeleccionada === 'resolver'" />

        <Credenciales v-if="pantallaSeleccionada === 'credenciales'" />
        <Profesores v-if="pantallaSeleccionada === 'profesores'" />
        <Alumnos v-if="pantallaSeleccionada === 'alumnos'" />
        <Cursos v-if="pantallaSeleccionada === 'cursos'" />
        <Espacios v-if="pantallaSeleccionada === 'espacios'" />
        <Estados v-if="pantallaSeleccionada === 'estados'" />
        <Etapas v-if="pantallaSeleccionada === 'etapas'" />
        <Turnos v-if="pantallaSeleccionada === 'turnos'" />
        <Departamentos v-if="pantallaSeleccionada === 'departamentos'" />
        <Roles v-if="pantallaSeleccionada === 'roles'" />
        <Horarios v-if="pantallaSeleccionada === 'horarios'" />
      </main>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      usuarioActual: null, 
      pantallaSeleccionada: 'incidencias' 
    };
  },
  computed: {
    esAdmin() {
      return this.usuarioActual && this.usuarioActual.rol === 'Administrador';
    },
    esTic() {
      return this.usuarioActual && this.usuarioActual.rol === 'Responsable TIC';
    },
    esProfesor() {
      return this.usuarioActual && this.usuarioActual.rol === 'Profesor';
    },
    esAlumno() {
      return this.usuarioActual && this.usuarioActual.rol === 'Alumno';
    }
  },
  methods: {
    gestionarEntrada(datosRecibidos) {
      this.usuarioActual = {
        usuario: datosRecibidos.usuario,
        rol: datosRecibidos.rol,
        nombre: datosRecibidos.nombre,
        apellidos: datosRecibidos.apellidos
      };
      
      this.pantallaSeleccionada = 'incidencias';
    },
    cerrarSesion() {
      this.usuarioActual = null;
      localStorage.removeItem('zusuario_guardado');
    }
  }
};
</script>