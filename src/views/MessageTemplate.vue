<template>
  <div class="pageWrapper">
    <h1>Message Template</h1>
    <p>Use simple templates to create pretty messages for WhatsApp and other messaging services!</p>
    <p>Usage: </p>

    <div class="messagesWrapper">
      <div class="templateWrapper">
        <h2>Template</h2>
        <textarea name="template" id="template" cols="30" rows="10"></textarea>
        <h2>Variables</h2>
        <ul>
          <li v-for="variable in variables" :key="variable.id">
            {{ variable.name }}
          </li>
        </ul>
      </div>
      <div class="viewWrapper">
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  setup() {
    const template = ref(`😊Buen día el menú de hoy

🫕 {{menu1}} ${{ price1 }}
🫕 {{menu2}} ${{ price2 }}

El platillo Incluye 2 guarniciones, tortillas y salsa.
AGUAS FRESCAS 💯 % NATURALES ${{ agua_price }} EL LITRO🧊
🥤 {{drink1}}
🥤 {{drink2}}

➡📱 PEDIDOS POR WHATSAPP
http://linkcard.click/Comoenlacasa`);

    const variables = ref({
      menu1: 'PECHUGA EN CREMA DE CHIPOTLE',
      price1: 90,
      menu2: 'CHULETAS EN SALSA MORITA',
      price2: 90,
      agua_price: 35,
      drink1: 'LIMONADA🍋',
      drink2: 'JAMAICA'
    });
    const formattedMessage = computed(() => {
      return template.value.replace(/\\{\\{(\\w+)\\}\\}/g, (_, key) => variables.value[key] || '');
    });


    const generateWhatsAppLink = computed(() => {
      const message = encodeURIComponent(formattedMessage.value);
      return `https://wa.me/?text=${message}`;
    });

    return { template, variables, formattedMessage, generateWhatsAppLink };
  }
};

</script>

<style scoped>
.home {
  text-align: center;
  margin-top: 50px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 10px 0;
}

a {
  text-decoration: none;
  color: #42b983;
  font-size: 20px;
}

a:hover {
  color: #35495e;
}
</style>