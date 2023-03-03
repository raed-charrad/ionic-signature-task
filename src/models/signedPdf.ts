export class SignedPdf{
    pdfId: string;
    signature: string;
    page: number;
    position: {
        x: number;
        y: number;
    };
    constructor(pdfId: string, signature: string, page: number, position: {x: number, y: number}){
        this.pdfId = pdfId;
        this.signature = signature;
        this.page = page;
        this.position = position;
    }
}