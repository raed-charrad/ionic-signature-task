<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button
            default-href="/list"
            text=" "
            :icon="chevronBackOutline"
          ></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="content">
      <div class="header">
        <template v-if="isLoading"> Loading... </template>

        <template v-else>
          <div>
            <span v-if="showAllPages"> {{ numPages }} page(s) </span>

            <span v-else>
              <button
                class="butn"
                :disabled="currentPage <= 1"
                @click="currentPage--"
              >
                ❮
              </button>

              {{ currentPage }} / {{ numPages }}

              <button
                class="butn"
                :disabled="currentPage >= numPages"
                @click="currentPage++"
              >
                ❯
              </button>
            </span>
          </div>

          <label class="right">
            <input v-model="showAllPages" type="checkbox" />

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
      <div class="delete-droppable-zone" v-if="showDeleteDiv">
        <ion-icon
          size="large"
          class="delete-icon"
          :icon="trashOutline"
        ></ion-icon>

        <div class="delete-droppable-text">
          <span>Drop here to delete signature</span>
        </div>
      </div>
      <div class="signatures" id="signatures">
        <button id="prev" @click="previousSignature()" class="sig-btn">
          <ion-icon size="large" :icon="chevronBackOutline"></ion-icon>
        </button>
        <div
          class="signature_item"
          v-for="(signature, index) in signatures"
          :key="signature.id"
          v-show="index == sig || index == sig + 1"
        >
          <ion-img
            :src="signature.signature"
            :id="`signature_${signature.id}`"
            style="height: 60px"
          ></ion-img>
        </div>
        <button id="next" @click="nextSignature()" class="sig-btn">
          <ion-icon size="large" :icon="chevronForwardOutline"></ion-icon>
        </button>
      </div>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button
          size="small"
          id="open-signature"
          @click="OpenSignature()"
        >
          <ion-icon :icon="fingerPrintOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
// import pdf   from 'pdfvuer';
import VuePdfEmbed from "vue-pdf-embed";

import {
  IonContent,
  IonIcon,
  IonPage,
  IonFab,
  IonFabButton,
  IonImg,
  alertController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from "@ionic/vue";
import { onMounted, ref, reactive } from "vue";
import {
  removeCircleOutline,
  addCircleOutline,
  chevronForwardOutline,
  chevronBackOutline,
  fingerPrintOutline,
  caretBackOutline,
  trashOutline,
} from "ionicons/icons";
import { useRoute } from "vue-router";
import store from "@/store";
import { SignedPdf } from "../../models/signedPdf";
export default defineComponent({
  components: {
    IonContent,
    VuePdfEmbed,
    IonIcon,
    IonPage,
    IonFab,
    IonFabButton,
    IonImg,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonHeader,
  },
  watch: {
    $route(currentRoute) {
      this.pdfId = currentRoute.params.id;
    },
    showAllPages() {
      this.currentPage = this.showAllPages ? 0 : 1;
    },
  },
  computed: {
    Pdf() {
      return store.getters.Pdf(this.pdfId);
    },
    signatures() {
      return store.getters.signatures;
    },
  },
  setup() {
    const offset = reactive({ x: 0, y: 0 });
    const pdfRef = ref();
    const isLoading = ref(true);
    const showAllPages = ref(false);
    const route = useRoute();
    const myPdf = ref(null);
    const scale = ref(1);
    const currentPage = ref(1);
    const pdfId = route.params.id;
    const numPages = ref(0);
    const pdfUrl = store.getters.Pdf(pdfId).url;
    const windowHeight = window.innerHeight;
    const draggedSignature = ref();
    const draggedSignatureMobile = ref();
    const currentPageNumber = ref(1);
    const showDeleteDiv = ref(false);
    const deletedSig = ref();
    const openSignatureDiv = ref(false);
    store.getters.Pdf(pdfId);
    const signedPdf = store.getters.signedPdfs;
    // const PdfSignatures equals to an array of SignedPdf
    const PdfSignatures = signedPdf.map((pdf: any) => {
      return new SignedPdf(pdf.pdfId, pdf.signature, pdf.page, pdf.position);
    });
    // const PdfSignatures equals to an array of SignedPdf

    const handleDocumentRender = () => {
      isLoading.value = false;
      numPages.value = pdfRef.value.pageCount;
      loadSignatures()
    };
    const dragstartOutDP = (event: any) => {
      offset.x = event.offsetX;
      offset.y = event.offsetY;
    };


    watch(showAllPages,()=>{
      loadSignatures()
    });
    onMounted(() => {
      const vuePdfEmbed = document.getElementsByClassName("vue-pdf-embed");
      const canva = document.getElementsByTagName("canvas");
      if (vuePdfEmbed.length > 0) {
        (vuePdfEmbed[0] as HTMLElement).ontouchmove = () => {
          const rect = (vuePdfEmbed[0] as HTMLElement).getBoundingClientRect();
          if (canva.length == 1) {
            currentPageNumber.value =  currentPage.value;
          } else {
            currentPageNumber.value = Math.round(
              Math.abs(rect.top) / +canva[0].style.height.replace("px", "")
              );
          }
          };
        }
    });
    const showSignature = (posX : number , posY : number , imgSrc : string , page : number , save : boolean)=>{
            const textLayer = document.getElementsByClassName("textLayer");
            const canvas = document.getElementsByTagName("canvas");
            const section = document.createElement("section");
            const imgMobile = document.createElement("img");
            imgMobile.src = imgSrc;
            const annot: any = [];
            section.appendChild(imgMobile);
            imgMobile.onload = () => {
              for (let i = 0; i < canvas.length; i++){
                annot.push(canvas[i]?.parentNode?.lastChild)
              }
              section.style.position = "absolute";
              imgMobile.style.maxWidth =imgMobile.width * (100 / imgMobile.width) + "px";
              imgMobile.style.maxHeight =imgMobile.height * (100 / imgMobile.width) + "px";
              if (annot.length == 1) {
                const canvasRect = canvas[showAllPages.value ? page-1 : 0].getBoundingClientRect();
                section.style.top =Math.abs(posY -canvasRect.top -(imgMobile.height * (200 / imgMobile.height)) / 4) +"px";
                section.style.left =Math.abs(posX -canvasRect.left -(imgMobile.width * (200 / imgMobile.width)) / 4) +"px";
                annot[0].appendChild(section);
                if (save){
                  store.dispatch("signPdf", {
                    pdfId: pdfId,
                    page: page,
                    signature: imgMobile.src,
                    position: {
                      x: posX,
                      y: posY,
                    },
                  });
                }
              } else {
                if (save){
                  const canvasRect = canvas[showAllPages.value ? page : 0].getBoundingClientRect();
                  section.style.top =Math.abs(posY -(canvasRect.top /canvas.length ) -(imgMobile.height * (200 / imgMobile.height)) / 4) +"px";
                  section.style.left =Math.abs(posX -canvasRect.left -(imgMobile.width * (200 / imgMobile.width)) / 4) +"px";
                  annot[page].appendChild(section);
                  store.dispatch("signPdf", {
                  pdfId: pdfId,
                  page: page+1,
                  signature: imgMobile.src,
                  position: {
                    x: posX,
                    y: posY,
                  },
                });
                }else{
                  const canvasRect = canvas[showAllPages.value ? page-1 : 0].getBoundingClientRect();
                  section.style.top =Math.abs(posY -(canvasRect.top /canvas.length ) -(imgMobile.height * (200 / imgMobile.height)) / 4) +"px";
                  section.style.left =Math.abs(posX -canvasRect.left -(imgMobile.width * (200 / imgMobile.width)) / 4) +"px";
                  annot[page-1].appendChild(section);
                }
            }
          }
          section.addEventListener("touchstart", (e: any) => {
              e.preventDefault();
              draggedSignatureMobile.value = section;
              openSignatureDiv.value = true;
              showDeleteDiv.value = true;
              OpenSignature();
            });
            section.addEventListener("touchend", (e) => {
              e.preventDefault();
              const touchLocation = e.changedTouches[0];
              const deleteZone = document.querySelector(".delete-droppable-zone");
              if (deleteZone) {
                const deleteZoneRect = deleteZone.getBoundingClientRect();
                if (
                  touchLocation.clientX >= deleteZoneRect.left &&
                  touchLocation.clientX <= deleteZoneRect.right &&
                  touchLocation.clientY >= deleteZoneRect.top &&
                  touchLocation.clientY <= deleteZoneRect.bottom
                ) {
                  section.remove();
                  // store.dispatch("deleteSignature", {
                  //   pdfId: pdfId,
                  //   page: currentPageNumber.value,
                  //   position: {
                  //     x: touchLocation.clientX,
                  //     y: touchLocation.clientY,
                  //   },
                  // }).then(() =>{
                  // }
                  // );
                  showDeleteDiv.value = false;
                  return;
                }
              }

              // if (draggedSignatureMobile.value != null) {
              //   draggedSignatureMobile.value.remove();
              //   draggedSignatureMobile.value = null;
              // }
              console.log("touchend draggedSignatureMobile" , draggedSignatureMobile.value);
              imgMobile.src = draggedSignatureMobile.value?.children[0].src;
              section.appendChild(imgMobile);
              imgMobile.onload = () => {
                console.log("imgMobile.onload");
                section.style.position = "absolute";
                section.style.zIndex = "100";
                if (annot.length == 1) {
                  console.log("annot.length == 1");
                  
                  const canvasRect = canvas[showAllPages.value ? page-1 : 0].getBoundingClientRect();
                  section.style.top =Math.abs(touchLocation.clientY -canvasRect.top -(imgMobile.height * (200 / imgMobile.height)) / 4) +"px";
                  section.style.left =Math.abs(touchLocation.clientX -canvasRect.left -(imgMobile.width * (200 / imgMobile.width)) / 4) +"px";
                  annot[0].appendChild(section);
                } else {
                  if (save){
                  const canvasRect = canvas[showAllPages.value ? page : 0].getBoundingClientRect();
                  section.style.top =Math.abs(touchLocation.clientY -(canvasRect.top ) -(imgMobile.height * (200 / imgMobile.height)) / 4) +"px";
                  section.style.left =Math.abs(touchLocation.clientX -canvasRect.left -(imgMobile.width * (200 / imgMobile.width)) / 4) +"px";
                  annot[page].appendChild(section);
                //   store.dispatch("signPdf", {
                //   pdfId: pdfId,
                //   page: page+1,
                //   signature: imgMobile.src,
                //   position: {
                //     x: posX,
                //     y: posY,
                //   },
                // });
                }else{
                  const canvasRect = canvas[showAllPages.value ? page-1 : 0].getBoundingClientRect();
                  section.style.top =Math.abs(touchLocation.clientY -(canvasRect.top ) -(imgMobile.height * (200 / imgMobile.height)) / 4) +"px";
                  section.style.left =Math.abs(touchLocation.clientX -canvasRect.left -(imgMobile.width * (200 / imgMobile.width)) / 4) +"px";
                  annot[page-1].appendChild(section);
                }
                }
                if (textLayer) {
                  for (let i = 0; i < textLayer.length; i++) {
                    (textLayer[i] as HTMLElement).style.display = "";
                  }
                }
                showDeleteDiv.value = false;
              };
            });
  };
    
    const renderPdf = () => {
      
      currentPageNumber.value = currentPage.value;
      const canvas = document.getElementsByTagName("canvas");
      if (canvas) {
        const annotationLayer =
          document.getElementsByClassName("annotationLayer");
        for (let can = 0; can < canvas.length; can++) {
          (canvas[can]!.parentNode! as HTMLElement).ondragenter = dragenter;
          (canvas[can]!.parentNode! as HTMLElement).ondragleave = dragleave;
          (canvas[can]!.parentNode! as HTMLElement).ondragover = (e) => {
            e.preventDefault();
          };
          (canvas[can]!.parentNode! as HTMLElement).ondrop = (e: any) => {
            e.preventDefault();
            const annot = document.querySelectorAll(".annotationLayer");
            if (draggedSignature.value != null) {
              draggedSignature.value.remove();
              draggedSignature.value = null;
            }
            const data = e.dataTransfer?.getData("text/plain");
            const textLayer = document.getElementsByClassName("textLayer");
            const section = document.createElement("section");
            const img = document.createElement("img");
            section.style.position = "absolute";
            img.src = data as string;
            section.style.top =
              e.offsetY - (img.height * (200 / img.height)) / 4 + "px";
            section.style.left =
              e.offsetX - (img.width * (200 / img.width)) / 4 + "px";
            section.style.zIndex = "100";
            section.appendChild(img);
            img.style.maxWidth = img.width * (200 / img.width) + "px";
            img.style.maxHeight = img.height * (200 / img.width) + "px";
            img.onload = () => {
              annot[can].appendChild(section);
              if (textLayer) {
                for (let i = 0; i < textLayer.length; i++) {
                  (textLayer[i] as HTMLElement).style.display = "";
                }
              }
            };
            section.addEventListener("dragstart", (e: any) => {
              draggedSignature.value = section;
            });
            section.addEventListener("dragend", (e) => {
              draggedSignature.value = section;
            });
          };
        }
      }
      const images = document.getElementsByClassName("signature_item");
      const clientX = ref(0);
      const clientY = ref(0);
      const isDragging = ref(false);
      const draggedImg = document.createElement("img");
      if (images) {
        for (let i = 0; i < images.length; i++) {
          (images[i] as HTMLElement).ontouchstart = (e: any) => {
            clientX.value = e.touches[0].clientX;
            clientY.value = e.touches[0].clientY;
            draggedImg.src = (images[i].firstChild as HTMLImageElement)
              ?.src as string;
            draggedImg.style.maxWidth =
              draggedImg.width * (100 / draggedImg.width) + "px";
            draggedImg.style.maxHeight =
              draggedImg.height * (100 / draggedImg.width) + "px";
            draggedImg.style.position = "absolute";
            draggedImg.style.zIndex = "100";
            draggedImg.style.opacity = "0.5";
            draggedImg.style.top = e.touches[0].pageX + "px";
            draggedImg.style.left = e.touches[0].pageY + "px";
            draggedImg.style.pointerEvents = "none";
            document.body.appendChild(draggedImg);
            isDragging.value = true;
          };
          (images[i] as HTMLElement).ontouchmove = (e: any) => {
            if (isDragging.value) {
              const touch = e.touches[0];
              const x = touch.pageX - draggedImg.width / 2;
              const y = touch.pageY - draggedImg.height / 2;
              draggedImg.style.left = x + "px";
              draggedImg.style.top = y + "px";
            }
            e.preventDefault();
          };
          (images[i] as HTMLElement).ontouchend = (e: any) => {
            const touchLocation = e.changedTouches[0];
            showSignature(touchLocation.clientX,touchLocation.clientY,(images[i].firstChild as HTMLImageElement)?.src as string,currentPageNumber.value,true);
            isDragging.value = false;
            draggedImg.remove();
            e.preventDefault();
          };
        }
      }
    };
    const loadSignatures = () => {
      currentPageNumber.value = currentPage.value;
      if (PdfSignatures.length > 0) {
        for (let i = 0; i < PdfSignatures.length; i++) {
          if (PdfSignatures[i].pdfId == pdfId) {
            if(PdfSignatures[i].page == currentPageNumber.value && !showAllPages.value){
              showSignature(PdfSignatures[i].position.x,PdfSignatures[i].position.y,PdfSignatures[i].signature,PdfSignatures[i].page,false);
            }
            if(showAllPages.value){
              showSignature(PdfSignatures[i].position.x,PdfSignatures[i].position.y,PdfSignatures[i].signature,PdfSignatures[i].page,false);
            }
          }
        }
      }
    }
    const dragenter = () => {
      const textLayer = document.getElementsByClassName("textLayer");
      if (textLayer) {
        for (let i = 0; i < textLayer.length; i++) {
          (textLayer[i] as HTMLElement).style.display = "";
        }
      }
    };
    const dragleave = () => {
      const textLayer = document.getElementsByClassName("textLayer");
      if (textLayer) {
        for (let i = 0; i < textLayer.length; i++) {
          (textLayer[i] as HTMLElement).style.display = "none";
        }
      }
    };
    const sig = ref(0);
    const previousSignature = () => {
      if (sig.value === 0) {
        return;
      }
      sig.value -= 2;
      if (sig.value < 0) {
        sig.value = 0;
      }
      carousel();
    };
    const nextSignature = () => {
      if (store.getters.signatures.length - 2 <= sig.value) {
        return;
      }
      sig.value += 2;
      carousel();
    };
    const carousel = () => {
      const signatures = document.querySelectorAll(".signature_item");
      for (let i = 0; i < signatures.length; i++) {
        (signatures[i] as HTMLElement).style.display = "none";
      }
    };
    const OpenSignature = () => {
      openSignatureDiv.value = !openSignatureDiv.value;
      const signatures = document.getElementById("signatures");
      if (signatures) {
        if (openSignatureDiv.value == true) {
          signatures.style.display = "flex";
        } else {
          signatures.style.display = "none";
        }
      }
    };
    const DeleteSignature = () => {
      const alert = alertController.create({
        header: "Delete Signature",
        message: "Are you sure you want to delete this signature?",
        buttons: [
          {
            text: "Yes",
            handler: () => {
              store.dispatch("deleteSignatureFromPdf", {
                pdfId: pdfId,
                signature: deletedSig.value.signature,
              });
            },
          },
          {
            text: "No",
            handler: () => {
              return;
            },
          },
        ],
      });
    };

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
      offset,
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
      currentPageNumber,
      DeleteSignature,
      trashOutline,
      showDeleteDiv,
      caretBackOutline,
    };
  },
});
</script>

<style>
.vue-pdf-embed {
  width: 100% !important;
}
.vue-pdf-embed > div {
  box-shadow: 2px 2px 2px 2px rgb(159, 159, 159) !important;
  color: #555;
}
.butn {
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
.block {
  display: block;
}
.show_signature {
  display: block;
}
.hide_signature {
  display: none;
}
.sig-btn {
  background-color: transparent;
  margin: 20px;
}
.delete-droppable-zone {
  position: fixed;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 20%;
  background-color: #ff0000;
  opacity: 0.5;
  color: #fff;
}
</style>
