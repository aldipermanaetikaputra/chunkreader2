# chunk-reader2

Asynchronous, buffered, chunk-by-chunk file reader with customizable buffer size.

## Install

NPM

```sh
npm install chunk-reader2
```

yarn

```sh
yarn add chunk-reader2
```

## Usage

#### Import

ES6

```js
import { ChunkReader } from 'chunk-reader2';
```

CommonJS

```js
const { ChunkReader } = require('chunk-reader2');
```

#### Example

```js
const reader = new ChunkReader({
  filePath: './file.txt',
  bufferSize: 1024,
});

while (!reader.isClosed) {
  const chunk = await reader.read();
  console.log(chunk);
}
```

## API

#### `new ChunkReader(options: ChunkReaderOptions): ChunkReader`

The options you can pass are:

| Name                   | Type      | Default | Description                                                                                                                                         |
| ---------------------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------ | ------- | -------- | -------- | -------- | ------ | -------- | ----------------------------------------------- |
| filePath               | `string`  | none    | The path or location of your file _(required)_                                                                                                      |
| bufferSize             | `number`  | `1024`  | Chunk/buffer size in bytes                                                                                                                          |
| bufferEncoding         | `'ascii'  | 'utf8'  | 'utf-8'                                                                                                                                             | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'latin1' | 'binary' | 'hex'` | `'utf8'` | Character encoding to use on `read()` operation |
| removeInvisibleUnicode | `boolean` | `false` | Remove all (or perhaps just "common") non-printable Unicode characters except line breaks. Using regex: `/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g` |

### Instance Methods

#### `read(): Promise<string>`

Asynchronously read next chunk of current file stream.

Example:

```js
const reader = new ChunkReader({
  filePath: './file.txt',
  bufferSize: 8,
});

while (!reader.isClosed) {
  const chunk = await reader.read();
  console.log(chunk);
}
```

`./file.txt`

```txt
aaaabbbbccccddddeeeeffffgggghhhhiiiijjjjkkkkllllmmmmnnnnoooo
```

Output:

```
aaaabbbb
ccccdddd
eeeeffff
gggghhhh
iiiijjjj
kkkkllll
mmmmnnnn
oooo
```

**NOTE:** This method can be called concurrently with safe because it used [async-mutex](https://github.com/DirtyHairy/async-mutex) module to handle Mutual Exclusion.

#### `reset(): void`

Reset the reader, so it will repeat the reading from the beginning.

Example:

```js
const reader = new ChunkReader({
  filePath: './file.txt',
  bufferSize: 1,
});

for (let i = 0; i < 2; i++) {
  const chunk = await reader.read();
  console.log(chunk);
}

console.log('reset');
reader.reset();

while (!reader.isClosed) {
  const chunk = await reader.read();
  console.log(chunk);
}
```

`./file.txt`

```txt
12345
```

Output:

```
1
2
reset
1
2
3
4
5
```

#### `open(): void`

Manually open the file descriptor and get `bytesLength`. This method will be called automatically on the first `read()` operation. Throws an error when file doesn't exist.

#### `close(): void`

Manually close the file descriptor. This method will be called automatically on the last `read()` operation (last file stream).

### Instance Property

The property of `ChunkReader` instance you can access are:

| Name        | Type      | Description                                                                   |
| ----------- | --------- | ----------------------------------------------------------------------------- |
| bytesLength | `number`  | Size of the file in bytes. Value assigned on `open()` operation               |
| bytesRead   | `number`  | Size of the bytes read in the file by `read()` operation                      |
| readCount   | `number`  | Count of `read()` operation called                                            |
| isOpened    | `boolean` | Indicates whether the reader has opened the file or `open()` has been called  |
| isClosed    | `boolean` | Indicates whether the reader has closed the file or `close()` has been called |

## Testing

This library is well tested. You can test the code as follows:

NPM

```sh
npm test
```

yarn

```sh
yarn test
```

## Related

- [line-reader2](https://github.com/aldipermanaetikaputra/line-reader2) - Asynchronous, buffered, line-by-line file reader with customizable buffer size and separator.

## Contribute

If you have anything to contribute, or functionality that you lack - you are more than welcome to participate in this!

## License

Feel free to use this library under the conditions of the MIT license.
