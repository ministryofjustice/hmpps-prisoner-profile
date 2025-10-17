// should return a stream/writable, but can’t really have that in the browser
// however a bunyan logger’s stream can be undefined
export default function bunyanFormat(): undefined {
  return undefined
}
