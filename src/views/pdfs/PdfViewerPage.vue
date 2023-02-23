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
                        @loading="renderPdf"
                        :text="true" />

            </div>
            <ion-list lines="inset" id="signatures">
                <div class="side">
                    <div class="box"
                        draggable="true"
                        @dragstart="dragstartOutDP">
                        <ion-item  v-for="signature in signatures"
                            :key="signature.id"> 
                            <ion-avatar slot="start">
                                <ion-img :src="signature.signature"></ion-img>
                            </ion-avatar>
                            <ion-label>
                    
                                <h2>{{ signature.name }}</h2>
                            </ion-label>
                        </ion-item>
                    </div>
                </div>
            </ion-list>
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
            <!-- <ion-modal ref="modal" trigger="open-modal" :initial-breakpoint="0.25" :breakpoints="[0, 0.25, 0.5]">
                <ion-content class="ion-padding">
                <ion-list lines="inset" id="signatures">
                    <div class="side">
                        <div class="box"
                            draggable="true"
                            @dragstart="dragstartOutDP">
                            <ion-item  v-for="signature in signatures"
                                :key="signature.id"> 
                                <ion-avatar slot="start">
                                    <ion-img :src="signature.signature"></ion-img>
                                </ion-avatar>
                                <ion-label>
                        
                                    <h2>{{ signature.name }}</h2>
                                </ion-label>
                            </ion-item>
                        </div>
                    </div>
                </ion-list>
                </ion-content>
                </ion-modal> -->
        </ion-content>

    </ion-page>
</template>

<script lang="js" >
import { defineComponent } from 'vue'
import pdf   from 'pdfvuer';
import { 
    IonContent,
    IonIcon,
    IonButton,
    IonPage,
    IonFab, 
    IonFabButton,
    // IonModal,
    IonItem,
    IonList,
    IonAvatar,
    IonImg,
    IonLabel,
} from '@ionic/vue';
import { ref , reactive} from 'vue';
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
        // IonModal,
        IonItem,
        IonList,
        IonAvatar,
        IonImg,
        IonLabel,
    },
    mounted() {
        this.scale = (window.innerWidth *1.5) / 1000 ;
        
    },
    watch: {
        '$route'(currentRoute){
            this.pdfId = currentRoute.params.id
        }
    },
    computed: {
        Pdf(){
            return store.getters.Pdf(this.pdfId)
        },
        signatures() {
            return store.getters.signatures
        }
    },    
    setup () {
        // 
        const canvasWidth  = ref(1)
        const canvasHeight = ref(1)
        const chartList    = ref([])
        const offset       = reactive({ x: 0, y: 0 })
        const chartId      = ref(0)
        // 
        const route = useRoute();
        const myPdf = ref(null);
        const scale = ref(1);
        const currentPage = ref(1);
        const pdfId = route.params.id
        const enablement = ref(true)
        const numPages = ref(0);
        const pdfUrl = store.getters.Pdf(pdfId).url
        store.getters.Pdf(pdfId)
        const getPages = (pages) => {
            numPages.value = pages
        };
        canvasWidth.value  = window.innerWidth;
        canvasHeight.value = window.innerHeight/2;
        const dragstartOutDP =(event)=> {
            // offset = {
            //     x: event.offsetX,
            //     y: event.offsetY,
            // }
            offset.x = event.offsetX
            offset.y = event.offsetY
            console.info('[Event]', 'dragstart-out', event, offset)
            // event.dataTransfer.effectAllowed ='move';
            // event.dataTransfer.setData('text/plain', JSON.stringify(offset));
            // event.dataTransfer.dropEffect ='move';
            // event.preventDefault();

        };
        const renderPdf = (loading) => {
           if (!loading){ 
            const canvas = document.getElementsByTagName('canvas');
            console.log('canvas', canvas);
            if (canvas) {
                const textLayer = document.getElementsByClassName('textLayer');
                if (textLayer) {
                    for(let  i = 0; i < textLayer.length; i++){
                        textLayer[i].style.display = 'none';
                    }
                }
                const annotationLayer = document.getElementsByClassName('annotationLayer');
                if (annotationLayer) {
                    for(let  i = 0; i < annotationLayer.length; i++){
                        annotationLayer[i].style.display = 'none';
                    }
                }
                // canvas[0].addEventListener("dragstart", (e)=> {
                //     console.info('[Event]', 'dragstart', e)
                //     e.dataTransfer.effectAllowed ='move';
                //     e.dataTransfer.setData('text/plain', JSON.stringify(offset));
                //     e.dataTransfer.dropEffect ='move';
                //     e.preventDefault();
                // });
                // canvas[0].addEventListener("dragend", (e)=> {
                //     console.info('[Event]', 'dragend', e)
                //     e.preventDefault();
                // });
                // canvas[0].addEventListener("dragenter", (e)=> {
                //     console.info('[Event]', 'dragenter', e)
                //     e.preventDefault();
                // });
                // canvas[0].addEventListener("dragleave", (e)=> {
                //     console.info('[Event]', 'dragleave', e)
                //     e.preventDefault();
                // });
                canvas[0].addEventListener("dragover", (e)=> {
                    console.info('[Event]', 'dragover', e)
                    e.preventDefault();
                });
                canvas[0].addEventListener("drop", (e)=> {
                    e.preventDefault();
                    console.info('[Event]', 'drop', e)
                    const data = e.dataTransfer.getData('text/plain');
                    const ctx = canvas[0].getContext('2d');

                    const img = new Image();
                    img.onload = () => {
                        // ctx.drawImage(img, 0, 0);
                        // drow the img in the cursor position
                        ctx.drawImage(img, e.offsetX, e.offsetY,100,100);
                        
                    };
                    img.src = data;

                });
                console.log(canvas[0].addEventListener)
                // canvas[0].onclick= (e)=> {
                //     console.log('nowwwwwwwwwwwwwwwwwwwwwwwww')
                //     console.info('[Event]', 'canvas-click', e)
                //     event.preventDefault();
                // };
            }}
        };
        const dropInCanvas=(event, position)=> {
            const canvas = document.getElementsByTagName('canvas')
            const ctx = canvas[0].getContext('2d');
            const image = document.getElementById('signature');
            ctx.drawImage(image,position.x, position.y, 100, 100, 150,150 ,image.width, image.height);
            
            console.log('hereeee');
            console.log('canvas', canvas[0].width, canvas[0].height);
            console.info('[Event]', 'drop-in', event, position)
            // console.info('[Event]', 'drop-in', event, position)
            const annotation = document.getElementsByClassName('annotationLayer')
            console.log('annotation', annotation[0].offsetWidth, annotation);
            // event.preventDefault();
            // chartId.value = Number((Math.random() * 10 ** 4).toFixed(0))
            // chartList.value.push({
            //     id    : chartId.value,
            //     width : 300,
            //     height: 200,
            //     x     : position.x - offset.x,
            //     y     : position.y - offset.y,
            // })

        };
        const canvasScale=(scale)=> {
            console.info('[Event]', 'canvas-scale', scale)
        };
        const chartMove=(item)=> {
            console.info('[Event]', 'chart-move', item)
        };
        const chartScale=(item)=> {
            console.info('[Event]', 'chart-scale', item)
        };
        
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
            fingerPrintOutline,
            // 
            canvasWidth,
            canvasHeight,
            chartList,
            offset,
            chartId,
            // 
            dragstartOutDP,
            dropInCanvas,
            canvasScale,
            chartMove,
            chartScale,
            renderPdf
        }
    }
})
</script>

<style scoped >
    .draggable-panel {
        background-color: antiquewhite;
        
    }
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