<script setup>
// Importamos la función 'ref' para crear variables reactivas (que cambian la pantalla)
import { ref } from 'vue';

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

const pantallaActual = ref('credenciales');
</script>

<template>
  <div class="min-vh-100 bg-light">
    
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary px-4 shadow">
      
      <a class="navbar-brand fw-bold" href="#">Escarlatti-Gest</a>
      
      <div class="ms-auto d-flex gap-2">
        <button 
          @click="pantallaActual = 'credenciales'" 
          class="btn" 
          :class="pantallaActual === 'credenciales' ? 'btn-light text-primary fw-bold' : 'btn-outline-light'"
        >
          Credenciales
        </button>

        <button 
          @click="pantallaActual = 'profesores'" 
          class="btn" 
          :class="pantallaActual === 'profesores' ? 'btn-light text-primary fw-bold' : 'btn-outline-light'"
        >
          Profesores
        </button>

        <button 
          @click="pantallaActual = 'alumnos'" 
          class="btn" 
          :class="pantallaActual === 'alumnos' ? 'btn-light text-primary fw-bold' : 'btn-outline-light'"
        >
          Alumnos
        </button>

        <button 
          @click="pantallaActual = 'cursos'" 
          class="btn" 
          :class="pantallaActual === 'cursos' ? 'btn-light text-primary fw-bold' : 'btn-outline-light'"
        >
          Cursos
        </button>

        

        <button 
          @click="pantallaActual = 'espacios'" 
          class="btn" 
          :class="pantallaActual === 'espacios' ? 'btn-light text-primary fw-bold' : 'btn-outline-light'"
        >
          Espacios
        </button>

          <button 
            @click="pantallaActual = 'estados'" 
            class="btn" 
            :class="pantallaActual === 'estados' ? 'btn-light text-primary fw-bold' : 'btn-outline-light'"
          >
            Estados
          </button>

        <button 
          @click="pantallaActual = 'etapas'" 
          class="btn" 
          :class="pantallaActual === 'etapas' ? 'btn-light text-primary fw-bold' : 'btn-outline-light'"
        >
          Etapas
        </button>

        <button 
          @click="pantallaActual = 'turnos'" 
          class="btn" 
          :class="pantallaActual === 'turnos' ? 'btn-light text-primary fw-bold' : 'btn-outline-light'"
        >
          Turnos
        </button>

        <button 
          @click="pantallaActual = 'departamentos'" 
          class="btn" 
          :class="pantallaActual === 'departamentos' ? 'btn-light text-primary fw-bold' : 'btn-outline-light'"
        >
          Departamentos
        </button>
      
        <button 
          @click="pantallaActual = 'roles'" 
          class="btn" 
          :class="pantallaActual === 'roles' ? 'btn-light text-primary fw-bold' : 'btn-outline-light'"
        > 
          Roles
        </button>

      </div>
    </nav>

    <main class="py-4">
      <Credenciales v-if="pantallaActual === 'credenciales'" />
      <Profesores v-if="pantallaActual === 'profesores'" />
      <Alumnos v-if="pantallaActual === 'alumnos'" />
      <Cursos v-if="pantallaActual === 'cursos'" />
      <Espacios v-if="pantallaActual === 'espacios'" />
      <Estados v-if="pantallaActual === 'estados'" />
      <Etapas v-if="pantallaActual === 'etapas'" />
      <Turnos v-if="pantallaActual === 'turnos'" />
      <Departamentos v-if="pantallaActual === 'departamentos'" />
      <Roles v-if="pantallaActual === 'roles'" />

    </main>

  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}

#app {
  width: 100%;
  max-width: 100%;
}
</style>