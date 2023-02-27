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
      <div class="text-center" id="myPdf" ref="myPdf">
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

          <ion-img :src="signature.signature" :id="`signature_${signature.id}`" style="height: 60px;"></ion-img>
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
        const windowHeight = window.innerHeight;
        console.log('windowHeight',windowHeight)
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
                canvas[0].parentNode.parentNode.addEventListener("dragenter", (e)=> {
                  console.log('dragenter')
                  const textLayer = document.getElementsByClassName('textLayer');
                    if (textLayer) {
                      console.log('textLayer',textLayer)
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
                    e.preventDefault();
                });
                canvas[0].addEventListener("dragleave", (e)=> {
                  console.log('dragend')
                  const textLayer = document.getElementsByClassName('textLayer');
                    if (textLayer) {
                        for(let  i = 0; i < textLayer.length; i++){
                            textLayer[i].style.display = '';
                        }
                    }
                    const annotationLayer = document.getElementsByClassName('annotationLayer');
                    if (annotationLayer) {
                        for(let  i = 0; i < annotationLayer.length; i++){
                            annotationLayer[i].style.display = '';
                        }
                    }
                    e.preventDefault();
                });
                canvas[0].addEventListener("dragover", (e)=> {
                    
                    e.preventDefault();
                });
                canvas[0].addEventListener("drop", (e)=> {
                    e.preventDefault();
                    const data = e.dataTransfer.getData('text/plain');
                    const ctx = canvas[0].getContext('2d');
                    const img = new Image();
                    const textLayer = document.getElementsByClassName('textLayer');
                    const textLayerHeight = document.getElementsByClassName('textLayer')[0].offsetHeight;
                    console.log('textLayerHeight',textLayerHeight)
                    console.log('coef',textLayerHeight/windowHeight)
                    img.onload = () => {
                      // const x = e.offsetX*(ctx.canvas.width/canvas[0].offsetWidth)-((1/4) * img.width*(200/img.width));
                      // const y = e.offsetY*(ctx.canvas.height/canvas[0].offsetHeight)-((1/4) * img.height*(200/img.width));
                      
                      const x = e.offsetX*(textLayerHeight/windowHeight)-((1/4) * img.width*(200/img.width));
                      const y = e.offsetY*(textLayerHeight/windowHeight)-((1/4) * img.height*(200/img.width));
                        ctx.drawImage(img, x, y,img.width*(200/img.width),img.height*(200/img.width));

                    };
                    img.src = data;
                    if (textLayer) {
                        for(let  i = 0; i < textLayer.length; i++){
                            textLayer[i].style.display = '';
                        }
                    }
                    const annotationLayer = document.getElementsByClassName('annotationLayer');
                    if (annotationLayer) {
                        for(let  i = 0; i < annotationLayer.length; i++){
                            annotationLayer[i].style.display = '';
                        }
                    }

                });
            }
            const images = document.getElementsByClassName('signature_item');
            if (images) {
                for(let  i = 0; i < images.length; i++){
                    images[i].addEventListener("touchmove", (e)=> {
                      const touchLocation = e.targetTouches[0];
                      e.preventDefault();
                    });
                    images[i].addEventListener("touchend", (e)=> {
                      console.log("touchend")
                      const ctx = canvas[0].getContext('2d');
                      const touchLocation = e.changedTouches[0];
                      console.log("touchLocation",touchLocation)
                      console.log("ctx.canvas.width",ctx.canvas.width)
                      const imgMobile = new Image();
                      imgMobile.onload = () => {
                        // const x = touchLocation.pageX*(ctx.canvas.width/canvas[0].offsetWidth)-((1/4) * imgMobile.width*(200/imgMobile.width));
                        // const y = touchLocation.pageY*(ctx.canvas.width/canvas[0].offsetWidth)-((1/4) * imgMobile.width*(200/imgMobile.width)+ document.getElementById('myPdf').offsetTop);
                        const offsetTop = window.offsetTop;
                        
                        const textLayer = document.getElementsByClassName('textLayer');
                        const textLayerHeight = document.getElementsByClassName('textLayer')[0].offsetHeight;
                        console.log('textLayerHeight',textLayerHeight)
                    console.log('coef',textLayerHeight/windowHeight)
                        const x = touchLocation.pageX*(ctx.canvas.width/canvas[0].offsetWidth)-((1/4) * imgMobile.width*(200/imgMobile.width));
                        const y = touchLocation.pageY*(textLayerHeight/canvas[0].offsetWidth)-((1/4) * imgMobile.width*(200/imgMobile.width)+ document.getElementById('myPdf').offsetTop);
                        
                        const offsetY = ctx.drawImage(imgMobile, x, y,imgMobile.width*(200/imgMobile.width),imgMobile.height*(200/imgMobile.width));
                      };
                      imgMobile.src = images[i].firstChild.src;
                        e.preventDefault();
                    });

                }
            }
          }

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
  height: 20%;
}
.signature_item {
  width: 30%;
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
