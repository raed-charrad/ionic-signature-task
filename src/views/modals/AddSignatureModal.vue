<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button color="medium" @click="cancel">Cancel</ion-button>
      </ion-buttons>
      <ion-title>Modal</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="confirm">Confirm</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-item>
      <ion-label position="stacked">Name</ion-label>
      <ion-input v-model="name" placeholder="Your name"></ion-input>
    </ion-item>
    <ion-item>
      <ion-label position="stacked">signature</ion-label>
    </ion-item>
    <ion-item class="item-pad">
      <VueSignaturePad
        ref="signaturePad"
        class="sig"
        :options="{
          onBegin: () => {
            $refs.signaturePad.resizeCanvas();
          },
        }"
      />
    </ion-item>
    <ion-list class="center">
      <ion-item>
        <ion-button @click="save">Save</ion-button>
        <ion-button @click="undo">Undo</ion-button>
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<script>
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  modalController,
  toastController,
  IonList
} from "@ionic/vue";
import { defineComponent, ref } from "vue";
import { VueSignaturePad } from "vue-signature-pad";
import store from "@/store";
import { save } from "ionicons/icons";

export default defineComponent({
  name: "ModalPage",
  components: {
    IonList,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    VueSignaturePad,
  },
  methods: {
    cancel() {
      return modalController.dismiss(null, "cancel");
    },
    confirm() {
      const signaturePad = this.$refs.signaturePad;

      if (this.name != "" && !signaturePad.isEmpty) {
        save();
      } else {
        const toast = toastController.create({
          message: "Please enter your signature",
          duration: 2000,
        });
        toast.then((toast) => {
          toast.present();
        });
      }
    },
    cropBase64Image(base64String) {
      // Create an Image object from the base64 string
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64String;
        img.onload = function () {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let left = canvas.width;
          let right = 0;
          let top = canvas.height;
          let bottom = 0;
          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              const i = (y * canvas.width + x) * 4;
              if (imageData.data[i + 3] !== 0) {
                left = Math.min(left, x);
                right = Math.max(right, x);
                top = Math.min(top, y);
                bottom = Math.max(bottom, y);
              }
            }
          }
          const croppedCanvas = document.createElement("canvas");
          const croppedCtx = croppedCanvas.getContext("2d");
          const croppedWidth = right - left + 1;
          const croppedHeight = bottom - top + 1;
          croppedCanvas.width = croppedWidth;
          croppedCanvas.height = croppedHeight;
          croppedCtx.drawImage(
            canvas,
            left,
            top,
            croppedWidth,
            croppedHeight,
            0,
            0,
            croppedWidth,
            croppedHeight
          );
          const croppedBase64String = croppedCanvas
            .toDataURL("image/png");
          resolve(croppedBase64String);
        };
        img.onerror = function () {
          reject(new Error("Invalid base64 string."));
        };
        img.src = `data:image/png;base64,${base64String}`;
      });
    },

    async save() {
      const signaturePad = this.$refs.signaturePad;
      const datas = signaturePad.saveSignature();
      const cleared = await this.cropBase64Image(datas.data.split(",")[1]);
      if (!signaturePad.isEmpty()) {
        if (this.name) {
          const signature = cleared;
          this.$emit("signature", signature);
          try {
            store.dispatch("saveSignature", { name: this.name, signature });
            const toast = toastController.create({
              message: "Signature saved",
              duration: 2000,
            });
            toast.then((toast) => {
              toast.present();
            });
            return modalController.dismiss(this.name, "confirm");
          } catch (error) {
            const toast = toastController.create({
              message: "Error saving signature",
              duration: 2000,
            });
            toast.then((toast) => {
              toast.present();
            });
          }
        }
      } else {
        const toast = toastController.create({
          message: "Please enter your signature",
          duration: 2000,
        });
        toast.then((toast) => {
          toast.present();
        });
      }
    },
    undo() {
      const signaturePad = this.$refs.signaturePad;
      if (!signaturePad.isEmpty()) {
        signaturePad.undoSignature();
      } else {
        const toast = toastController.create({
          message: "Nothing to undo",
          duration: 2000,
        });
        toast.then((toast) => {
          toast.present();
        });
      }
    },
  },
  setup() {
    const name = ref("");
    const signaturePad = ref(null);
    return {
      name,
      signaturePad,
    };
  },
});
</script>
<style>
ion-modal {
  --width: 90%;
  --height: 60%;
  --border-radius: 16px;
  --box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
}

ion-modal::part(backdrop) {
  background: rgba(209, 213, 219);
  opacity: 1;
}

ion-modal ion-toolbar {
  --background: rgb(14 116 144);
  --color: white;
}
.sig {
  border: 1px solid #000;
  height: 150px !important;
  width: 100%;
  display: block;
}
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.item-pad ion-item::part(native) {
  height: 150px;
}
</style>
