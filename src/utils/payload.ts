import { ByteArrayUtils } from "./ByteArrayUtils";
import Base64 from "base64-js";
import {
  ALLOWED_CHARACTERS,
  LETTERS_HEX_BITMAPS,
  SupportedLetter,
} from "./constants";

const HEADER = "77616E670000";
const FLASH = "00";
const MARQUEE = "00";
const MODES = "00" + "00" + "00" + "00" + "00" + "00" + "00" + "00";

// const SIZES =
//   "0001" + "0000" + "0000" + "0000" + "0000" + "0000" + "0000" + "0000";

const PADDING1 = "000000000000";

// const TIMESTAMP = "E803160D2610";

const PADDING2 = "00000000";

const SEPARATOR = "00000000000000000000000000000000";

// export const PAYLOAD = "00386CC6C6FEC6C6C6C600";
export const PAYLOAD = "007CC6C6C0C0C0C6C67C00";

const PADDING3 = "0000000000";

const PAYLOAD_SIZE_IN_BYTES = 16;

const BYTES_IN_ONE_HEX = 2;

const HEX_CHARACTERS_PER_CHUNK = PAYLOAD_SIZE_IN_BYTES * BYTES_IN_ONE_HEX;

const MAX_BITMAPS_NUMBER = 8;

// export const BADGE_PACKET =
//   HEADER +
//   FLASH +
//   MARQUEE +
//   MODES +
//   SIZES +
//   PADDING1 +
//   TIMESTAMP +
//   PADDING2 +
//   SEPARATOR +
//   PAYLOAD +
//   PADDING3;

export function getPackets(text: string): string[] {
  const hexString = buildDataHexString(text);
  const chunks = splitHexStringIntoChunks(hexString);

  return chunks
    .map((chunk) => ByteArrayUtils.hexStringToByteArray(chunk))
    .map((bytes) => Base64.fromByteArray(bytes));
}

function buildDataHexString(letters: string): string {
  const payload = getLetterBitmaps(letters).join("");
  const size = getSize(letters);
  const timestamp = getTimestamp();

  return (
    HEADER +
    FLASH +
    MARQUEE +
    MODES +
    size +
    PADDING1 +
    timestamp +
    PADDING2 +
    SEPARATOR +
    payload
  );
}

function getLetterBitmaps(letters: string): string[] {
  const hexBitmaps: string[] = [];
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];

    if (isSupportedLetter(letter)) {
      const bitmap = LETTERS_HEX_BITMAPS[letter];
      hexBitmaps.push(bitmap);
    }
  }

  return hexBitmaps;
}

function getSize(letters: string): string {
  const size = letters.length;
  const firstBitmapSize = size.toString(16).padStart(4, "0");

  return firstBitmapSize + "0000".repeat(MAX_BITMAPS_NUMBER - 1);
}

function getTimestamp(): string {
  const currentDate = new Date();
  const year = currentDate.getUTCFullYear();
  const month = currentDate.getUTCMonth() + 1; // JavaScript months are 0-indexed
  const day = currentDate.getUTCDate();
  const hours = currentDate.getUTCHours();
  const minutes = currentDate.getUTCMinutes();
  const seconds = currentDate.getUTCSeconds();

  const data = new Uint8Array(6);
  data[0] = year & 0xff;
  data[1] = month & 0xff;
  data[2] = day & 0xff;
  data[3] = hours & 0xff;
  data[4] = minutes & 0xff;
  data[5] = seconds & 0xff;

  return ByteArrayUtils.byteArrayToHexString(data);
}

function splitHexStringIntoChunks(hexString: string): string[] {
  const chunks = hexString.match(/.{1,32}/g) || [];

  return chunks.map((chunk) => chunk.padStart(HEX_CHARACTERS_PER_CHUNK, "0"));
}

function isSupportedLetter(letter: string): letter is SupportedLetter {
  return ALLOWED_CHARACTERS.includes(letter);
}