<template>
  <ion-page>
    <ion-content class="content">
      <div class="header">
        <button
          fill="outline"
          class="loop"
          @click="scale = scale > 0.25 ? scale - 0.25 : 0.25"
        >
          <ion-icon :icon="removeCircleOutline"></ion-icon>
        </button>
        <button
          fill="outline"
          class="loop"
          shape="round"
          @click="scale = scale < 2 ? scale + 0.25 : 2"
        >
          <ion-icon :icon="addCircleOutline"></ion-icon>
        </button>
      </div>
      <div class="text-center" ref="myPdf">
        <pdf
          :scale="scale"
          :src="pdfUrl"
          @numpages="getPages"
          :page="currentPage"
          :annotation="true"
          @loading="renderPdf"
          :text="true"
        />
      </div>
      <div class="signatures" id="signatures">
        <button id="prev" @click="previousSignature()" class="sig-btn">
          <ion-icon size="large"  :icon="chevronBackOutline"></ion-icon>
        </button>
        <div
          class="signature_item"
          v-for="(signature,index) in signatures"
          :key="signature.id" v-show="index == sig || index == sig+1"
        >

          <ion-img :src="signature.signature" :id="`signature_${signature.id}`"></ion-img>
        </div>
        <button id="next" @click="nextSignature()" class="sig-btn">
          <ion-icon size="large" :icon="chevronForwardOutline"></ion-icon>
        </button>
      </div>
      
      <div class="text-center footer">
        <ion-button
          class="primary"
          @click="currentPage = currentPage > 1 ? currentPage - 1 : 1"
        >
          <ion-icon :icon="chevronBackOutline"></ion-icon>
        </ion-button>
        <div>{{ currentPage }} / {{ numPages }}</div>
        <ion-button
          class="primary"
          @click="
            currentPage = currentPage < numPages ? currentPage + 1 : numPages
          "
        >
          <ion-icon :icon="chevronForwardOutline"></ion-icon>
        </ion-button>
      </div>
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button size="small" id="open-signature" @click="OpenSignature()">
          <ion-icon :icon="fingerPrintOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
  
    </ion-content>
  </ion-page>
</template>

<script lang="js">
import { defineComponent } from 'vue'
import pdf   from 'pdfvuer';

import {
    IonContent,
    IonIcon,
    IonButton,
    IonPage,
    IonFab,
    IonFabButton,
    IonImg,
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
        IonImg,
    },
    mounted() {
        this.scale = (window.innerWidth *1.5) / 1000 ;
        const signatures = document.getElementById('signatures');
        signatures.style.display = 'none';
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
        canvasHeight.value = window.innerHeight;
        const dragstartOutDP =(event)=> {
            offset.x = event.offsetX
            offset.y = event.offsetY
        };
        const renderPdf = (loading) => {
           if (!loading){
            const canvas = document.getElementsByTagName('canvas');
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
                    e.preventDefault();
                });
                canvas[0].addEventListener("drop", (e)=> {
                    e.preventDefault();
                    const data = e.dataTransfer.getData('text/plain');
                    const ctx = canvas[0].getContext('2d');
                    const img = new Image();
                    img.onload = () => {
                      const x = e.offsetX*(ctx.canvas.width/canvas[0].offsetWidth)-((1/4) * img.width*(200/img.width));
                      const y = e.offsetY*(ctx.canvas.height/canvas[0].offsetHeight)-((1/4) * img.height*(200/img.width));
                        ctx.drawImage(img, x, y,img.width*(200/img.width),img.height*(200/img.width));

                    };
                    img.src = data;

                });
            }}
        };
        const dropInCanvas=(event, position)=> {
            const canvas = document.getElementsByTagName('canvas')
            const ctx = canvas[0].getContext('2d');
            const image = document.getElementById('signature');
            ctx.drawImage(image,position.x, position.y, 100, 100, 150,150 ,image.width, image.height);

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
        const sig = ref(0);
        const previousSignature=()=> {
            if (sig.value === 0) {
                return;
            }
            sig.value -= 2;
            if (sig.value < 0) {
                sig.value = 0;
            }
            carousel(sig.value)
        };
        const nextSignature=()=> {
           if((store.getters.signatures.length)-2  <= sig.value){
             return;
            }
            sig.value += 2;
            carousel(sig.value)

        };
        const carousel=(signature) =>{
            const signatures = document.querySelectorAll('.signature_item');
            for (let i = 0; i < signatures.length; i++) {
                signatures[i].style.display = 'none';
            }
            // document.getElementById(`signature_${signature}`).style.display = 'block';
            // document.getElementById(`signature_${signature}`).style.display = 'block';
            // document.getElementById(`signature_${signature}`).style.transform = `translateX(${document.getElementById(`signature_${signature}`).offsetLeft}px)`;

            // if (signature < 0) {
            //     signature = signatures.length - 1;
            //     sig.value = signatures.length - 1;
            //     // document.getElementsByClassName('signature_item')[signature].style.display = 'block';
            //     return;
            // }
            // document.getElementsByClassName('signature_item')[signature].style.display = 'block';

            // if (carousel) {
            //     carousel.style.display = 'none';
            // }
            // let signature = document.getElementById('signature_item');
            // if (signature) {
            //     signature.style.display = 'none';
            // }
            // signature = document.getElementById(signature);
            // signature.style.display = 'block';
            // carousel = document.getElementById('carousel');
            // carousel.style.display = 'block';
            // signature.style.display = 'block';
            // signature.style.transform = `translateX(${signature.offsetLeft}px) translateY(${signature.offsetTop}px)`;
            // signature.style.transition = 'transform 0.5s ease-in-out';


        }
        carousel(sig.value)
        const OpenSignature = () => {
          const signatures = document.getElementById('signatures');
            if (signatures) {
              if (signatures.style.display === 'none') {
                signatures.style.display = 'flex';
              } else {
                signatures.style.display = 'none';
              }
            }
           
            
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
            renderPdf,
            previousSignature,
            nextSignature,
            carousel,
            sig,
            OpenSignature
        }
    }
})
</script>

<style scoped>
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
.loop {
  border-radius: 50%;
  padding: 2 !important;
  color: #3880ff;
  margin: 0 5px;
  font-size: 20px;
}
.signatures {
  position: fixed;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  padding: 30px;
  background-color: #aaaaaa4f;
  width: 100%;
}
.signature_item {
  width: 30%;
  height: 30%;
  margin: 0 5px;
}
.block{
    display: block;
}
.show_signature{
    display: block;
}
.hide_signature{
    display: none;
}
.sig-btn{
    background-color: transparent;
    margin: 20px;
}
</style>
