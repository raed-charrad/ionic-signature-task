<template>
    <ion-page>
        <ion-content class="content">
            <div class="header">
                <button fill="outline" class="loop"  @click="scale = scale > 0.25 ? scale - 0.25 : 0.25">
                    <ion-icon :icon="removeCircleOutline"></ion-icon>
                </button>
                <button fill="outline" class="loop" shape="round" @click="scale = scale < 2 ? scale + 0.25 : 2">
                    <ion-icon :icon="addCircleOutline"></ion-icon>
                </button>
            </div>
            <div class="text-center " ref="myPdf" >
                <pdf    :scale="scale"
                        :src="pdfUrl" 
                        @numpages="getPages"
                        :page="currentPage"
                        :annotation="true"
                        :text="true" />

            </div>
            <div class="text-center footer">
                <ion-button  class="primary" @click="currentPage = currentPage > 1 ? currentPage - 1 : 1">
                    <ion-icon :icon="chevronBackOutline"></ion-icon>
                </ion-button>
                <div>{{ currentPage }} / {{ numPages }}</div>
                <ion-button class="primary" @click="currentPage = currentPage < numPages ? currentPage + 1 : numPages">
                    <ion-icon :icon="chevronForwardOutline"></ion-icon>
                </ion-button>
            </div>
            <ion-fab slot="fixed" vertical="bottom" horizontal="end">
                <ion-fab-button size="small" id="open-modal">
                <ion-icon :icon="fingerPrintOutline"></ion-icon>
                </ion-fab-button>
            </ion-fab>
            <ion-modal ref="modal" trigger="open-modal" :initial-breakpoint="0.25" :breakpoints="[0, 0.25, 0.5, 0.75]">
                <ion-content class="ion-padding">
                    <ion-list>
                    <ion-item>
                        <ion-avatar slot="start">
                        <ion-img src="https://i.pravatar.cc/300?u=b"></ion-img>
                        </ion-avatar>
                        <ion-label>
                        <h2>Connor Smith</h2>
                        <p>Sales Rep</p>
                        </ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-avatar slot="start">
                        <ion-img src="https://i.pravatar.cc/300?u=a"></ion-img>
                        </ion-avatar>
                        <ion-label>
                        <h2>Daniel Smith</h2>
                        <p>Product Designer</p>
                        </ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-avatar slot="start">
                        <ion-img src="https://i.pravatar.cc/300?u=d"></ion-img>
                        </ion-avatar>
                        <ion-label>
                        <h2>Greg Smith</h2>
                        <p>Director of Operations</p>
                        </ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-avatar slot="start">
                        <ion-img src="https://i.pravatar.cc/300?u=e"></ion-img>
                        </ion-avatar>
                        <ion-label>
                        <h2>Zoey Smith</h2>
                        <p>CEO</p>
                        </ion-label>
                    </ion-item>
                    </ion-list>
                </ion-content>
                </ion-modal>
        </ion-content>

    </ion-page>
</template>

<script lang="js" >
import { defineComponent } from 'vue'
// import {usePDF, VuePDF} from '@tato30/vue-pdf'
import pdf   from 'pdfvuer';
import { 
    IonContent,
    IonIcon,
    IonButton,
    IonPage,
    IonFab, 
    IonFabButton,
    IonModal,
    IonItem,
    IonList,
    IonAvatar,
    IonImg,
    IonLabel,
} from '@ionic/vue';
import { ref } from 'vue';
import { removeCircleOutline,addCircleOutline , chevronForwardOutline , chevronBackOutline , fingerPrintOutline} from 'ionicons/icons';
import { useRoute } from 'vue-router';
import store from '@/store';
export default defineComponent({
    components: {
        IonContent,
        pdf ,
        IonIcon,
        IonButton,
        IonPage,
        IonFab,
        IonFabButton,
        IonModal,
        IonItem,
        IonList,
        IonAvatar,
        IonImg,
        IonLabel,
    },
    mounted() {
        this.scale = (window.innerWidth *1.5) / 1000
    },
    watch: {
        '$route'(currentRoute){
            this.pdfId = currentRoute.params.id
        }
    },
    computed: {
        Pdf(){
            return store.getters.Pdf(this.pdfId)
        }
    },
    
    setup () {
        const route = useRoute();
        const myPdf = ref(null);
        const scale = ref(1);
        const currentPage = ref(1);
        const pdfId = route.params.id
        const enablement = ref(true)
        const numPages = ref(0);
        // const { pdf, pages, info } = usePDF(store.getters.Pdf(pdfId).url);
        const pdfUrl = store.getters.Pdf(pdfId).url
        store.getters.Pdf(pdfId)
        const getPages = (pages) => {
            numPages.value = pages
        }
        return {
            pdfUrl,
            numPages,
            currentPage,
            scale,
            myPdf,
            enablement,
            removeCircleOutline,
            addCircleOutline,
            pdfId: route.params.id,
            getPages,
            chevronBackOutline,
            chevronForwardOutline,
            fingerPrintOutline
        }
    }
})
</script>

<style scoped>
    .primary {
        background-color: #3880ff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin: 0 5px;
    }
    .text-center {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .footer {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 10px;
    }
    .header {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 10px;
    }
    .loop  {
        border-radius: 50%;
        padding: 2 !important;
        color: #3880ff;
        margin: 0 5px;
        font-size: 20px;
    }
</style>