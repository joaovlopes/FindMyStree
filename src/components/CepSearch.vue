<template>
   <div class="cep-input-container">

      <label for="cep" class="cep-label">Digite o CEP:</label>
      <input
         id="cep"
         v-model="cep"
         @input="applyMask"
         placeholder="12345-678"
         maxlength="9"
         class="cep-input"
         inputmode="numeric"
      />
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <div class="button-container">
         <button
            :disabled="!isValidCep"
            @click="searchCep"
            class="search-button"
         >
            Buscar
         </button>

         <button @click="clearInput" class="clear-button">
            Limpar
         </button>
      </div>

      <div v-if="isLoading" class="loading-container">
         <h3>Carregando</h3>
         <div class="dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
         </div>
      </div>

      <div v-if="cepData" class="card">
         
         
         <template v-if="cepData.erro">
            <h2>Não foi possível encontrar um endereço com este CEP.</h2>
         </template>
         <template v-else>
            <h2>CEP: {{ cepData.cep }}</h2>
            <ul>
               <li><strong>Logradouro:</strong> {{ cepData.logradouro }}</li>
               <li><strong>Bairro:</strong> {{ cepData.bairro }}</li>
               <li>
                  <strong>Localidade:</strong> {{ cepData.localidade }} - {{ cepData.uf }}
               </li>
               <li><strong>DDD:</strong> {{ cepData.ddd }}</li>
            </ul>
         </template>
         <button @click="clearResult" class="back-button">Nova Busca</button>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { fetchCepData } from '../services/cepService.service'

const cep = ref<string>('')
const errorMessage = ref<string>('')
const isValidCep = ref<boolean>(false)
const cepData = ref<{ erro: boolean } | null>(null) // Tipando como objeto ou null (caso não tenha dado o CEP)
const isLoading = ref<boolean>(false)

// Função para validar o CEP
function validateCep(): void {
   const cepPattern = /^[0-9]{5}-[0-9]{3}$/ // Regex para CEP no formato "12345-678"

   if (cep.value === '') {
      errorMessage.value = 'O campo não pode estar vazio.'
      isValidCep.value = false
   } else if (!cepPattern.test(cep.value)) {
      errorMessage.value = 'CEP deve ter 8 números.'
      isValidCep.value = false
   } else {
      errorMessage.value = ''
      isValidCep.value = true
   }
}

// Função para aplicar a máscara no CEP
function applyMask(): void {
   // Remove tudo que não for número
   let onlyNumbers = cep.value.replace(/[^0-9]/g, '')

   // Adiciona o hífen automaticamente quando atingir 5 números
   if (onlyNumbers.length > 5) {
      cep.value =
         onlyNumbers.substring(0, 5) + '-' + onlyNumbers.substring(5, 8)
   } else {
      cep.value = onlyNumbers
   }

   validateCep() // Revalidar após a máscara
}

// Função chamada ao clicar no botão de busca
async function searchCep(): Promise<void> {
   if (isValidCep.value) {
      isLoading.value = true
      try {
         await new Promise(resolve => setTimeout(resolve, 1000));
         const data = await fetchCepData(cep.value)
         if (data.erro) {
            // CEP não encontrado
            cepData.value = { erro: true }
         } else {
            // CEP encontrado
            cepData.value = data
         }
      } catch (error) {
         errorMessage.value = 'Erro ao buscar o CEP. Tente novamente.'
      } finally {
         isLoading.value = false  // Finaliza o carregamento
      }
   }
}

// Função para limpar o input e as mensagens de erro
function clearInput(): void {
   cep.value = ''
   errorMessage.value = ''
   isValidCep.value = false
}

// Função para limpar o resultado exibido
function clearResult(): void {
   cepData.value = null
   clearInput()
}
</script>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;

.cep-input-container {
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: 1rem;
   padding: 5rem 1.5rem 1.5rem;

   .cep-label {
      font-size: $font-size-large;
      color: $white-color;
   }

   .cep-input {
      width: 100%;
      max-width: 300px;
      padding: 0.8rem;
      font-size: $font-size-medium;
      border: 2px solid $primary-color;
      border-radius: $border-radius;
      outline: none;
      transition: border-color $transition-speed;

      &:focus {
         border-color: $secondary-color;
      }
   }

   .error-message {
      color: $error-color;
      font-size: $font-size-small;
      text-align: center;
   }

   .button-container {
      display: flex;
      gap: 0.5rem;

      .search-button {
         padding: 0.8rem 1.5rem;
         font-size: $font-size-medium;
         font-weight: bold;
         color: $white-color;
         background-color: $primary-color;
         border: none;
         border-radius: $border-radius;
         cursor: pointer;
         transition: background-color $transition-speed, transform $transition-transform;

         &:disabled {
            background-color: $neutral-color;
            cursor: not-allowed;
         }

         &:not(:disabled):hover {
            background-color: $secondary-color;
            transform: scale(1.05);
         }
      }

      .clear-button {
         padding: 0.8rem 1.5rem;
         font-size: $font-size-medium;
         font-weight: bold;
         color: $white-color;
         background-color: $neutral-color;
         border: none;
         border-radius: $border-radius;
         cursor: pointer;
         transition: background-color $transition-speed, transform $transition-transform;

         &:hover {
            background-color: $neutral-light;
            transform: scale(1.05);
         }
      }
   }

   .card {
      background-color: $white-color;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      width: 100%;
      max-width: 400px;
      text-align: center;
      margin-top: 2rem;

      h2 {
         font-size: $font-size-heading;
         color: $dark-color;
         margin-bottom: 1rem;
      }

      ul {
         list-style: none;
         padding: 0;

         li {
            font-size: $font-size-medium;
            color: $medium-dark;
            margin: 0.5rem 0;
         }
      }

      .back-button {
         padding: 0.8rem 1.5rem;
         font-size: $font-size-medium;
         font-weight: bold;
         color: $white-color;
         background-color: $primary-color;
         border: none;
         border-radius: $border-radius;
         cursor: pointer;
         transition: background-color $transition-speed, transform $transition-transform;
         margin-top: 1rem;

         &:hover {
            background-color: $secondary-color;
            transform: scale(1.05);
         }
      }
   }

   .loading-container {
   display: flex;
   flex-direction: column;
   align-items: center;

      h3 {
         font-size: $font-size-heading;
         color: $white-color;
         margin-bottom: 1rem;
      }

      .dots {
         display: flex;
         gap: 0.3rem;
      }

      .dot {
         width: 12px;
         height: 12px;
         border-radius: 50%;
         background-color: $primary-color;
         animation: bounce 1.2s infinite ease-in-out;
      }

      .dot:nth-child(1) {
         animation-delay: 0s;
      }

      .dot:nth-child(2) {
         animation-delay: 0.2s;
      }

      .dot:nth-child(3) {
         animation-delay: 0.4s;
      }
   }
}

@keyframes bounce {
   0%, 100% {
      transform: translateY(0);
   }
   50% {
      transform: translateY(-10px);
   }
}
</style>

