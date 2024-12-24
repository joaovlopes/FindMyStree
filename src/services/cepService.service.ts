import axios from 'axios';

export async function fetchCepData(cep: string) {
   try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      return response.data; // Retorna os dados do CEP
   } catch (error) {
      throw new Error('Erro ao buscar o CEP.');
   }
}