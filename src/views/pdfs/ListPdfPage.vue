<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
            <ion-button slot="end"
                router-link="/add"
            >
                Add
            </ion-button>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item v-for="pdf in Pdfs" :key="pdf.id" :router-link="`/pdf/${pdf.id}`">
                    <ion-label>{{pdf.name}}</ion-label>
                </ion-item>
                           
            </ion-list>
            
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonPage,IonContent ,IonList ,IonButton ,IonHeader,IonToolbar,IonItem,IonLabel} from '@ionic/vue';
import store from '@/store';
export default defineComponent({
    components: {
        IonPage,
        IonContent,
        IonButton,
        IonHeader,
        IonToolbar,
        IonList,
        IonItem,
        IonLabel
    },
    computed: {
        Pdfs(): any {
            return store.getters.Pdfs
        }
    },
    setup () {
        
        return {}
    }
})
</script>

<style scoped>
</style>