<template> 
    <div>
        <ion-list class="center">
            <ion-item>
                <ion-button @click="save">Save</ion-button>
                <ion-button @click="undo">Undo</ion-button>
            </ion-item>
        </ion-list>
        <VueSignaturePad ref="signaturePad" class="sig" />
    </div>
</template>

<script lang="js">
import { defineComponent, ref  } from 'vue'
import { VueSignaturePad } from 'vue-signature-pad';
import { IonList ,IonButton ,IonItem} from '@ionic/vue';

export default defineComponent({
    components: {
        VueSignaturePad,
        IonList,
        IonButton,
        IonItem,
    },
    mounted () {
        const signaturePad = this.$refs.signaturePad;
        signaturePad.undoSignature();
        console.log(this.refs);
    },
    methods: {
        save () {
            console.log('save');
            console.log(this.$refs);
            const signaturePad = this.$refs.signaturePad;
            const data = signaturePad.saveSignature();
            console.log(data);
        },
        undo () {
            const signaturePad = this.$refs.signaturePad;
            signaturePad.undoSignature();
        }
    },
    data () {
        return {
           

        }
    }
})
</script>

<style scoped>
    .center {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .sig {
        border: 1px solid #000;
        height: 100%;
        width: 100%;
    }
</style>