// src/engine/dither/threshold.ts
export function adaptiveThreshold(
  imgData: ImageData,
  palette: number[][],
  radius = 4
): ImageData {
  const { width: w, height: h, data } = imgData;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;

          const j = (ny * w + nx) * 4;
          sum += (data[j] + data[j + 1] + data[j + 2]) / 3;
          count++;
        }
      }

      const localMean = sum / (count || 1);

      const i = (y * w + x) * 4;
      const cur = (data[i] + data[i + 1] + data[i + 2]) / 3;

      const c = cur > localMean ? palette[palette.length - 1] : palette[0];
      data[i] = c[0];
      data[i + 1] = c[1];
      data[i + 2] = c[2];
      data[i + 3] = 255;
    }
  }

  return imgData;
}

export function meanThreshold(
  imgData: ImageData,
  palette: number[][]
): ImageData {
  const {data}=imgData;
  let sum=0,count=0;
  for(let i=0;i<data.length;i+=4){
    sum+=(data[i]+data[i+1]+data[i+2])/3;
    count++;
  }
  const mean=sum/count;

  for(let i=0;i<data.length;i+=4){
    const v=(data[i]+data[i+1]+data[i+2])/3;
    const c=v>mean?palette[1]:palette[0];
    data[i]=c[0];data[i+1]=c[1];data[i+2]=c[2];
  }
  return imgData;
}

