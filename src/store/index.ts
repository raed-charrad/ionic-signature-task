import { createStore } from 'vuex'
const store = createStore({
    state() {
        return {
            signatures: [
                {
                    id: '1',
                    name: 'John Doe',
                    signature: 'John Doe',
                },
                {
                    id: '2',
                    name: 'Jane Doe',
                    signature: 'Jane Doe',
                },
            ],
        }
    },
    mutations: {
        saveSignature(state, signature) {
            const signatureObj = {
                id: new Date().toISOString(),
                name: signature.name,
                signature: signature.signature,
            }
            state.signatures.unshift(signatureObj)
        }
    },
    actions: {
        saveSignature(context, signature) {
            context.commit('saveSignature', signature)
        }
    },
    getters: {
        signatures(state) {
            return state.signatures
        },
        signature(state) {
            return (signatureId : string) => {
                return state.signatures.find((signature) => signature.id === signatureId)
            }
        }
    }
})
export default store