<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Gestión de Profesores (H3)</h2>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">
        <span v-if="estoyEditando">Editar Profesor (DNI: {{ formulario.dni_nie }})</span>
        <span v-else>Alta de Nuevo Profesor</span>
      </h5>
      
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          
          <div class="col-md-2">
            <label class="form-label fw-bold">DNI/NIE</label>
            <input v-model="formulario.dni_nie" type="text" class="form-control" placeholder="11111111D" required :disabled="estoyEditando">
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Nombre</label>
            <input v-model="formulario.nombre" type="text" class="form-control" required>
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">Apellidos</label>
            <input v-model="formulario.apellidos" type="text" class="form-control" required>
          </div>

          <div class="col-md-5">
            <label class="form-label fw-bold">Correo Institucional</label>
            <input v-model="formulario.correo_institucional" type="email" class="form-control" required>
          </div>

          <div class="col-md-3 mt-3">
            <label class="form-label fw-bold">Departamento</label>
            <select v-model="formulario.departamento_id" class="form-select" required>
              <option value="" disabled>Selecciona...</option>
              <option v-for="depto in listaDepartamentos" :key="depto.id" :value="depto.id">
                {{ depto.nombre || depto.id }}
              </option>
            </select>
          </div>

          <div class="col-md-3 mt-3">
            <label class="form-label fw-bold">Rol Asignado</label>
            <select v-model="formulario.rol_id" class="form-select" required>
              <option value="" disabled>Selecciona...</option>
              <option v-for="rol in listaRoles" :key="rol.id" :value="rol.id">
                {{ rol.nombre || rol.id }}
              </option>
            </select>
          </div>
          
          <div class="col-md-6 mt-3 d-flex gap-2 justify-content-end">
            <button type="submit" class="btn fw-bold px-4" :class="estoyEditando ? 'btn-warning' : 'btn-success'">
              {{ estoyEditando ? 'Actualizar' : 'Registrar y Crear Credencial' }}
            </button>
            <button v-if="estoyEditando" @click="cancelar" type="button" class="btn btn-secondary px-4">X</button>
          </div>
        </div>
      </form>
    </div>

    <h5 class="mb-3">Listado Actual de Profesores</h5>
    <table class="table table-striped table-hover border">
      <thead class="table-dark">
        <tr>
          <th>DNI</th>
          <th>Nombre y Apellidos</th>
          <th>Correo</th>
          <th>Depto ID</th>
          <th>Rol ID</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="profe in listaProfesores" :key="profe.dni_nie">
          <td><span class="badge bg-secondary">{{ profe.dni_nie }}</span></td>
          <td>{{ profe.nombre }} {{ profe.apellidos }}</td>
          <td>{{ profe.correo_institucional }}</td>
          <td>{{ profe.departamento_id }}</td>
          <td><span class="badge bg-primary">{{ profe.rol_id }}</span></td>
          <td>
            <button @click="cargarDatos(profe)" class="btn btn-warning btn-sm me-2">Editar</button>
            <button @click="borrar(profe.dni_nie)" class="btn btn-danger btn-sm">Borrar</button>
          </td>
        </tr>
        <tr v-if="listaProfesores.length === 0">
          <td colspan="6" class="text-center">No hay profesores registrados.</td>
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
      listaProfesores: [],
      listaDepartamentos: [],
      listaRoles: [],
      estoyEditando: false,
      formulario: { 
        dni_nie: '', 
        nombre: '', 
        apellidos: '',
        correo_institucional: '',
        departamento_id: '', 
        rol_id: '',          
        zusuario: 'david.romo'
      }
    };
  },
  
  async mounted() {
    await this.cargarTodo();
  },

  methods: {
    async cargarTodo() {
      this.listaProfesores = await api.getAll('profesores') || [];
      this.listaDepartamentos = await api.getAll('departamentos') || [];
      
      let todosLosRoles = await api.getAll('roles') || [];
      
      // Filtramos para que no se pueda asignar el rol de alumno a un profesor
      this.listaRoles = todosLosRoles.filter(rol => {
        return rol.nombre && rol.nombre.toLowerCase() !== 'alumno';
      });
    },

    async guardar() {
      // ESTA ES LA LÍNEA QUE FALTABA
      let datosParaEnviar = { ...this.formulario };

      if (this.estoyEditando) {
        // Actualizamos usando dni_nie
        await api.update('profesores', datosParaEnviar.dni_nie, datosParaEnviar);
      } else {
        // 1. Creamos el profesor
        await api.create('profesores', datosParaEnviar); 
        
        // 2. CREACIÓN AUTOMÁTICA DEL USUARIO
        let loginGenerado = `${datosParaEnviar.nombre.toLowerCase()}.${datosParaEnviar.apellidos.toLowerCase().replace(/\s/g, '')}`;
        
        let nuevoUsuario = {
          login: loginGenerado,
          password_hash: '1234', 
          rol_id: datosParaEnviar.rol_id, 
          ref_identidad_fk: datosParaEnviar.dni_nie, // Enlace exacto con la BD
          estado_id: 'ACT_DR', 
          zusuario: 'david.romo'
        };
        
        try {
          await api.create('usuarios', nuevoUsuario);
        } catch (error) {
          console.error("Profesor creado, pero falló la creación de credenciales", error);
        }
      }

      this.cancelar(); 
      setTimeout(async () => { await this.cargarTodo(); }, 500);
    },

    cargarDatos(profe) {
      this.formulario = { ...profe, zusuario: 'david.romo' };
      this.estoyEditando = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    cancelar() {
      this.formulario = { 
        dni_nie: '', nombre: '', apellidos: '', correo_institucional: '',
        departamento_id: '', rol_id: '', zusuario: 'david.romo'
      };
      this.estoyEditando = false;
    },

    async borrar(dni_nie) {
      if (!confirm('¿Seguro que quieres eliminar a este profesor del sistema?')) return;

      let todosLosUsuarios = await api.getAll('usuarios') || [];
      let usuarioDelProfe = todosLosUsuarios.find(u => u.ref_identidad_fk === dni_nie);

      if (usuarioDelProfe) {
        let todasLasReservas = await api.getAll('reservas') || [];
        let reservasDelProfe = todasLasReservas.filter(r => r.usuario_login === usuarioDelProfe.login);

        // CA2: Preguntamos qué hacer con sus reservas
        if (reservasDelProfe.length > 0) {
          let mensaje = `Este profesor tiene ${reservasDelProfe.length} reservas activas.\n\n` +
                        `Elige una opción:\n` +
                        `Escribe '1' para ELIMINAR sus reservas.\n` +
                        `Escribe '2' para MANTENERLAS (pasarán a 'romo.admin').\n\n` +
                        `Pulsa [Cancelar] para abortar y NO borrar al profesor.`;
                        
          let opcion = prompt(mensaje);
          
          if (opcion === '1') {
            // Opción A: Cancelar y borrar las reservas
            for (let reserva of reservasDelProfe) {
              await api.delete('reservas', reserva.id);
            }
          } else if (opcion === '2') {
            // Opción B: Mantenerlas (Se las asignamos a tu usuario admin real)
            for (let reserva of reservasDelProfe) {
               reserva.usuario_login = 'romo.admin'; 
               
               // Ajustamos la fecha al formato que acepta la BBDD (YYYY-MM-DD)
               if (reserva.fecha_reserva && reserva.fecha_reserva.includes('T')) {
                 reserva.fecha_reserva = reserva.fecha_reserva.substring(0, 10);
               }
               
               await api.update('reservas', reserva.id, reserva);
            }
          } else {
            // Pulsó cancelar o dejó en blanco: ABORTAMOS TODO
            alert("Operación cancelada. El profesor y sus reservas están a salvo.");
            return; 
          }
        }
        
        // Ya resueltas las reservas, borramos su credencial
        await api.delete('usuarios', usuarioDelProfe.login);
      }

      // Finalmente, eliminamos al profesor
      let exito = await api.delete('profesores', dni_nie);
      
      if (exito) {
        await this.cargarTodo();
      } else {
        alert("Error: No se ha podido eliminar al profesor. Puede que esté vinculado a incidencias.");
      }
    }
  }
};
</script>