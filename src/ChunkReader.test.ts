import fs from 'fs';
import tmp from 'tmp';
import ChunkReader from './ChunkReader.js';

const file = tmp.fileSync();

afterAll(() => {
  file.removeCallback();
});

describe('Reading Test', () => {
  it('should be able to read a whole data file', async () => {
    const fileSize = 120;
    const bufferSize = 100;
    const inputData = '0'.repeat(fileSize);

    fs.writeFileSync(file.name, inputData);

    const inputReader = new ChunkReader({
      filePath: file.name,
      bufferSize: bufferSize,
    });

    let dataRead = '';
    while (inputReader.isClosed === false) {
      dataRead += await inputReader.read();
    }

    expect(inputReader.isClosed).toBe(true);
    expect(inputReader.readCount).toBe(Math.ceil(fileSize / bufferSize));
    expect(dataRead).toBe(inputData);
  });

  it('should be able to read a empty data file', async () => {
    const fileSize = 0;
    const bufferSize = 100;
    const inputData = '0'.repeat(fileSize);

    fs.writeFileSync(file.name, inputData);

    const inputReader = new ChunkReader({
      filePath: file.name,
      bufferSize: bufferSize,
    });

    let dataRead = '';
    while (inputReader.isClosed === false) {
      dataRead += await inputReader.read();
    }

    expect(inputReader.isClosed).toBe(true);
    expect(inputReader.readCount).toBe(1);
    expect(dataRead).toBe(inputData);
  });

  it('should be able to read a whole data file less than chunk size', async () => {
    const fileSize = 65;
    const bufferSize = 100;
    const inputData = '0'.repeat(fileSize);

    fs.writeFileSync(file.name, inputData);

    const inputReader = new ChunkReader({
      filePath: file.name,
      bufferSize: bufferSize,
    });

    let dataRead = '';
    while (inputReader.isClosed === false) {
      dataRead += await inputReader.read();
    }

    expect(inputReader.isClosed).toBe(true);
    expect(inputReader.readCount).toBe(Math.ceil(fileSize / bufferSize));
    expect(dataRead).toBe(inputData);
  });

  it('should be able to read a whole big data file', async () => {
    const fileSize = 2e8;
    const bufferSize = 2.5e7;
    const inputData = '0'.repeat(fileSize);

    fs.writeFileSync(file.name, inputData);

    const inputReader = new ChunkReader({
      filePath: file.name,
      bufferSize: bufferSize,
    });

    let dataRead = '';
    while (inputReader.isClosed === false) {
      dataRead += await inputReader.read();
    }

    expect(inputReader.isClosed).toBe(true);
    expect(inputReader.readCount).toBe(Math.ceil(fileSize / bufferSize));
    expect(dataRead).toBe(inputData);
  });

  it('should be able to read a whole big data file and reset then try reading again', async () => {
    const fileSize = 2e8;
    const bufferSize = 2.5e7;
    const inputData = '0'.repeat(fileSize);

    fs.writeFileSync(file.name, inputData);

    const inputReader = new ChunkReader({
      filePath: file.name,
      bufferSize: bufferSize,
    });

    let dataRead = '';
    while (inputReader.isClosed === false) {
      dataRead += await inputReader.read();
    }

    expect(inputReader.isClosed).toBe(true);
    expect(inputReader.readCount).toBe(Math.ceil(fileSize / bufferSize));
    expect(dataRead).toBe(inputData);

    inputReader.reset();

    expect(inputReader.isClosed).toBe(false);
    expect(inputReader.readCount).toBe(0);
    expect(inputReader.bytesRead).toBe(0);

    let dataRead2 = '';
    while ((inputReader.isClosed as boolean) === false) {
      dataRead2 += await inputReader.read();
    }

    expect(inputReader.isClosed).toBe(true);
    expect(inputReader.readCount).toBe(Math.ceil(fileSize / bufferSize));
    expect(dataRead2).toBe(inputData);
  });
});

describe('Error Handling', () => {
  it('should throw error when file is not found', async () => {
    const reader = new ChunkReader({
      filePath: './undefined',
      bufferSize: 100,
    });
    await expect(reader.read()).rejects.toThrowError('File is not found');
  });

  it('should throw error when read on done reader', async () => {
    const fileSize = 120;
    const bufferSize = 100;
    const inputData = '0'.repeat(fileSize);

    fs.writeFileSync(file.name, inputData);

    const inputReader = new ChunkReader({
      filePath: file.name,
      bufferSize: bufferSize,
    });

    while (inputReader.isClosed === false) {
      await inputReader.read();
    }

    expect(inputReader.isClosed).toBe(true);
    await expect(inputReader.read()).rejects.toThrowError('Entire bytes in file has been read');
  });
});
