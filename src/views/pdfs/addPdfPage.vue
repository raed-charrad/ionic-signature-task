<template>
    <ion-page>
        <form class="ion-padding" @submit.prevent="submitForm">
        <ion-list>
          <ion-item>
            <ion-label position="floating">Title</ion-label>
            <ion-input type="text" required v-model="enteredTitle" />
          </ion-item>
          <ion-item>
    
              <ion-label position="floating">Image</ion-label>
            </ion-item>
            <input type="file" required @change="handleFileChange($event)" accept="application/pdf" />
          <ion-item>
            <ion-label position="floating">Description</ion-label>
            <ion-textarea rows:5 v-model="enteredDescription"></ion-textarea>
          </ion-item>
        </ion-list>
        <ion-button type="submit" expand="block">Save</ion-button>
      </form>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import {
IonList,
IonItem,
IonLabel,
IonInput,
IonTextarea,
IonButton,
IonPage,
} from "@ionic/vue";
import { useRoute } from 'vue-router';
import store from '@/store';
import router from '@/router';
export default defineComponent({
components: {
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButton,
    IonPage,
},
setup () {
    const route = useRoute();
    const enteredTitle = ref('');
    const enteredFile = ref('');
    const enteredDescription = ref('');
    const readerfile = ref<string | ArrayBuffer | null>('');
    const toBase64 = (file : any) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = ()=>{
            readerfile.value = reader.result;
        }
        reader.readAsDataURL(file);
        reader.onerror = error => {
            console.log("'Error: ', error");
        }
    };
    const submitForm = () => {
        // toBase64(enteredFile.value);
        const pdfData = {
            name: enteredTitle.value,
            url: readerfile.value,
            description: enteredDescription.value,
        };
        store.dispatch('addPdf', pdfData);
        enteredTitle.value = '';
        enteredFile.value = '';
        enteredDescription.value = '';
        router.replace('/list')
    };
    const handleFileChange = (e : any) => {
        const file = e.target.files[0];
        enteredFile.value = file;
        toBase64(enteredFile.value);
    };
    return {
        enteredTitle,
        enteredFile,
        enteredDescription,
        submitForm,
        handleFileChange,
        toBase64,
    }
}
})
</script>

<style scoped>
</style>