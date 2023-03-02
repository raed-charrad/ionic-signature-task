<template>
  <ion-page>
    <ion-content class="content">
      <div class="header">
        <template v-if="isLoading">
          Loading...
        </template>

        <template v-else>
          <div>
            <span v-if="showAllPages">
              {{ numPages }} page(s)
            </span>
  
            <span v-else>
              <button class="butn" :disabled="currentPage <= 1" @click="currentPage--">❮</button>
  
              {{ currentPage }} / {{ numPages }}
  
              <button class="butn" :disabled="currentPage >= numPages" @click="currentPage++">❯</button>
            </span>
          </div>

          <label class="right">
            <input v-model="showAllPages" type="checkbox">

            Show all pages
          </label>
        </template>
      </div>
      <div class="text-center" id="myPdf" ref="myPdf">
        <VuePdfEmbed
          ref="pdfRef"
          :source="pdfUrl"
          :page="currentPage"
          @rendered="handleDocumentRender"
          @vnode-updated="renderPdf"
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
      
      
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button size="small" id="open-signature" @click="OpenSignature()">
          <ion-icon :icon="fingerPrintOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
  
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
// import pdf   from 'pdfvuer';
import VuePdfEmbed from 'vue-pdf-embed'

import {
    IonContent,
    IonIcon,
    IonButton,
    IonPage,
    IonFab,
    IonFabButton,
    IonImg,
} from '@ionic/vue';
import { onMounted,ref , reactive} from 'vue';
import { removeCircleOutline,addCircleOutline , chevronForwardOutline , chevronBackOutline , fingerPrintOutline} from 'ionicons/icons';
import { useRoute } from 'vue-router';
import store from '@/store';
export default defineComponent({
    components: {
        IonContent,
        VuePdfEmbed ,
        IonIcon,
        IonPage,
        IonFab,
        IonFabButton,
        IonImg,
    },
    mounted() {
        this.scale = (window.innerWidth *1.5) / 1000 ;
        const signatures = document.getElementById('signatures');
        signatures!.style.display = 'none';
    },
    watch: {
        '$route'(currentRoute){
            this.pdfId = currentRoute.params.id
        },
        showAllPages() {
            this.currentPage = this.showAllPages ? 0 : 1;
        },
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
        const offset= reactive({ x: 0, y: 0 })
        //
        const pdfRef = ref();
        // 
        const isLoading = ref(true);
        const showAllPages = ref(false);
        // 
        const route = useRoute();
        const myPdf = ref(null);
        const scale = ref(1);
        const currentPage = ref(1);
        const pdfId = route.params.id
        const numPages = ref(0);
        const pdfUrl = store.getters.Pdf(pdfId).url
        const windowHeight = window.innerHeight;
        const draggedSignature = ref();
        const draggedSignatureMobile = ref();
        const currentPageNumber = ref(0);
        store.getters.Pdf(pdfId)
        const handleDocumentRender = () => {
          isLoading.value = false;
            numPages.value = pdfRef.value.pageCount;
        };
        const dragstartOutDP =(event: any)=> {
            offset.x = event.offsetX
            offset.y = event.offsetY
        };
        const renderPdf = () => {
          console.log("currentPageNumber", currentPageNumber.value);
          currentPageNumber.value = currentPage.value
          console.log("currentPageNumber", currentPageNumber.value);
          
          const vuePdfEmbed = document.getElementsByClassName("vue-pdf-embed")
          const canva = document.getElementsByTagName('canvas');
          if(vuePdfEmbed.length > 0){
            console.log(vuePdfEmbed);
              (vuePdfEmbed[0] as HTMLElement).ontouchmove = () =>{
             const rect = (vuePdfEmbed[0] as HTMLElement).getBoundingClientRect();
             currentPageNumber.value = Math.round(Math.abs(rect.top) / (+((canva[0].style.height).replace('px',''))));
             console.log('currentPageNumber',currentPageNumber);
            }
          }
          console.log("render")
            const canvas = document.getElementsByTagName('canvas');
            if (canvas) {
                const annotationLayer = document.getElementsByClassName('annotationLayer');
                  for (let can = 0; can < canvas.length; can++) {
                    // remove all eventListeners 
        
                    canvas[can]?.parentNode?.removeEventListener("dragover", (e) => {
                      console.log("dragover remove");
                      e.preventDefault();
                    });
                    canvas[can]?.parentNode?.removeEventListener("dragenter", dragenter);
                    canvas[can]?.parentNode?.removeEventListener("dragleave", dragleave);
                    canvas[can]?.parentNode?.removeEventListener("drop", (e : any)=> {console.log('removed')});
                    (canvas[can]!.parentNode! as HTMLElement).ondragenter= dragenter;
                    (canvas[can]!.parentNode! as HTMLElement).ondragleave = dragleave;
                    (canvas[can]!.parentNode! as HTMLElement).ondragover = (e)=> {e.preventDefault();};
                    (canvas[can]!.parentNode! as HTMLElement).ondrop= (e : any)=> {
                      e.preventDefault();
                      const annot = document.querySelectorAll('.annotationLayer');
                        if ( draggedSignature.value!=null){
                        draggedSignature.value.remove();
                        draggedSignature.value = null; 
                        }
                        const data = e.dataTransfer?.getData('text/plain');
                        const textLayer = document.getElementsByClassName('textLayer');
                        const section = document.createElement('section');
                        const img = document.createElement('img');
                        section.style.position = 'absolute';
                        img.src = data as string;
                        section.style.top = (e.offsetY-img.height*(200/img.height)/4) + 'px';
                        section.style.left = (e.offsetX-img.width*(200/img.width)/4 )+ 'px';
                        section.style.zIndex = '100';
                        section.appendChild(img);
                        img.style.maxWidth = img.width*(200/img.width) + 'px';
                        img.style.maxHeight = img.height*(200/img.width) + 'px';
                        img.onload = () => {
                          annot[can].appendChild(section);
                          if (textLayer) {
                              for(let  i = 0; i < textLayer.length; i++){
                                (textLayer[i] as HTMLElement).style.display = '';
                              }
                          }
                        }
                        section.addEventListener("dragstart", (e : any)=> {
                          draggedSignature.value = section;
                        });
                        section.addEventListener("dragend", (e)=> {
                            draggedSignature.value = section;
                        });
                    };
                  }
                // }
            }
            const images = document.getElementsByClassName('signature_item');
            const clientX = ref(0)
            const clientY = ref(0)
            if (images) {
                for(let  i = 0; i < images.length; i++){
                    images[i].removeEventListener("touchstart", (e : any)=> {
                      draggedSignatureMobile.value = images[i];
                    });
                    images[i].removeEventListener("touchmove", (e : any)=> {
                      clientX.value = e.touches[0].clientX;
                      clientY.value = e.touches[0].clientY;
                    });
                    images[i].removeEventListener("touchend", (e : any) => {
                      const touchLocation = e.changedTouches[0];
                      const annot = document.querySelectorAll('.annotationLayer');
                      console.log("annot",annot)

                      const textLayer = document.getElementsByClassName('textLayer');
                      const section = document.createElement('section');
                      const imgMobile = document.createElement('img');
                      const canvas = document.querySelectorAll('.canvas');
                      section.style.position = 'absolute';
                      imgMobile.src = (images[i].firstChild as HTMLImageElement)?.src as string;
                      section.style.top = (touchLocation.clientY-imgMobile.height*(200/imgMobile.height)/4) + 'px';
                      section.style.left = (touchLocation.clientX-imgMobile.width*(200/imgMobile.width)/4 )+ 'px';
                      section.style.zIndex = '100';
                      imgMobile.style.maxWidth = imgMobile.width*(100/imgMobile.width) + 'px';
                      imgMobile.style.maxHeight = imgMobile.height*(100/imgMobile.width) + 'px';
                      section.appendChild(imgMobile);
                      
                      imgMobile.onload = () => {
                        if (annot.length == 1){
                            annot[0].appendChild(section);
                          }else{
                            annot[currentPageNumber.value].appendChild(section);

                        }
                        if (textLayer) {
                            for(let  i = 0; i < textLayer.length; i++){
                              (textLayer[i] as HTMLElement).style.display = '';
                            }
                        }
                      }
                      section.addEventListener("touchstart", (e : any)=> {
                        e.preventDefault();

                        draggedSignatureMobile.value = section;
                       
                      });
                      section.addEventListener("touchend", (e)=> {
                        e.preventDefault();

                        if (draggedSignatureMobile.value != null) {
                          draggedSignatureMobile.value.remove();
                          draggedSignatureMobile.value = null;
                        }
                        const touchLocation = e.changedTouches[0];
                        section.style.position = 'absolute';
                        imgMobile.src = (images[i].firstChild as HTMLImageElement)?.src as string;
                        section.style.top = (touchLocation.clientY-imgMobile.height*(200/imgMobile.height)/4) + 'px';
                        section.style.left = (touchLocation.clientX-imgMobile.width*(200/imgMobile.width)/4 )+ 'px';
                        section.style.zIndex = '100';
                        imgMobile.style.maxWidth = imgMobile.width*(100/imgMobile.width) + 'px';
                        imgMobile.style.maxHeight = imgMobile.height*(100/imgMobile.width) + 'px';
                        section.appendChild(imgMobile);
                        imgMobile.onload = () => {
                        
                          if (annot.length == 1){
                            annot[0].appendChild(section);
                          }else{
                            annot[currentPageNumber.value].appendChild(section);

                        }
                          if (textLayer) {
                              for(let  i = 0; i < textLayer.length; i++){
                                (textLayer[i] as HTMLElement).style.display = '';
                              }
                          }
                        }
                      });
                      e.preventDefault();
                    });
                    (images[i] as HTMLElement).ontouchstart = (e : any)=> {
                      clientX.value = e.touches[0].clientX;
                      clientY.value = e.touches[0].clientY;
                    };
                    (images[i] as HTMLElement).ontouchmove = (e : any)=> {
                      const touchLocation = e.targetTouches[0];
                      e.preventDefault();
                    };
                    (images[i] as HTMLElement).ontouchend = (e : any)=> {
                      const touchLocation = e.changedTouches[0];
                      const annot = document.querySelectorAll('.annotationLayer');
                      console.log("annot",annot)

                      const textLayer = document.getElementsByClassName('textLayer');
                      const section = document.createElement('section');
                      const imgMobile = document.createElement('img');
                      const canvas = document.querySelectorAll('.canvas');
                      section.style.position = 'absolute';
                      imgMobile.src = (images[i].firstChild as HTMLImageElement)?.src as string;
                      section.style.top = ((touchLocation.clientY )-imgMobile.height*(200/imgMobile.height)/4) + 'px';
                      section.style.left = (touchLocation.clientX-imgMobile.width*(200/imgMobile.width)/4 )+ 'px';
                      section.style.zIndex = '100';
                      imgMobile.style.maxWidth = imgMobile.width*(100/imgMobile.width) + 'px';
                      imgMobile.style.maxHeight = imgMobile.height*(100/imgMobile.width) + 'px';
                      section.appendChild(imgMobile);
                      
                      imgMobile.onload = () => {
                        if (annot.length == 1){
                            annot[0].appendChild(section);
                          }else{
                            annot[currentPageNumber.value].appendChild(section);

                        }
                        if (textLayer) {
                            for(let  i = 0; i < textLayer.length; i++){
                              (textLayer[i] as HTMLElement).style.display = '';
                            }
                        }
                      }
                      section.addEventListener("touchstart", (e : any)=> {
                        e.preventDefault();

                        draggedSignatureMobile.value = section;
                       
                      });
                      section.addEventListener("touchend", (e)=> {
                        e.preventDefault();

                        if (draggedSignatureMobile.value != null) {
                          draggedSignatureMobile.value.remove();
                          draggedSignatureMobile.value = null;
                        }
                        const touchLocation = e.changedTouches[0];
                        section.style.position = 'absolute';
                        imgMobile.src = (images[i].firstChild as HTMLImageElement)?.src as string;
                        section.style.top = (touchLocation.clientY-imgMobile.height*(200/imgMobile.height)/4) + 'px';
                        section.style.left = (touchLocation.clientX-imgMobile.width*(200/imgMobile.width)/4 )+ 'px';
                        section.style.zIndex = '100';
                        imgMobile.style.maxWidth = imgMobile.width*(100/imgMobile.width) + 'px';
                        imgMobile.style.maxHeight = imgMobile.height*(100/imgMobile.width) + 'px';
                        section.appendChild(imgMobile);
                        imgMobile.onload = () => {
                        
                          if (annot.length == 1){
                            annot[0].appendChild(section);
                          }else{
                            annot[currentPageNumber.value].appendChild(section);

                        }
                          if (textLayer) {
                              for(let  i = 0; i < textLayer.length; i++){
                                (textLayer[i] as HTMLElement).style.display = '';
                              }
                          }
                        }
                      });
                      e.preventDefault();
                    };

                }
            }
        };
        const dragenter = () => {
          const textLayer = document.getElementsByClassName('textLayer');
          if (textLayer) {
            for(let  i = 0; i < textLayer.length; i++){
              (textLayer[i] as HTMLElement).style.display = '';
            }
          }
        };
        const dragleave = () => {
          const textLayer = document.getElementsByClassName('textLayer');
          if (textLayer) {
            for(let  i = 0; i < textLayer.length; i++){
              (textLayer[i] as HTMLElement).style.display = 'none';
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
            carousel()
        };
        const nextSignature=()=> {
           if((store.getters.signatures.length)-2  <= sig.value){
             return;
            }
            sig.value += 2;
            carousel()

        };
        const carousel=() =>{
            const signatures = document.querySelectorAll('.signature_item');
            for (let i = 0; i < signatures.length; i++) {
                (signatures[i] as HTMLElement).style.display = 'none';
            }

        }
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
            removeCircleOutline,
            addCircleOutline,
            pdfId: route.params.id,
            handleDocumentRender,
            chevronBackOutline,
            chevronForwardOutline,
            fingerPrintOutline,
            //
            offset,
            //
            dragstartOutDP,
            renderPdf,
            previousSignature,
            nextSignature,
            carousel,
            sig,
            OpenSignature,
            windowHeight,
            pdfRef,
            isLoading,
            showAllPages,
            dragleave,
            dragenter,
            onscroll,
            currentPageNumber


        }
    }
})
</script>

<style>
.vue-pdf-embed{
  width: 100%!important;
}
.vue-pdf-embed>div{
  box-shadow: 2px 2px 2px 2px rgb(255, 0, 0)!important;
  color: #555;
}
.butn{
  padding: 5px;
  border-radius: 5px;
  background-color: transparent;
  color: #fff;
}
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
  justify-content: space-between;
  padding: 16px;
  box-shadow: 0 2px 8px 4px rgba(0, 0, 0, 0.1);
  background-color: #555;
  color: #ddd;
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
