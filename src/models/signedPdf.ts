export class SignedPdf{
    idPdf: string;
    signature: string;
    page: number;
    position: {
        x: number;
        y: number;
    };
    constructor(idPdf: string, signature: string, page: number, position: {x: number, y: number}){
        this.idPdf = idPdf;
        this.signature = signature;
        this.page = page;
        this.position = position;
    }
}