<template>
  <ion-app>
    <ion-router-outlet :mode="mode"  />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';

export default {
  components: {
    IonApp,
    IonRouterOutlet
  },
  setup() {
    return { mode: 'md' };
  }
};
</script>
