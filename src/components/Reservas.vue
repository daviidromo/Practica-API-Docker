<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Reserva de Espacios</h2>

    <div v-if="rolUsuario !== 'ALUM_DR'" class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">
        <span v-if="estoyEditando">Modificar Reserva (ID: {{ formulario.id }})</span>
        <span v-else>Realizar Nueva Reserva</span>
      </h5>
      
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">

          <div class="col-md-3">
            <label class="form-label fw-bold">Fecha</label>
            <input v-model="formulario.fecha_reserva" type="date" class="form-control" required>
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">Tramo Horario</label>
            <select v-model="formulario.horario_id" class="form-select" required>
              <option value="" disabled>Selecciona...</option>
              <option v-for="hora in listaHorarios" :key="hora.id" :value="hora.id">
                {{ hora.nombre }} ({{ hora.hora_inicio.substring(0,5) }} - {{ hora.hora_fin.substring(0,5) }})
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">Espacio (Solo Operativos)</label>
            <select v-model="formulario.espacio_id" class="form-select" required>
              <option value="" disabled>Selecciona...</option>
              <option v-for="espacio in listaEspaciosOperativos" :key="espacio.id" :value="espacio.id">
                {{ espacio.nombre }} (Cap: {{ espacio.capacidad_max }})
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">Solicitante</label>
            <input v-model="formulario.usuario_login" type="text" class="form-control" readonly disabled>
          </div>

          <div class="col-md-9 mt-3">
            <label class="form-label fw-bold">Motivo de la Reserva (Mín. 10 caracteres)</label>
            <input v-model="formulario.motivo_reserva" type="text" class="form-control" placeholder="Ej: Examen de programación" required>
          </div>
          
          <div class="col-md-3 mt-3 d-flex justify-content-end gap-2">
            <button type="submit" class="btn fw-bold px-4 w-100" :class="estoyEditando ? 'btn-warning' : 'btn-success'">
              {{ estoyEditando ? 'Actualizar' : 'Reservar Aula' }}
            </button>
            
            <button v-if="estoyEditando" @click="borrar(formulario.id)" type="button" class="btn btn-danger fw-bold px-3">
              Eliminar
            </button>

            <button v-if="estoyEditando" @click="cancelar" type="button" class="btn btn-secondary px-3">X</button>
          </div>
        </div>
      </form>
    </div>

    <div v-else class="alert alert-info shadow-sm mb-5">
      <strong>Modo Lectura:</strong> Como alumno, puedes consultar la disponibilidad de las aulas en tiempo real, pero no puedes realizar reservas.
    </div>

    <h4 class="mb-3 text-secondary border-bottom pb-2">Cuadrante Visual de Ocupación</h4>
    
    <div class="row mb-3 align-items-center bg-white p-3 border rounded shadow-sm">
      <div class="col-md-4">
        <label class="form-label fw-bold">Ubicación / Planta:</label>
        <select v-model="filtroPlanta" class="form-select border-primary">
          <option value="" disabled>Selecciona una planta...</option>
          <option v-for="planta in plantasDisponibles" :key="planta" :value="planta">
            {{ planta }}
          </option>
        </select>
      </div>

      <div class="col-md-8 d-flex justify-content-end align-items-end gap-2 mt-3 mt-md-0">
        <button @click="cambiarDia(-1)" class="btn btn-outline-dark">&lt;&lt; Día Anterior</button>
        <input type="date" v-model="filtroFecha" class="form-control w-auto fw-bold text-center">
        <button @click="diaActual" class="btn btn-outline-primary">Hoy</button>
        <button @click="cambiarDia(1)" class="btn btn-outline-dark">Día Siguiente &gt;&gt;</button>
      </div>
    </div>

    <div v-if="filtroPlanta" class="table-responsive shadow-sm border mb-5">
      <table class="table table-bordered table-sm text-center align-middle mb-0">
        <thead class="table-dark">
          <tr>
            <th class="py-3" style="width: 150px;">Periodo / Aula</th>
            <th v-for="espacio in espaciosDelCuadrante" :key="espacio.id" class="py-2">
              <div class="fw-bold text-info">{{ espacio.nombre }}</div>
              <small class="text-light fw-normal">Cap: {{ espacio.capacidad_max }}</small>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="hora in listaHorarios" :key="hora.id">
            <td class="table-secondary fw-bold text-start ps-3">
              {{ hora.nombre }} <br>
              <small class="text-muted">{{ hora.hora_inicio.substring(0,5) }} - {{ hora.hora_fin.substring(0,5) }}</small>
            </td>
            
            <td v-for="espacio in espaciosDelCuadrante" :key="espacio.id" class="p-0">
              <div v-if="obtenerReservaCuadrante(espacio.id, hora.id)" 
                   class="h-100 w-100 p-2 d-flex flex-column justify-content-center align-items-center"
                   :style="estiloCelda(obtenerReservaCuadrante(espacio.id, hora.id))"
                   @click="puedeGestionar(obtenerReservaCuadrante(espacio.id, hora.id)) ? cargarDatos(obtenerReservaCuadrante(espacio.id, hora.id)) : null"
                   style="cursor: pointer;">
                <span class="fw-bold">{{ obtenerReservaCuadrante(espacio.id, hora.id).usuario_login }}</span>
                <small v-if="puedeGestionar(obtenerReservaCuadrante(espacio.id, hora.id))">(Editar/Borrar)</small>
              </div>
              
              <div v-else class="h-100 w-100 p-2 d-flex justify-content-center align-items-center bg-white">
                <button v-if="rolUsuario !== 'ALUM_DR'" @click="seleccionarHueco(espacio.id, hora.id)" class="btn btn-sm btn-outline-secondary rounded-circle fw-bold">+</button>
                <span v-else class="text-muted small">Libre</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>
import api from '../services/api';

export default {
  data() {
    return {
      listaReservas: [],
      listaEspaciosOperativos: [],
      listaHorarios: [],
      
      filtroFecha: new Date().toISOString().substring(0, 10), 
      filtroPlanta: '', 

      loginUsuario: localStorage.getItem('usuario_login') || 'desconocido',
      rolUsuario: localStorage.getItem('rol_id') || 'ALUM_DR',

      estoyEditando: false,
      formulario: { 
        id: null, espacio_id: '', horario_id: '',
        usuario_login: '', fecha_reserva: '', motivo_reserva: '',
        zusuario: 'david.romo'
      }
    };
  },
  
  computed: {
    plantasDisponibles() {
      const plantas = this.listaEspaciosOperativos.map(e => e.ubicacion_planta).filter(Boolean);
      return [...new Set(plantas)]; 
    },
    espaciosDelCuadrante() {
      if (!this.filtroPlanta) return [];
      return this.listaEspaciosOperativos.filter(e => e.ubicacion_planta === this.filtroPlanta);
    }
  },

  async mounted() {
    await this.cargarTodo();
    this.formulario.usuario_login = this.loginUsuario;
    if (this.plantasDisponibles.length > 0) this.filtroPlanta = this.plantasDisponibles[0];
  },

  methods: {
    async cargarTodo() {
      this.listaReservas = await api.getAll('reservas') || [];
      let todos = await api.getAll('espacios') || [];
      this.listaEspaciosOperativos = todos.filter(e => e.estado_operativo === 'OP');
      let h = await api.getAll('horarios') || [];
      this.listaHorarios = h.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
    },

    puedeGestionar(reserva) {
      if (this.rolUsuario === 'ADMIN_DR') return true;
      return reserva.usuario_login === this.loginUsuario;
    },

    estiloCelda(reserva) {
      const esMia = reserva.usuario_login === this.loginUsuario;
      const gestionable = this.puedeGestionar(reserva);
      return {
        backgroundColor: esMia ? '#d4edda' : '#f8d7da',
        border: `1px solid ${esMia ? '#c3e6cb' : '#f5c6cb'}`,
        color: esMia ? '#155724' : '#721c24',
        cursor: gestionable ? 'pointer' : 'not-allowed'
      };
    },

    cambiarDia(dias) {
      let fecha = new Date(this.filtroFecha);
      fecha.setDate(fecha.getDate() + dias);
      this.filtroFecha = fecha.toISOString().substring(0, 10);
    },
    
    diaActual() { this.filtroFecha = new Date().toISOString().substring(0, 10); },

    obtenerReservaCuadrante(espacio_id, horario_id) {
      let fechaBuscada = this.formatearParaAPI(this.filtroFecha);
      return this.listaReservas.find(r => 
        r.espacio_id === espacio_id && 
        r.horario_id == horario_id && 
        this.formatearParaTabla(r.fecha_reserva) === fechaBuscada
      );
    },

    seleccionarHueco(espacio_id, horario_id) {
      this.cancelar(); 
      this.formulario.espacio_id = espacio_id;
      this.formulario.horario_id = horario_id;
      this.formulario.fecha_reserva = this.filtroFecha;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    formatearParaAPI(f) {
      if (!f) return "";
      const p = f.substring(0, 10).split('-');
      return `${p[2]}/${p[1]}/${p[0]}`;
    },

    formatearParaHTML(f) {
      if (!f) return "";
      if (f.includes('T')) return f.substring(0, 10);
      const p = f.split('/');
      return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : f;
    },

    formatearParaTabla(f) {
      if (!f) return "";
      let p = f.substring(0,10).split(f.includes('-') ? '-' : '/');
      return f.includes('-') ? `${p[2]}/${p[1]}/${p[0]}` : f;
    },

    async guardar() {
      if (this.formulario.motivo_reserva.length < 10) {
        alert("Error: El motivo debe tener al menos 10 caracteres.");
        return; 
      }

      let fechaComp = this.formatearParaAPI(this.formulario.fecha_reserva);
      let conflicto = this.listaReservas.some(r => 
        r.espacio_id === this.formulario.espacio_id && 
        this.formatearParaTabla(r.fecha_reserva) === fechaComp && 
        r.horario_id == this.formulario.horario_id && 
        r.id !== this.formulario.id
      );

      if (conflicto) {
        alert("Este espacio ya está reservado en este horario.");
        return; 
      }

      let datos = { ...this.formulario };
      if (datos.zfecha) datos.zfecha = datos.zfecha.substring(0, 10);

      try {
        if (this.estoyEditando) {
          await api.update('reservas', datos.id, datos);
        } else {
          delete datos.id;
          await api.create('reservas', datos); 
        }
        this.cancelar(); 
        await this.cargarTodo(); 
      } catch (error) { console.error(error); }
    },

    cargarDatos(reserva) {
      if (!this.puedeGestionar(reserva)) return;
      this.formulario = { ...reserva, zusuario: 'david.romo' };
      this.formulario.fecha_reserva = this.formatearParaHTML(reserva.fecha_reserva);
      this.estoyEditando = true; 
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    cancelar() {
      this.formulario = { 
        id: null, espacio_id: '', horario_id: '', 
        usuario_login: this.loginUsuario, fecha_reserva: this.filtroFecha, 
        motivo_reserva: '', zusuario: 'david.romo'
      };
      this.estoyEditando = false;
    },

    async borrar(id) {
      if (confirm('¿Seguro que quieres CANCELAR y eliminar definitivamente esta reserva?')) {
        await api.delete('reservas', id);
        this.cancelar();
        await this.cargarTodo();
      }
    }
  }
};
</script>