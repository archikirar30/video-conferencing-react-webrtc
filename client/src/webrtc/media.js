export const getCameraStream = async () => {
  return await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });
};
