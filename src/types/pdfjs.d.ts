// Minimal module declarations to satisfy TypeScript for pdfjs-dist imports
declare module 'pdfjs-dist/legacy/build/pdf' {
  const pdfjsLib: any;
  export = pdfjsLib;
}

declare module 'pdfjs-dist' {
  const pdfjsLib: any;
  export = pdfjsLib;
}

declare module 'pdfjs-dist/build/pdf.worker' {
  const worker: any;
  export = worker;
}
