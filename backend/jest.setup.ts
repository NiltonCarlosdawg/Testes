/* eslint-disable @typescript-eslint/ban-ts-comment */
// jest.setup.ts
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
// @ts-expect-error
global.TextDecoder = TextDecoder;