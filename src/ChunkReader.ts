import fs from 'fs';
import util from 'util';

export interface ChunkReaderOptions {
  filePath: string;
  bufferEncoding?: BufferEncoding;
  bufferSize?: number;
  removeInvisibleUnicode?: boolean;
}

const readAsync = util.promisify(fs.read);

class ChunkReader {
  // eslint-disable-next-line no-control-regex
  static INVISIBLE_UNICODE_REGEX = /[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g;

  private fileClosed: boolean;
  private fileDescriptor?: number;
  private removeInvisibleUnicode?: boolean;

  public bufferEncoding: BufferEncoding;
  public filePath: string;
  public bufferSize: number;
  public bytesLength: number;
  public bytesRead: number;
  public readCount: number;

  public get isOpened() {
    return !!this.fileDescriptor;
  }

  public get isClosed() {
    return this.fileClosed;
  }

  constructor(options: ChunkReaderOptions) {
    this.filePath = options.filePath;
    this.bufferEncoding = options.bufferEncoding || 'utf-8';
    this.bufferSize = options.bufferSize || 1024;
    this.removeInvisibleUnicode = options.removeInvisibleUnicode;
    this.bytesLength = 0;
    this.bytesRead = 0;
    this.readCount = 0;
    this.fileClosed = false;
  }

  private async next() {
    let buffer = Buffer.alloc(this.bufferSize);

    if (!this.fileDescriptor) this.open();
    if (!this.fileDescriptor) return buffer.slice(0, 0);

    const { bytesRead } = await readAsync(
      this.fileDescriptor,
      buffer,
      0,
      this.bufferSize,
      this.bytesRead
    );

    if (bytesRead < this.bufferSize) {
      buffer = buffer.slice(0, bytesRead);
    }

    return buffer;
  }

  public open() {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`File is not found [${this.filePath}]`);
    }

    this.fileDescriptor = fs.openSync(this.filePath, 'r');
    this.bytesLength = fs.statSync(this.filePath).size;

    if (!this.bytesLength) this.close();
  }

  public reset() {
    this.readCount = 0;
    this.bytesRead = 0;
    this.fileClosed = false;
  }

  public close() {
    this.fileClosed = true;
    if (this.fileDescriptor) {
      fs.closeSync(this.fileDescriptor);
      delete this.fileDescriptor;
    }
  }

  public async read() {
    if (this.fileClosed) {
      throw new Error(`Entire bytes in file has been read [${this.filePath}]`);
    }

    const data = await this.next();

    this.bytesRead += data.length;
    this.readCount += 1;

    if (this.bytesRead === this.bytesLength) {
      this.close();
    }

    let string = data.toString(this.bufferEncoding);

    // Removing all (or perhaps just "common") non-printable Unicode characters - except line breaks
    if (this.removeInvisibleUnicode) {
      string = string.replace(ChunkReader.INVISIBLE_UNICODE_REGEX, '');
    }

    return string;
  }
}

export default ChunkReader;
