import mitt from 'mitt';

export const emitter = mitt();
emitter.on("*", (type, event) => {
  // console.log(`%c${type}: %o`, "color: #ff00a0", event);
});
