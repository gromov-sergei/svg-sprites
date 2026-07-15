declare module 'pngjs' {
  export class PNG {
    data: Buffer
    static sync: {
      read(buffer: Buffer): PNG
    }
  }
}
