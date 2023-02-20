<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>
                Header
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
                <signaturePage class="signature" />
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <ion-title>
                Footer
                </ion-title>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script lang="js">
import { defineComponent, ref  } from 'vue'
import { IonPage,IonContent, IonFooter, IonHeader, IonTitle, IonToolbar} from '@ionic/vue';
import signaturePage from './signaturePage.vue'
export default defineComponent({
    components: {
        IonPage,
        IonContent,
        signaturePage,
        IonFooter,
        IonHeader,
        IonTitle,
        IonToolbar,
    },
    data () {
        return {
           

        }
    }
})
</script>

<style scoped>
    .signature {
        max-width: 100%;
        height: 100%;
    }
   
</style>