<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>
                Header
                </ion-title>
                <ion-button button-fill="outline" slot="end" @click="add"
                >
                    add
                </ion-button>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-list lines="inset">
                <ion-item-sliding  v-for="signature in signatures"
                :router-link="`/memories/${signature.id}`"
                :key="signature.id"> 
                    <ion-item>
                        <ion-thumbnail slot="start">
                            <ion-img :src="signature.signature"></ion-img>
                        </ion-thumbnail>
                        <ion-label>
                
                            <h2>{{ signature.name }}</h2>
                        </ion-label>
                    </ion-item>
                    <ion-item-options side="end">
                        <ion-item-option color="danger" class="center">
                            <ion-button fill="clear" color="light"  class="center" @click="deleteSignature(signature.id)">
                                <ion-icon :icon="trash"></ion-icon>
                            </ion-button>
                        </ion-item-option>
                    </ion-item-options>
                </ion-item-sliding>
            </ion-list>

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

<script lang="ts">
import { defineComponent } from 'vue'
import { IonPage,IonContent, IonFooter, IonHeader, IonTitle, IonToolbar, IonList, IonItemSliding, IonItem, IonThumbnail, IonImg, IonLabel, IonItemOptions, IonItemOption, IonButton, IonIcon} from '@ionic/vue';
import { trash, pencil } from 'ionicons/icons';
import { modalController } from '@ionic/vue';
import SignatureModal from './modals/AddSignatureModal.vue'
import store from '../store'

export default defineComponent({
    components: {
        IonPage,
        IonContent,
        IonFooter,
        IonHeader,
        IonTitle,
        IonToolbar,
        IonList,
        IonItemSliding,
        IonItem,
        IonThumbnail,
        IonImg,
        IonLabel,
        IonItemOptions,
        IonItemOption,
        IonButton,
        IonIcon,
    },
    computed: {
        signatures() {
            console.log(store.getters.signatures)
            return store.getters.signatures
        }
    },
    setup () {
        const add = () => {
            modalController.create({
                component: SignatureModal,
                componentProps: {
                  name: 'SignatureModal',
                },
              }).then((modalElement) => {
                modalElement.present();
              });

        };
        const deleteSignature = (signatureId : string) => {
            store.dispatch('deleteSignature', signatureId)
        }
         

        return {
            trash,
            pencil,
            add,
            deleteSignature,
        }
    }
})
</script>

<style scoped>

</style>